import React, { useState, useCallback, useMemo, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { GeoPoint } from "firebase/firestore";
import { Header, SizesForm, Map } from "../components";
import { restaurantGrid, menuGrid } from "../data/dummy";
import { useNavigate } from "react-router-dom";
import CategoriesForm from "../components/Form/CategoriesForm";
import { useCreateRestaurant } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";

function Add() {
  const { mutate: createRestaurant } = useCreateRestaurant();

  const [sizesForm, setSizesForm] = useState([]);
  const [categoriesForm, setCategoriesForm] = useState([]);
  const [subCategoriesForm, setSubCategoriesForm] = useState([]);

  const [isRestaurantPending, setIsRestaurantPending] = useState(false);
  const [page, setPage] = useState(false);
  const [userCreationComplete, setUserCreationComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const mainImageRef = useRef(null);
  const bgImageRef = useRef(null);
  const itemImageRef = useRef(null);

  const Navigate = useNavigate();

  const titles = [
    "Featured on SwiftBites",
    "Daily Recommendations!",
    "Now on SwiftBites",
    "Coming Soon",
    "In a hurry?",
    "Wallet Friendly",
    "Breakfast",
    "National Brands",
  ];

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const generateMapLink = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const [imageFiles, setImageFiles] = useState({
    main_image: null,
    bg_image: null,
    item_image: null,
  });
  const [imageFilesUrls, setImageFilesUrls] = useState({
    main_image: null,
    bg_image: null,
    item_image: null,
  });
  const [formData, setFormData] = useState({
    Category: '',
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
  const [menuData, setMenuData] = useState({
    item_category: "",
    available: true,
    // preferences: "",
    combo: {},
    item_description: "",
    item_name: "",
    item_price: 0,
    item_discount: 0,
    likes: [],
    orders_count: 0,
    sizes: {},
  });
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
    const mapLink = generateMapLink(lat, lng);
    setFormData((prevState) => ({
      ...prevState,
      mapLink: mapLink,
    }));
  });

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setImageFilesUrls((prev) => ({
        ...prev,
        [e.target.name]: fileURL,
      }));
      setImageFiles((prev) => ({
        ...prev,
        [e.target.name]: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (menuGrid.some((item) => item.value === name)) {
      setMenuData((prevState) => ({
        ...prevState,
        [name]: name === "item_price" ? parseFloat(value) : value,
      }));
    } else if (name === "isClosed") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsRestaurantPending(true);

      if (imageFiles.main_image) {
        const mainImageUrl = await uploadImage(imageFiles.main_image);
        formData.main_image = mainImageUrl;
      }
      setProgress(10);

      if (imageFiles.bg_image) {
        const bgImageUrl = await uploadImage(imageFiles.bg_image);
        formData.bg_image = bgImageUrl;
      }
      setProgress(20);

      if (imageFiles.item_image) {
        const itemImageUrl = await uploadImage(imageFiles.item_image);
        menuData.item_image = itemImageUrl;
      }
      setProgress(30);
      formData.Category = categoriesForm;
      formData.sub_categories = subCategoriesForm;

      var subSizes = {};
      console.log(sizesForm);
      sizesForm.map((item) => (subSizes[item.name] = parseFloat(item.value)));
      menuData.sizes = subSizes;
      setProgress(40);

      console.log(formData, menuData);
      const restRef = await createRestaurant({ formData: formData, menuData: menuData });

      setProgress(100);
      setUserCreationComplete(true);
      setIsRestaurantPending(false);
      setTimeout(() => {
        Navigate(`/restaurants/${restRef.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setProgress(0);
      setIsRestaurantPending(false);
    }
  };
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizesForm];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizesForm(newSizes);
  };

  const handleCategoryChange = (index, value, isSubCategory = false) => {
    const newCategories = isSubCategory
      ? [...subCategoriesForm]
      : [...categoriesForm];
    newCategories[index] = value.trim();
    isSubCategory
      ? setSubCategoriesForm(newCategories)
      : setCategoriesForm(newCategories);
  };

  const renderFormFields = () => {
    return (
      <>
        {page == 0
          ? restaurantGrid.map((item) => (
            <React.Fragment key={item.value}>
              {item.value == "location" ? (
                <div className="w-full p-2">
                  <Map
                    markerPosition={markerPosition}
                    onMapClick={onMapClick}
                    isLoaded={isLoaded}
                  />
                  <label className="block">Location Link</label>
                  <input required
                    type="text"
                    value={formData.mapLink || ""}
                    readOnly
                    className="bg-gray-200 rounded-lg p-1 w-full"
                  />
                </div>
              ) : item.value == "title" ? (
                <div key={item.value} className="w-full md:w-1/2 p-2">
                  <label className="block">Title</label>
                  <div className="bg-gray-200 shadow-lg p-2 rounded-xl">
                    <select
                      required
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
                    <input required
                      ref={
                        item.value === "main_image"
                          ? mainImageRef
                          : item.value === "bg_image"
                            ? bgImageRef
                            : null
                      }
                      className={`bg-gray-200 rounded-lg p-1 ${item.inputType === "file" && imageFilesUrls[item.value]
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
                    {imageFilesUrls[item.value] && (
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
                          src={imageFilesUrls[item.value]}
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
          ))
          : menuGrid.map((item) => (
            <div key={item.value} className="w-full md:w-1/2 p-2">
              <label className="block">{item.headerText}</label>
              {item.value === "sizes" ? (
                <SizesForm
                  sizesForm={sizesForm}
                  setSizesForm={setSizesForm}
                  handleSizeChange={handleSizeChange}
                />
              ) : (
                <input required
                  ref={item.value === "item_image" ? itemImageRef : null}
                  className={`bg-gray-200 rounded-lg p-1 w-full ${item.inputType === "file" && imageFilesUrls[item.value]
                    ? "hidden"
                    : ""
                    }`}
                  type={item.inputType}
                  name={item.value}
                  value={
                    item.inputType === "file"
                      ? undefined
                      : menuData[item.value]
                  }
                  onChange={
                    item.inputType === "file"
                      ? handleFileInputChange
                      : handleChange
                  }
                  placeholder={item.placeholder || ""}
                />
              )}
              {imageFilesUrls[item.value] && (
                <div className="relative mt-2">
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-bold opacity-0 hover:opacity-100 transition-opacity"
                    style={{ zIndex: 10 }}
                    onClick={() => {
                      if (item.value === "item_image") {
                        itemImageRef.current.click();
                      }
                    }}
                  >
                    Change Image
                  </div>
                  <img
                    src={imageFilesUrls[item.value]}
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
            </div>
          ))}
      </>
    );
  };
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Add Restaurant" />
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap">{renderFormFields()}</div>
        <div className="flex justify-end pr-2">
          <button
            key="pageChange"
            type="button"
            onClick={() => setPage(!page)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded mt-4 self-center"
          >
            {page ? "Back" : "Next"}
          </button>
          {page && (
            <button
              key="submit"
              type="submit"
              disabled={isRestaurantPending}  // Disable the button if the restaurant creation is in progress
              className={`bg-blue-500 text-white font-bold py-1 px-4 mx-2 rounded mt-4 ${isRestaurantPending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
            >
              Submit
            </button>
          )}
        </div>
        <div className="w-full mt-3">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {userCreationComplete && (
            <p className="text-green-500">
              A New Restaurant has successfully been created!
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Add;
