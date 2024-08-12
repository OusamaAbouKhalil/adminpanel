import React, { useState, useEffect, useCallback, useRef } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { useParams } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { GeoPoint, updateDoc, doc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { Header, Map } from "../components";
import { restaurantGrid } from "../data/dummy";
import CategoriesForm from "../components/Form/CategoriesForm";

function Edit() {
  const { getRestaurantById } = useStateContext();
  const { id } = useParams();
  const { uploadImage } = useStateContext();
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
    "National Brands",
    "Coming Soon",
    "In a hurry?",
    "Wallet Friendly",
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
    const fetchRestaurant = async () => {
      const rest_data = await getRestaurantById(id);
      setFormData(rest_data);
      setImageFiles({
        main_image: rest_data.main_image,
        bg_image: rest_data.bg_image,
      });
      setCategoriesForm(
        rest_data.Category.map((category) => ({ name: category })) || []
      );
      setSubCategoriesForm(
        rest_data.sub_categories.map((category) => ({ name: category })) || []
      );
      setMarkerPosition({
        lat: rest_data.location.latitude,
        lng: rest_data.location.longitude,
      });
      const mapLink = `https://www.google.com/maps?q=${rest_data.location?.latitude},${rest_data.location?.longitude}`;
      setFormData((prevState) => ({
        ...prevState,
        mapLink: mapLink,
      }));
    };
    fetchRestaurant();
  }, []);

  const handleSelectChange = (e) => {
    const clickedOption = e.target.value;
    const isSelected = formData.title.includes(clickedOption);

    if (isSelected) {
      // Remove the clicked option from formData.title
      setFormData((prevState) => ({
        ...prevState,
        title: prevState.title.filter((title) => title !== clickedOption),
      }));
    } else {
      // Add the clicked option to formData.title
      setFormData((prevState) => ({
        ...prevState,
        title: [...prevState.title, clickedOption],
      }));
    }
    console.log(formData.title);
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });

    // Set the location in form data
    setFormData((prevState) => ({
      ...prevState,
      location: new GeoPoint(lat, lng),
    }));

    // Generate map link
    const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
    setFormData((prevState) => ({
      ...prevState,
      mapLink: mapLink,
    }));
  }, []);

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setImageFiles((prev) => ({
        ...prev,
        [e.target.name]: URL.createObjectURL(file),
      }));
      setImages((prev) => ({
        ...prev,
        [e.target.name]: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "isClosed") {
      setFormData((prevState) => ({
        ...prevState,
        isClosed: !prevState.isClosed,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = (index, field, value, isSubCategory = false) => {
    const newCategories = isSubCategory
      ? [...subCategoriesForm]
      : [...categoriesForm];

    if (value === '') {
      // Remove category if value is empty
      newCategories.splice(index, 1);
    } else {
      // Add or update category
      newCategories[index] = value;
    }

    isSubCategory
      ? setSubCategoriesForm(newCategories)
      : setCategoriesForm(newCategories);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (images.main_image) {
        const mainImageUrl = await uploadImage(images.main_image);
        formData.main_image = mainImageUrl;
      }
      setProgress(20);

      if (images.bg_image) {
        const bgImageUrl = await uploadImage(images.bg_image);
        formData.bg_image = bgImageUrl;
      }
      setProgress(60);

      // Ensure categories and sub-categories are arrays of strings
      console.log(subCategoriesForm);
      if (categoriesForm.length > 0) {
        formData.Category = categoriesForm.map(item => item.name ?? item);
      }
      if (subCategoriesForm.length > 0) {
        formData.sub_categories = subCategoriesForm;
      }

      const collectionRef = doc(fsdb, "restaurants", id);
      await updateDoc(collectionRef, formData);

      setProgress(100);
      setUserUpdatingComplete(true);
    } catch (error) {
      console.error("Error updating document: ", error);
      setProgress(0);
    }
  };


  const renderFormFields = () => {
    return (
      <>
        {restaurantGrid.map((item) => (
          <React.Fragment key={item.value}>
            {item.value == "location" ? (
              <div className="w-full p-2">
                <Map
                  markerPosition={markerPosition}
                  onMapClick={onMapClick}
                  isLoaded={isLoaded}
                />
                <div className="w-full mt-2">
                  <label className="block">Location Link</label>
                  <input
                    type="text"
                    value={formData.mapLink || ""}
                    readOnly
                    className="bg-gray-200 rounded-lg p-1 w-full"
                  />
                </div>
              </div>
            ) : item.value == "title" ? (
              <div key={item.value} className="w-full md:w-1/2 p-2">
                <label className="block">Title</label>
                <div className="bg-gray-200 shadow-lg p-2 rounded-xl">
                  <select
                    multiple // Allow multiple selections
                    className="bg-white p-1 rounded-xl text-center w-full"
                    onClick={handleSelectChange}
                  >
                    {titles.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className={`p-2 ${formData.title.includes(option)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                          } rounded-sm`}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : item.value == "Category" ? (
              <div className="w-full md:w-1/2 p-2">
                <label className="block">Category</label>
                <CategoriesForm
                  categoriesForm={categoriesForm}
                  setCategoriesForm={setCategoriesForm}
                  handleCategoryChange={handleCategoryChange}
                  title={"Add a Category"}
                />
              </div>
            ) : item.value == "sub_categories" ? (
              <div className="w-full md:w-1/2 p-2">
                <label className="block">Sub-Category</label>
                <CategoriesForm
                  categoriesForm={subCategoriesForm}
                  setCategoriesForm={setSubCategoriesForm}
                  handleCategoryChange={(index, field, value) =>
                    handleCategoryChange(index, field, value, true)
                  }
                  title={"Add a Sub-category"}
                />
              </div>
            ) : (
              <div key={item.value} className="w-full md:w-1/2 p-2">
                <label className="block">{item.headerText}</label>
                <div className="flex items-center">
                  <input
                    ref={
                      item.value === "main_image"
                        ? mainImageRef
                        : item.value === "bg_image"
                          ? bgImageRef
                          : null
                    }
                    className={`bg-gray-200 rounded-lg p-1 ${item.inputType === "file" && imageFiles[item.value]
                      ? "hidden"
                      : ""
                      } ${item.inputType === "checkbox"
                        ? "form-checkbox h-5 w-5"
                        : "w-full"
                      }`}
                    type={item.inputType}
                    name={item.value}
                    value={
                      item.inputType === "file"
                        ? undefined
                        : formData[item.value]
                    }
                    checked={
                      item.inputType === "checkbox"
                        ? formData.isClosed
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
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-bold opacity-0 hover:opacity-100 transition-opacity"
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
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                          maxHeight: "200px",
                        }}
                        className="rounded-md w-16 h-16 border-2 border-gray-300 object-cover"
                      />
                    </div>
                  )}
                  {item.inputType === "checkbox" && (
                    <span className="ml-2 text-gray-700">
                      {formData.isClosed ? "Closed" : "Open"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header title="Edit Restaurant" />
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">{renderFormFields()}</div>
        <div className="flex justify-end pr-2">
          <button
            key="submit"
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 mx-2 rounded mt-4"
          >
            Update
          </button>
        </div>
        <div className="w-full mt-3">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {userUpdatingComplete && (
            <p className="text-green-500">
              This Restaurant has successfully been updated!
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
export default Edit;
