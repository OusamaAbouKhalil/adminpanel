import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { collection, addDoc, setDoc, GeoPoint } from 'firebase/firestore';
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { fsdb } from '../utils/firebaseconfig';
import { Header, SizesForm, Map } from '../components';
import { restaurantGrid, menuGrid } from '../data/dummy';
import { useNavigate } from 'react-router-dom';

function Add() {

  const Navigate = useNavigate();
  const [page, setPage] = useState(false);
  const [sizesForm, setSizesForm] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userCreationComplete, setUserCreationComplete] = useState(false);

  const [imageFiles, setImageFiles] = useState({
    main_image: null,
    bg_image: null,
    item_image: null
  });
  const [formData, setFormData] = useState({
    category: [],
    isClosed: false,
    bg_image: '',
    likes: [],
    location: new GeoPoint(33.26968841037753, 35.20611613326288),
    main_image: '',
    rating: 0,
    rest_name: '',
    sub_categories: [],
    time: '',
    title: []
  });
  const [markerPosition, setMarkerPosition] = useState({
    lat: 33.26968841037753,
    lng: 35.20611613326288
  });
  const [menuData, setMenuData] = useState(
    {
      item_category: "", // Replace with actual input if needed
      isAvailable: true,
      ordersCount: 0,
      preferences: "",
      combo: {

      },
      item_description: "",
      item_name: "",
      item_price: 0,
      likes: [],
      orders_count: 0,
      sizes: {}
    })


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDM7PY2pGPq_ZlOBqH0Dhq3np8nNmXbVf0"
  });

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setFormData(prevState => ({
      ...prevState,
      location: new GeoPoint(lat, lng)
    }));
  }, []);


  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setImageFiles(prev => ({
        ...prev,
        [e.target.name]: file
      }));
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category" || name === "sub_categories" || name === "title") {
      setFormData(prevState => ({
        ...prevState,
        [name]: value.split(',')
      }));
    } else if (menuGrid.some(item => item.value === name)) {
      setMenuData(prevState => ({
        ...prevState,
        [name]: value
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };


  const uploadImage = async (file) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `images/${file.name}`);
    try {
      console.log('Uploading to:', storageReference.fullPath);
      const snapshot = await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File available at:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error during file upload:', error);
      throw error;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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

      var subSizes = {}
      console.log(sizesForm)
      sizesForm.map(item => (
        subSizes[item.name] = parseFloat(item.value)

      ))
      menuData.sizes = subSizes;
      setProgress(40);

      const collectionRef = collection(fsdb, "restaurants");
      const docRef = await addDoc(collectionRef, formData);
      console.log("Document written with ID: ", docRef.id);
      setProgress(50);

      const menuRef = collection(fsdb, `restaurants/${docRef.id}/menu_items`);
      const menuItemRef = await addDoc(menuRef, menuData);
      await setDoc(menuItemRef, { menu_item_id: menuItemRef.id }, { merge: true })
      console.log("Menu item added with ID: ", menuItemRef.id);
      setProgress(60);

      // Optionally, initialize the "reviews" subcollection with an empty document
      const reviewsRef = collection(fsdb, `restaurants/${docRef.id}/reviews`);
      await addDoc(reviewsRef, { initial: true }); // You can remove or modify this part as needed
      setProgress(70);
      // Update the document with the menu item ID
      await setDoc(docRef, { ...formData, rest_id: docRef.id }, { merge: true });
      setProgress(100);
      setUserCreationComplete(true);
      setTimeout(() => {
        Navigate(`/restaurants/${docRef.id}`)
      }, 2000);


    } catch (error) {
      console.error("Error adding document: ", error);
      setProgress(0);
    }
  };
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizesForm];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizesForm(newSizes);
  };

  const renderFormFields = () => {
    return (
      <>
        {page == 0 ? restaurantGrid.map((item) => (
          <React.Fragment key={item.value}>
            {item.value == "location" ?
              <Map markerPosition={markerPosition} onMapClick={onMapClick} isLoaded={isLoaded} />
              :
              <div key={item.value} className="w-full md:w-1/2 p-2">
                <label className='block'>{item.headerText}</label>
                <input
                  className='bg-gray-200 rounded-lg p-1 w-full'
                  type={item.inputType}
                  name={item.value}
                  value={item.inputType === "file" ? undefined : formData[item.value]}
                  onChange={item.inputType === "file" ? handleFileInputChange : handleChange}
                  placeholder={item.placeholder || ""}
                />
              </div>}
          </React.Fragment>
        )) :
          menuGrid.map((item) => (
            <div key={item.value} className="w-full md:w-1/2 p-2">
              <label className='block'>{item.headerText}</label>
              {item.value === "sizes" ? (
                <SizesForm handleSizeChange={handleSizeChange} />

              ) : (
                <input
                  className='bg-gray-200 rounded-lg p-1 w-full'
                  type={item.inputType}
                  name={item.value}
                  value={item.inputType === "file" ? undefined : menuData[item.value]}
                  onChange={item.inputType === "file" ? handleFileInputChange : handleChange}
                  placeholder={item.placeholder || ""}
                />
              )}

            </div>))
        }

      </>
    )
  };
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Add Restaurant" />
      <form onSubmit={handleSubmit} className='flex flex-wrap'>
        {renderFormFields()}
        <button key="pageChange" type='button' onClick={() => setPage(!page)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded mt-4">
          {page ? "Back" : "Next"}
        </button>
        {page && <button key="submit" type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 mx-2 rounded mt-4">Submit</button>}
        <div className="w-full mt-3">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          {userCreationComplete && <p className="text-green-500">A New Restaurant has successfully been created!</p>}
        </div>
      </form>
    </div>
  );
}

export default Add;
