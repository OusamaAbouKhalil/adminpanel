import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { GeoPoint, updateDoc, doc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { Header, Map } from "../components";
import CategoriesForm from "../components/Form/CategoriesForm";
import { useGetRestaurantById } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";

function Edit() {
  const { id } = useParams();
  const { data: restaurant, isPending: isLoading, error } = useGetRestaurantById(id);
  const [progress, setProgress] = useState(0);
  const [userUpdatingComplete, setUserUpdatingComplete] = useState(false);
  const [categoriesForm, setCategoriesForm] = useState([]);
  const [subCategoriesForm, setSubCategoriesForm] = useState([]);
  const [images, setImages] = useState({
    main_image: null,
    bg_image: null,
  });
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });

  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
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
      });
      setMarkerPosition({ lat: restaurant.location._lat, lng: restaurant.location._long });
      setCategoriesForm(restaurant.Category.map((category) => (category)) || []);
      setSubCategoriesForm(restaurant.sub_categories.map((category) => (category)) || []);
      setImages({
        main_image: restaurant.main_image,
        bg_image: restaurant.bg_image,
      });

      // Set initial schedule
      setSchedule(restaurant.hours || {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
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
      mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
    }));
  }, []);

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({
        ...prev,
        [e.target.name]: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === "isClosed" ? checked : value,
    }));
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
  };

  const handleScheduleChange = (day, index, field, value) => {
    setSchedule(prev => {
      const daySchedule = prev[day] || [];
      const updatedSchedule = [...daySchedule];
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
      return { ...prev, [day]: updatedSchedule };
    });
  };

  const addScheduleSlot = (day) => {
    setSchedule(prev => {
      const daySchedule = prev[day] || [];
      return { ...prev, [day]: [...daySchedule, { openingTime: "", closingTime: "" }] };
    });
  };

  const removeScheduleSlot = (day, index) => {
    setSchedule(prev => {
      const daySchedule = prev[day] || [];
      return { ...prev, [day]: daySchedule.filter((_, i) => i !== index) };
    });
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
      await updateDoc(collectionRef, {
        ...formData,
        main_image: images.main_image ? mainImageUrl : formData.main_image,
        bg_image: images.bg_image ? bgImageUrl : formData.bg_image,
        Category: categoriesForm.map((item) => item.trim()),
        sub_categories: subCategoriesForm.map((item) => item.trim()),
        hours: schedule,
      });

      setProgress(100);
      setUserUpdatingComplete(true);
    } catch (error) {
      console.error("Error updating document: ", error);
      setProgress(0);
    }
  };

  const renderScheduleFields = () => (
    <div className="w-full p-4 bg-gray-50 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Schedule</h2>
      {Object.keys(schedule).map(day => (
        <div key={day} className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{day}</h3>
          {schedule[day].map((slot, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="time"
                value={slot.openingTime}
                onChange={(e) => handleScheduleChange(day, index, 'openingTime', e.target.value)}
                className="border rounded-lg p-2 mr-2"
              />
              <input
                type="time"
                value={slot.closingTime}
                onChange={(e) => handleScheduleChange(day, index, 'closingTime', e.target.value)}
                className="border rounded-lg p-2 mr-2"
              />
              <button
                type="button"
                onClick={() => removeScheduleSlot(day, index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addScheduleSlot(day)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg"
          >
            Add Slot
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <Header title="Edit Restaurant" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 md:mr-4">
            <label className="block text-gray-700">Restaurant Name</label>
            <input
              type="text"
              name="rest_name"
              value={formData.rest_name}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div className="flex-1 md:ml-4">
            <label className="block text-gray-700">Rating</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
              min="0"
              max="5"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="flex-1 md:mr-4">
            <label className="block text-gray-700">Main Image</label>
            <input
              type="file"
              name="main_image"
              onChange={handleFileInputChange}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div className="flex-1 md:ml-4">
            <label className="block text-gray-700">Background Image</label>
            <input
              type="file"
              name="bg_image"
              onChange={handleFileInputChange}
              className="border rounded-lg p-2 w-full"
            />
          </div>
        </div>

        <CategoriesForm
          categories={categoriesForm}
          onChange={(index, value) => handleCategoryChange(index, value)}
          onAdd={() => handleCategoryChange(categoriesForm.length, "")}
        />

        <CategoriesForm
          categories={subCategoriesForm}
          onChange={(index, value) => handleCategoryChange(index, value, true)}
          onAdd={() => handleCategoryChange(subCategoriesForm.length, "", true)}
        />

        {renderScheduleFields()}

        <button
          type="submit"
          disabled={progress < 100}
          className={`py-2 px-4 rounded-lg font-bold ${
            progress === 100 ? "bg-green-500 hover:bg-green-700" : "bg-gray-500 cursor-not-allowed"
          } text-white`}
        >
          {progress === 100 ? "Update" : "Updating..."}
        </button>
      </form>
    </div>
  );
}

export default Edit;
