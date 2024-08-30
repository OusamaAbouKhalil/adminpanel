import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { GeoPoint, updateDoc, doc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { Header, Map, ScheduleTable } from "../components";
import CategoriesForm from "../components/Form/CategoriesForm";
import { useGetRestaurantById } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";

function Edit() {
  const { id } = useParams();
  const { data: restaurant, isPending: isLoading, error } = useGetRestaurantById(id);
  const [progress, setProgress] = useState(0);
  const [userUpdatingComplete, setUserUpdatingComplete] = useState(false);
  const mainImageRef = useRef(null);
  const bgImageRef = useRef(null);
  const [categoriesForm, setCategoriesForm] = useState([]);
  const [subCategoriesForm, setSubCategoriesForm] = useState([]);
  const [images, setImages] = useState({
    main_image: null,
    bg_image: null,
  });
  const [schedule, setSchedule] = useState({});
  const [formData, setFormData] = useState({
    Category: [],
    isClosed: false,
    bg_image: "",
    likes: [],
    location: new GeoPoint(33.26968841037753, 35.20611613326288),
    main_image: "",
    rating: 0,
    rest_name: "",
    sub_categories: [],
    time: "",
    title: [],
    mapLink: "",
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 33.26968841037753,
    lng: 35.20611613326288,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        Category: restaurant.Category || [],
        isClosed: restaurant.isClosed || false,
        bg_image: restaurant.bg_image || "",
        likes: restaurant.likes || [],
        location: restaurant.location ? new GeoPoint(restaurant.location._lat, restaurant.location._long) : new GeoPoint(33.26968841037753, 35.20611613326288),
        main_image: restaurant.main_image || "",
        rating: restaurant.rating || 0,
        rest_name: restaurant.rest_name || "",
        sub_categories: restaurant.sub_categories || [],
        time: restaurant.time || "",
        title: restaurant.title || [],
        mapLink: restaurant.mapLink || "",
      });
      setSchedule(restaurant.hours || {}); // Ensure hours is always an object
      setMarkerPosition({
        lat: restaurant.location ? restaurant.location._lat : 33.26968841037753,
        lng: restaurant.location ? restaurant.location._long : 35.20611613326288,
      });
      setCategoriesForm(restaurant.Category || []);
      setSubCategoriesForm(restaurant.sub_categories || []);
      setImages({
        main_image: restaurant.main_image || "",
        bg_image: restaurant.bg_image || "",
      });
    }
  }, [restaurant]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleSelectChange = (e) => {
    const clickedOption = e.target.value;
    setFormData(prevState => ({
      ...prevState,
      title: prevState.title.includes(clickedOption)
        ? prevState.title.filter(title => title !== clickedOption)
        : [...prevState.title, clickedOption],
    }));
    setIsDirty(true);
  };

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setFormData(prevState => ({
      ...prevState,
      location: new GeoPoint(lat, lng),
      mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
    }));
    setIsDirty(true);
  }, []);

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({
        ...prev,
        [e.target.name]: file,
      }));
      setIsDirty(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === "isClosed" ? checked : value,
    }));
    setIsDirty(true);
  };

  const handleCategoryChange = (index, value, isSubCategory = false) => {
    if (value === '') {
      (isSubCategory ? setSubCategoriesForm : setCategoriesForm)(prev => {
        const newCategories = [...prev];
        newCategories.splice(index, 1);
        return newCategories;
      });
    } else {
      (isSubCategory ? setSubCategoriesForm : setCategoriesForm)(prev => {
        const newCategories = [...prev];
        newCategories[index] = value;
        return newCategories;
      });
    }
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonDisabled(true);
    try {
      setProgress(20);
      let mainImageUrl;
      let bgImageUrl;
      if (images.main_image) {
        mainImageUrl = await uploadImage(images.main_image);
      }
      setProgress(50);
      if (images.bg_image) {
        bgImageUrl = await uploadImage(images.bg_image);
      }
      setProgress(70);
      await updateDoc(doc(fsdb, "restaurants", id), {
        ...formData,
        Category: categoriesForm,
        sub_categories: subCategoriesForm,
        main_image: mainImageUrl || formData.main_image,
        bg_image: bgImageUrl || formData.bg_image,
        hours: schedule,
      });
      setProgress(100);
      setUserUpdatingComplete(true);
    } catch (error) {
      console.error("Error updating document:", error);
    } finally {
      setButtonDisabled(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex justify-center">
        <div className="w-full md:w-3/4 lg:w-2/4">
          <h1 className="text-2xl font-bold mb-4">Edit Restaurant</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CategoriesForm
              categories={categoriesForm}
              subCategories={subCategoriesForm}
              handleCategoryChange={handleCategoryChange}
            />
            <ScheduleTable
              schedule={schedule || {}}
              onChange={setSchedule}
            />
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="main_image">
                Main Image
              </label>
              <input
                type="file"
                name="main_image"
                onChange={handleFileInputChange}
                ref={mainImageRef}
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="bg_image">
                Background Image
              </label>
              <input
                type="file"
                name="bg_image"
                onChange={handleFileInputChange}
                ref={bgImageRef}
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
            {isLoaded && (
              <Map
                center={markerPosition}
                onMapClick={onMapClick}
              />
            )}
            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={buttonDisabled || !isDirty}
            >
              {buttonDisabled ? 'Updating...' : 'Update Restaurant'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default Edit;
