import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { GeoPoint, updateDoc, doc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { Header, Map } from "../components";
import { restaurantGrid } from "../data/dummy";
import CategoriesForm from "../components/Form/CategoriesForm";
import { useGetRestaurantById } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";

function Edit() {
  const { id } = useParams();
  const { data: restaurant, isPending: isLoading, error } = useGetRestaurantById(id);
  console.log(restaurant);
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


  const [hours, setHours] = useState({
    Monday: [{ openingTime: "", closingTime: "" }],
    Tuesday: [{ openingTime: "", closingTime: "" }],
    Wednesday: [{ openingTime: "", closingTime: "" }],
    Thursday: [{ openingTime: "", closingTime: "" }],
    Friday: [{ openingTime: "", closingTime: "" }],
    Saturday: [{ openingTime: "", closingTime: "" }],
    Sunday: [{ openingTime: "", closingTime: "" }],
  });

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
    hours: []
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 33.26968841037753,
    lng: 35.20611613326288,
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        Category: restaurant.Category,
        isClosed: restaurant.isClosed,
        bg_image: restaurant.bg_image,
        likes: [],
        location: new GeoPoint(restaurant.location._lat, restaurant.location._long),
        main_image: restaurant.main_image,
        rating: restaurant.rating,
        rest_name: restaurant.rest_name,
        sub_categories: restaurant.sub_categories,
        time: restaurant.time,
        title: restaurant.title,
        mapLink: restaurant.mapLink,
        hours: restaurant.hours || {
          Monday: [{ openingTime: "", closingTime: "" }],
          Tuesday: [{ openingTime: "", closingTime: "" }],
          Wednesday: [{ openingTime: "", closingTime: "" }],
          Thursday: [{ openingTime: "", closingTime: "" }],
          Friday: [{ openingTime: "", closingTime: "" }],
          Saturday: [{ openingTime: "", closingTime: "" }],
          Sunday: [{ openingTime: "", closingTime: "" }],
        },
      });
      setMarkerPosition({ lat: restaurant.location._lat, lng: restaurant.location._long });
      setCategoriesForm(restaurant.Category.map((category) => (category)) || []);
      setSubCategoriesForm(restaurant.sub_categories.map((category) => (category)) || []);
      setImages({
        main_image: restaurant.main_image,
        bg_image: restaurant.bg_image,
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
  };

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setFormData(prevState => ({
      ...prevState,
      location: new GeoPoint(lat, lng),
    }));
  }, []);

  const handleHoursChange = (day, index, field, value) => {
    setHours(prevHours => {
      const updatedHours = { ...prevHours };
      const dayHours = updatedHours[day] || [];
      dayHours[index] = { ...dayHours[index], [field]: value };
      updatedHours[day] = dayHours;
      return updatedHours;
    });
  };

  const handleAddPeriod = (day) => {
    setFormData(prevState => {
      const updatedHours = { ...prevState.hours };
      if (!updatedHours[day]) {
        updatedHours[day] = [];
      }
      updatedHours[day].push({ openingTime: "", closingTime: "" });
      return { ...prevState, hours: updatedHours };
    });
  };

  const handleRemovePeriod = (day, index) => {
    setFormData(prevState => {
      const updatedHours = { ...prevState.hours };
      updatedHours[day].splice(index, 1);
      return { ...prevState, hours: updatedHours };
    });
  };
  // Render hours fields
  const renderHoursFields = () => (
    Object.keys(formData.hours).map(day => (
      <div key={day}>
        <h3>{day}</h3>
        {(Array.isArray(formData.hours[day]) ? formData.hours[day] : []).map((period, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Opening Time"
              value={period.openingTime || ""}
              onChange={(e) => handleHoursChange(day, index, "openingTime", e.target.value)}
            />
            <input
              type="text"
              placeholder="Closing Time"
              value={period.closingTime || ""}
              onChange={(e) => handleHoursChange(day, index, "closingTime", e.target.value)}
            />
            <button onClick={() => handleRemovePeriod(day, index)}>Remove</button>
          </div>
        ))}
        <button onClick={() => handleAddPeriod(day)}>Add Period</button>
      </div>
    ))
  );

  const handleImageChange = (event, type) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImages(prevImages => ({
        ...prevImages,
        [type]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProgress(20);
      let mainImageUrl;
      let bgImageUrl;

      if (images.main_image) {
        mainImageUrl = await uploadImage(images.main_image);
      }
      setProgress(60);
      if (images.bg_image) {
        bgImageUrl = await uploadImage(images.bg_image);
      }
      setProgress(80);

      const collectionRef = doc(fsdb, "restaurants", id);
      console.log({ ...formData, hours });

      await updateDoc(collectionRef, {
        ...formData,
        main_image: images.main_image ? mainImageUrl : formData.main_image,
        bg_image: images.bg_image ? bgImageUrl : formData.bg_image,
        Category: categoriesForm.map((item) => item.trim()),
        sub_categories: subCategoriesForm.map((item) => item.trim()),
        hours: hours,
      });

      setProgress(100);
      setUserUpdatingComplete(true);
    } catch (error) {
      console.error("Error updating document: ", error);
      setProgress(0);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading restaurant data</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="w-full p-4 bg-gray-50 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Restaurant Details</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rest_name">
                Restaurant Name
              </label>
              <input
                type="text"
                id="rest_name"
                value={formData.rest_name}
                onChange={(e) => setFormData({ ...formData, rest_name: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mapLink">
                Map Link
              </label>
              <input
                type="text"
                id="mapLink"
                value={formData.mapLink}
                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                Time
              </label>
              <input
                type="text"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rating">
                Rating
              </label>
              <input
                type="number"
                id="rating"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="border border-gray-300 rounded-lg p-2 w-full"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Category">
                Categories
              </label>
              <CategoriesForm categoriesForm={categoriesForm} setCategoriesForm={setCategoriesForm} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sub_categories">
                Sub-Categories
              </label>
              <CategoriesForm categoriesForm={subCategoriesForm} setCategoriesForm={setSubCategoriesForm} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="main_image">
                Main Image
              </label>
              <input
                type="file"
                id="main_image"
                ref={mainImageRef}
                onChange={(e) => handleImageChange(e, "main_image")}
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bg_image">
                Background Image
              </label>
              <input
                type="file"
                id="bg_image"
                ref={bgImageRef}
                onChange={(e) => handleImageChange(e, "bg_image")}
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
          {renderHoursFields()}
          <Map
            isLoaded={isLoaded}
            markerPosition={markerPosition}
            onMapClick={onMapClick}
            onMarkerPositionChange={(position) => setMarkerPosition(position)}
            defaultCenter={markerPosition}
            className="h-72 w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update
          </button>
          {progress > 0 && <div>Progress: {progress}%</div>}
          {userUpdatingComplete && <div>Update Complete!</div>}
        </form>
      </div>
    </>
  );
}

export default Edit;
