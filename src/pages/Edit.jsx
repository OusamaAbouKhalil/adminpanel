import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useJsApiLoader, Marker } from "@react-google-maps/api";
import { GeoPoint, updateDoc, doc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { Header, Map } from "../components";
import { restaurantGrid } from "../data/dummy";
import CategoriesForm from "../components/Form/CategoriesForm";
import { useGetRestaurantById } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";
import { FaPlusCircle, FaMinusCircle, FaTrash  } from 'react-icons/fa';



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

  const titles = [
    "Featured on SwiftBites",
    "Daily Recommendations!",
    "Now on SwiftBites",
    "Coming Soon",
    "In a hurry?",
    "Wallet Friendly",
    "Breakfast",
    "Fresh & Supermarkets",
    "National Brands",
  ];

  const [imageFiles, setImageFiles] = useState({
    main_image: null,
    bg_image: null,
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
    hours: {
      Monday: [{ openingTime: "", closingTime: "" }],
      Tuesday: [{ openingTime: "", closingTime: "" }],
      Wednesday: [{ openingTime: "", closingTime: "" }],
      Thursday: [{ openingTime: "", closingTime: "" }],
      Friday: [{ openingTime: "", closingTime: "" }],
      Saturday: [{ openingTime: "", closingTime: "" }],
      Sunday: [{ openingTime: "", closingTime: "" }],
    },
  });

  const [markerPosition, setMarkerPosition] = useState({
    lat: 33.26968841037753,
    lng: 35.20611613326288,
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        Category: restaurant.Category || [],
        isClosed: restaurant.isClosed || false,
        bg_image: restaurant.bg_image || "",
        likes: restaurant.likes || [],
        location: new GeoPoint(restaurant.location?._lat || 33.26968841037753, restaurant.location?._long || 35.20611613326288),
        main_image: restaurant.main_image || "",
        rating: restaurant.rating || 0,
        rest_name: restaurant.rest_name || "",
        sub_categories: restaurant.sub_categories || [],
        time: restaurant.time || "",
        title: restaurant.title || [],
        mapLink: restaurant.mapLink || "",
        hours: restaurant.hours || {
          Monday: [{ openingTime: "", closingTime: "" }],
          Tuesday: [{ openingTime: "", closingTime: "" }],
          Wednesday: [{ openingTime: "", closingTime: "" }],
          Thursday: [{ openingTime: "", closingTime: "" }],
          Friday: [{ openingTime: "", closingTime: "" }],
          Saturday: [{ openingTime: "", closingTime: "" }],
          Sunday: [{ openingTime: "", closingTime: "" }],
        }
      });
      setMarkerPosition({ lat: restaurant.location?._lat || 33.26968841037753, lng: restaurant.location?._long || 35.20611613326288 });
      setCategoriesForm(restaurant.Category || []);
      setSubCategoriesForm(restaurant.sub_categories || []);
      setImageFiles({
        main_image: restaurant.main_image || null,
        bg_image: restaurant.bg_image || null,
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
      setImageFiles(prev => ({
        ...prev,
        [e.target.name]: URL.createObjectURL(file),
      }));
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
        Category: categoriesForm.map(item => item.trim()),
        sub_categories: subCategoriesForm.map(item => item.trim())
      });

      setProgress(100);
      setUserUpdatingComplete(true);
    } catch (error) {
      console.error("Error updating document: ", error);
      setProgress(0);
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleHoursChange = (e, day, timeIndex) => {
    const { name, value } = e.target;
    const formattedTime = formatTime(value);
  
    setFormData(prevState => ({
      ...prevState,
      hours: {
        ...prevState.hours,
        [day]: prevState.hours[day].map((period, index) =>
          index === timeIndex
            ? { ...period, [name]: formattedTime }
            : period
        )
      }
    }));
  };
  
  const formatTime = (timeString) => {
    // Trim whitespace from both sides
    timeString = timeString.trim();
  
    // Define regex to match time in various formats
    const regex = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;
    const match = timeString.match(regex);
  
    if (!match) return timeString; // return original if not a valid time
  
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
  
    // Convert hours to 12-hour format
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
  
    // Determine AM/PM if not provided
    if (!period) {
      period = (parseInt(hours, 10) < 12) ? 'AM' : 'PM';
    }
  
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period.toUpperCase()}`;
  };
  
  const renderHoursTable = () => (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Hours</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-green-500 text-white">
            <tr>
              <th className="p-4 text-center font-medium">Day</th>
              <th className="p-4 text-center font-medium">Opening Time</th>
              <th className="p-4 text-center font-medium">Closing Time</th>
              <th className="p-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <React.Fragment key={day}>
                {formData.hours[day]?.map((period, timeIndex) => (
                  <tr
                    key={`${day}-${timeIndex}`}
                    className="border-t border-gray-300 bg-white hover:bg-gray-100 text-center"
                  >
                    <td className="p-4 text-gray-700 font-medium">
                      {day}
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        name="openingTime"
                        value={period.openingTime || ""}
                        onChange={(e) => handleHoursChange(e, day, timeIndex)}
                        placeholder="7:59 AM"
                        className="bg-gray-100 border border-gray-300 rounded-lg p-3 w-full md:w-1/2 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        name="closingTime"
                        value={period.closingTime || ""}
                        onChange={(e) => handleHoursChange(e, day, timeIndex)}
                        placeholder="9:59 PM"
                        className="bg-gray-100 border border-gray-300 rounded-lg p-3 w-full md:w-1/2 text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        {formData.hours[day]?.length > 1 && (
                          <FaMinusCircle
                            onClick={() => removeTimeSlot(day, timeIndex)}
                            className="text-red-600 cursor-pointer hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            size={24}
                          />
                        )}
                        {timeIndex === formData.hours[day]?.length - 1 && (
                          <FaPlusCircle
                            onClick={() => addNewTimeSlot(day)}
                            className="text-green-600 cursor-pointer hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            size={24}
                          />
                        )}
                        <FaTrash
                          onClick={() => clearTimeSlot(day, timeIndex)}
                          className="text-yellow-400 cursor-pointer hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          size={24}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  
  // Function to handle clearing inputs for a specific time slot
  const clearTimeSlot = (day, timeIndex) => {
    // Get the current hours data
    const currentHours = formData.hours[day] || [];
    
    // Create a new array with the specified slot cleared
    const updatedHours = currentHours.map((period, index) =>
      index === timeIndex
        ? { openingTime: "", closingTime: "" } // Clear the specific slot
        : period
    );
  
    // Update the state with the new hours array
    setFormData(prevState => ({
      ...prevState,
      hours: {
        ...prevState.hours,
        [day]: updatedHours
      }
    }));
  };



  const removeTimeSlot = (day, timeIndex) => {
    setFormData(prevState => ({
      ...prevState,
      hours: {
        ...prevState.hours,
        [day]: prevState.hours[day].filter((_, index) => index !== timeIndex),
      }
    }));
  };
  
  const addNewTimeSlot = (day) => {
    setFormData(prevState => ({
      ...prevState,
      hours: {
        ...prevState.hours,
        [day]: [...(prevState.hours[day] || []), { openingTime: "", closingTime: "" }]
      }
    }));
  };


  const renderFormFields = () => (
    <div className="space-y-6 w-full">
      {restaurantGrid.map(item => (
        <React.Fragment key={item.value}>
          {item.value === "location" && (
            <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-6 transition-transform transform hover:scale-105 duration-300 ease-in-out">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Location</h2>
              <div className="relative h-72 rounded-lg overflow-hidden mb-4">
                <Map
                  markerPosition={markerPosition}
                  onMapClick={onMapClick}
                  isLoaded={isLoaded}
                  className="w-full h-full"
                />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <label className="block text-lg font-semibold text-gray-800 mb-2">Location Link</label>
                <input
                  type="text"
                  value={formData.mapLink || ""}
                  readOnly
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 transition-colors duration-150 ease-in-out"
                  placeholder="No link provided"
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {restaurantGrid.map(item => (
          <React.Fragment key={item.value}>
            {item.value === "title" && (
              <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-6 transition-transform transform hover:scale-105 duration-300 ease-in-out">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Title</h2>
                <div className="bg-white rounded-lg shadow-inner p-4">
                  <select
                    multiple
                    className="bg-white border border-gray-300 rounded-lg text-center w-full py-2 px-3 text-gray-700 transition-transform duration-150 ease-in-out"
                    onChange={handleSelectChange}
                  >
                    {titles.map(option => (
                      <option
                        key={option}
                        value={option}
                        className={`p-2 ${formData.title.includes(option)
                          ? "bg-green-500 text-white"
                          : "bg-gray-100"
                          } rounded-sm transition-colors duration-150 ease-in-out`}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {(item.value === "Category" || item.value === "sub_categories") && (
              <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-6 transition-transform transform hover:scale-105 duration-300 ease-in-out">
                <div className="flex flex-col">
                  {item.value === "Category" && (
                    <div className="mb-4">
                      <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Category</h2>
                      <CategoriesForm
                        categoriesForm={categoriesForm}
                        setCategoriesForm={setCategoriesForm}
                        handleCategoryChange={handleCategoryChange}
                        title="Add a Category"
                      />
                    </div>
                  )}
                  {item.value === "sub_categories" && (
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Sub-Category</h2>
                      <CategoriesForm
                        categoriesForm={subCategoriesForm}
                        setCategoriesForm={setSubCategoriesForm}
                        handleCategoryChange={(index, value) => handleCategoryChange(index, value, true)}
                        title="Add a Sub-category"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {item.value !== "location" && item.value !== "title" && item.value !== "Category" && item.value !== "sub_categories" && (
              <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-6 transition-transform transform hover:scale-105 duration-300 ease-in-out">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-extrabold text-gray-900">{item.headerText}</h2>
                  {item.inputType === "checkbox" && (
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData[item.value] || false}
                        onChange={() => handleToggleChange(item.value)}
                      />
                      <div
                        className={`w-24 h-8 flex items-center rounded-full shadow-inner transition-colors duration-300 ease-in-out ${formData[item.value] ? "bg-green-500" : "bg-red-500"}`}
                      >
                        <span
                          className={`absolute right-2 text-white ${formData[item.value] ? "opacity-0" : "opacity-100"}`}
                          style={{ zIndex: 1 }}
                        >
                          Closed
                        </span>
                        <span
                          className={`absolute left-2 text-white ${formData[item.value] ? "opacity-100" : "opacity-0"}`}
                          style={{ zIndex: 1 }}
                        >
                          Open
                        </span>
                        <div
                          className={`w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${formData[item.value] ? "translate-x-16" : "translate-x-0"}`}
                          style={{ zIndex: 2 }}
                        />
                      </div>
                    </label>
                  )}
                </div>
                <div className="flex items-center mt-2">
                  <input
                    ref={
                      item.value === "main_image"
                        ? mainImageRef
                        : item.value === "bg_image"
                          ? bgImageRef
                          : null
                    }
                    className={`bg-gray-100 border border-gray-300 rounded-lg p-2 ${item.inputType === "file" && imageFiles[item.value]
                      ? "hidden"
                      : ""
                      } ${item.inputType === "checkbox"
                        ? "hidden"
                        : "w-full"
                      } transition-transform duration-150 ease-in-out`}
                    type={item.inputType}
                    name={item.value}
                    value={
                      item.inputType === "file"
                        ? undefined
                        : formData[item.value]
                    }
                    checked={
                      item.inputType === "checkbox"
                        ? formData[item.value] || false
                        : undefined
                    }
                    onChange={
                      item.inputType === "file"
                        ? handleFileInputChange
                        : handleChange
                    }
                    placeholder={item.placeholder || ""}
                  />
                  {imageFiles[item.value] && (
                    <div className="relative mt-2">
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-bold opacity-0 hover:opacity-100 transition-opacity rounded-md cursor-pointer"
                        style={{ zIndex: 10 }}
                        onClick={() => {
                          if (item.value === "main_image") {
                            mainImageRef.current.click();
                          } else if (item.value === "bg_image") {
                            bgImageRef.current.click();
                          }
                        }}
                      >
                        Change Image
                      </div>
                      <img
                        src={imageFiles[item.value]}
                        alt={item.headerText}
                        className="rounded-md border-2 border-gray-300 object-cover transition-transform duration-150 ease-in-out"
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "auto",
                          maxHeight: "200px",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  
  
  // Function to handle toggle switch changes
  const handleToggleChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      [value]: !prevData[value]
    }));
  };
  
  
  
  
  return (
    <div className="m-4 md:m-10 mt-24 p-4 md:p-10 bg-gradient-to-r from-green-30 to-white rounded-3xl">
      <Header title="Edit Restaurant" />
      <form onSubmit={handleSubmit}>
        {isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="flex flex-wrap">
            {renderFormFields()}
            {renderHoursTable()}
          </div>
        )}
        <div className="flex justify-end pr-4">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 mx-2 rounded-lg mt-4 transition-colors"
          >
            Update
          </button>
        </div>
        <div className="w-full mt-5">
          <div className="bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {userUpdatingComplete && (
            <p className="text-green-500 mt-2">
              This Restaurant has successfully been updated!
            </p>
          )}
        </div>
      </form>
    </div>
  );
}  

export default Edit;
