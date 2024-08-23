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
      setImageFiles({
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
      let bgImageUrl
      if (images.main_image) {
        mainImageUrl = await uploadImage(images.main_image);
      }
      setProgress(60);
      if (images.bg_image) {
        bgImageUrl = await uploadImage(images.bg_image);
      }
      setProgress(80);

      const collectionRef = doc(fsdb, "restaurants", id);
      console.log(formData);
      await updateDoc(collectionRef, {
        ...formData,
        main_image: images.main_image ? mainImageUrl : formData.main_image,
        bg_image: images.bg_image ? bgImageUrl : formData.bg_image,
        Category: categoriesForm.map((item) => item.trim()),
        sub_categories: subCategoriesForm.map((item) => item.trim())
      });

      setProgress(100);
      setUserUpdatingComplete(true);
    } catch (error) {
      console.error("Error updating document: ", error);
      setProgress(0);
    }
  };

const renderFormFields = () => (
  <>
    {restaurantGrid.map((item) => (
      <React.Fragment key={item.value}>
        {item.value === "title" && (
          <div className="w-full p-4">
            <label className="block text-gray-700 font-semibold mb-2">Title</label>
            <select
              multiple
              className="bg-white border border-gray-300 rounded-lg p-3 w-full"
              onChange={handleSelectChange}
            >
              {titles.map((option) => (
                <option
                  key={option}
                  value={option}
                  className={`p-2 ${formData.title.includes(option)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                    } rounded-md`}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        {item.value === "location" && (
          <div className="w-full p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-md">
                <Map
                  markerPosition={markerPosition}
                  onMapClick={onMapClick}
                  isLoaded={isLoaded}
                />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-md mt-4 lg:mt-0">
                <label className="block text-gray-700 font-semibold mb-2">Location Link</label>
                <input
                  type="text"
                  value={formData.mapLink || ""}
                  readOnly
                  className="bg-gray-100 border border-gray-300 rounded-lg p-3 w-full"
                />
              </div>
            </div>
          </div>
        )}
        {item.value === "Category" && (
          <div className="w-full md:w-1/2 p-4">
            <label className="block text-gray-700 font-semibold mb-2">Category</label>
            <CategoriesForm
              categoriesForm={categoriesForm}
              setCategoriesForm={setCategoriesForm}
              handleCategoryChange={handleCategoryChange}
              title="Add a Category"
            />
          </div>
        )}
        {item.value === "sub_categories" && (
          <div className="w-full md:w-1/2 p-4">
            <label className="block text-gray-700 font-semibold mb-2">Sub-Category</label>
            <CategoriesForm
              categoriesForm={subCategoriesForm}
              setCategoriesForm={setSubCategoriesForm}
              handleCategoryChange={(index, value) =>
                handleCategoryChange(index, value, true)
              }
              title="Add a Sub-category"
            />
          </div>
        )}
        {(item.value === "main_image" || item.value === "bg_image") && (
          <div className="w-full p-4">
            <label className="block text-gray-700 font-semibold mb-2">
              {item.value === "main_image" ? "Main Image" : "Background Image"}
            </label>
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-shrink-0 w-full lg:w-1/2 h-40 relative">
                <img
                  src={imageFiles[item.value]}
                  alt={item.headerText}
                  className="rounded-lg border border-gray-300 object-cover w-full h-full"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity"
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
              </div>
              <input
                ref={item.value === "main_image" ? mainImageRef : item.value === "bg_image" ? bgImageRef : null}
                className={`bg-gray-100 border border-gray-300 rounded-lg p-2 ${item.inputType === "file" && imageFiles[item.value]
                  ? "hidden"
                  : ""
                  } ${item.inputType === "checkbox" ? "form-checkbox h-5 w-5" : "w-full"}`}
                type={item.inputType}
                name={item.value}
                value={item.inputType === "file" ? undefined : formData[item.value]}
                checked={item.inputType === "checkbox" ? formData.isClosed : undefined}
                onChange={item.inputType === "file" ? handleFileInputChange : handleChange}
                placeholder={item.placeholder || ""}
              />
            </div>
          </div>
        )}
        {item.value !== "location" && item.value !== "title" && item.value !== "Category" && item.value !== "sub_categories" && item.value !== "main_image" && item.value !== "bg_image" && (
          <div key={item.value} className="w-full md:w-1/2 p-4">
            <label className="block text-gray-700 font-semibold mb-2">{item.headerText}</label>
            <div className="flex items-center">
              <input
                ref={item.value === "main_image" ? mainImageRef : item.value === "bg_image" ? bgImageRef : null}
                className={`bg-gray-100 border border-gray-300 rounded-lg p-2 ${item.inputType === "file" && imageFiles[item.value]
                  ? "hidden"
                  : ""
                  } ${item.inputType === "checkbox" ? "form-checkbox h-5 w-5" : "w-full"}`}
                type={item.inputType}
                name={item.value}
                value={item.inputType === "file" ? undefined : formData[item.value]}
                checked={item.inputType === "checkbox" ? formData.isClosed : undefined}
                onChange={item.inputType === "file" ? handleFileInputChange : handleChange}
                placeholder={item.placeholder || ""}
              />
              {item.inputType === "checkbox" && (
                <span className="ml-2 text-gray-700">{formData.isClosed ? "Closed" : "Open"}</span>
              )}
            </div>
          </div>
        )}
      </React.Fragment>
    ))}
  </>
);

return (
  <div className="m-4 md:m-8 mt-8 p-4 md:p-8 bg-white rounded-lg shadow-lg">
    <Header title="Edit Restaurant" />
    <form onSubmit={handleSubmit}>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFormFields()}
        </div>
      )}
      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
        >
          Update
        </button>
      </div>
      <div className="w-full mt-6">
        <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {userUpdatingComplete && (
          <p className="text-green-500 mt-2 text-center font-semibold">
            This Restaurant has been successfully updated!
          </p>
        )}
      </div>
    </form>
  </div>
);
}

export default Edit;
