import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadImage } from '../lib/firebase/api';
import { useAddAddonToMenuItem, useGetMenuItem, useSetMenuItem } from '../lib/query/queries';

const Test = () => {
  const { mutate: setMenuItem } = useSetMenuItem();
  const { id, item_id } = useParams();
  const { data: itemData, isPending } = useGetMenuItem({ rest_id: id, item_id: item_id });
  const { mutate: addAddonToMenuItem } = useAddAddonToMenuItem();
  const [ItemImage, setItemImage] = useState(null);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [showAddonsForm, setShowAddonsForm] = useState(false);
  const [item, setItem] = useState();
  const Navigate = useNavigate();

  useEffect(() => {
    if (itemData) {
      setItem(itemData);
    }
  }, [itemData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: (name === "item_price" || name === "item_discount") && value ? parseFloat(value) : name === "available" ? value === "true" : value
    }));
  };

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
    }
  };

  const handleSaveChanges = async () => {
    const imageDir = "images";
    try {
      let updatedImageUrl = item.item_image; // Retain the current image by default
      if (ItemImage) {
        updatedImageUrl = await uploadImage(ItemImage, imageDir);
      }
      setItem((prevItem) => ({
        ...prevItem,
        item_image: updatedImageUrl, 
      }));

      const updatedItem = { ...item, item_image: updatedImageUrl };
      setMenuItem({ rest_id: id, item_id: item_id, itemData: updatedItem, item_image: updatedImageUrl });
      Navigate(`/restaurants/${id}`);
    } catch (error) {
      console.error("Error uploading image or saving changes:", error);
    }
  };

  const handleAddAddon = () => {
    const addonData = {
      addon_name: addonName,
      addon_price: parseFloat(addonPrice),
    };
    addAddonToMenuItem({ rest_id: id, item_id: item_id, addonData: addonData });
    setAddonName('');
    setAddonPrice('');
  };

  const back = () => {
    Navigate(`/restaurants/${id}`);
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Back Button */}
      <button
        onClick={back}
        className="mb-8 bg-gray-700 hover:bg-gray-800 text-white rounded-full p-4 transition duration-300 ease-in-out transform hover:scale-105"
      >
        <span className="text-2xl">&#x2190;</span>
      </button>

      {/* Main Content */}
      {item ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Section: Form Fields */}
          <div className="bg-white p-8 rounded-lg shadow-xl space-y-6">
            <h2 className="text-3xl font-semibold text-gray-900">Edit Menu Item</h2>

            <div className="space-y-6">
              <div className="form-group">
                <label className="text-lg font-medium text-gray-800">Item Name</label>
                <input
                  type="text"
                  name="item_name"
                  value={item.item_name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="form-group">
                <label className="text-lg font-medium text-gray-800">Item Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="item_price"
                  value={item.item_price}
                  onChange={handleInputChange}
                  placeholder="Enter item price"
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="form-group">
                <label className="text-lg font-medium text-gray-800">Item Discount</label>
                <input
                  type="number"
                  step="0.01"
                  name="item_discount"
                  value={item.item_discount}
                  onChange={handleInputChange}
                  placeholder="Enter item discount"
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="form-group">
                <label className="text-lg font-medium text-gray-800">Item Description</label>
                <textarea
                  name="item_description"
                  value={item.item_description}
                  onChange={handleInputChange}
                  placeholder="Enter item description"
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="form-group">
                <label className="text-lg font-medium text-gray-800">Availability</label>
                <select
                  name="available"
                  value={item.available}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={true}>Available</option>
                  <option value={false}>Not Available</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-lg font-medium text-gray-800">Item Category</label>
                <input
                  type="text"
                  name="item_category"
                  value={item.item_category}
                  onChange={handleInputChange}
                  placeholder="Enter item category"
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Right Section: Image Upload & Preview */}
          <div className="bg-gray-50 p-8 rounded-lg shadow-xl flex flex-col items-center space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Item Image</h3>
            <input
              type="file"
              onChange={handleFileInputChange}
              className="cursor-pointer p-3 bg-gray-200 rounded-xl text-gray-700 hover:bg-gray-300 transition duration-300 ease-in-out"
            />
            {item.item_image && (
              <img
                src={item.item_image}
                alt="Item"
                className="mt-6 w-64 h-64 object-cover rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-6 mt-8">
        <button
          onClick={handleSaveChanges}
          className="w-full md:w-auto py-3 px-6 bg-green-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Save Changes
        </button>
        <button
          onClick={() => setShowAddonsForm(!showAddonsForm)}
          className="w-full md:w-auto py-3 px-6 bg-blue-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          {showAddonsForm ? 'Cancel Addon' : 'Add Addon'}
        </button>
      </div>

      {/* Addon Form */}
      {showAddonsForm && (
        <div className="mt-12 bg-white p-8 rounded-lg shadow-xl space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Add Addon</h3>
          <div className="form-group">
            <input
              type="text"
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
              placeholder="Addon Name"
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              value={addonPrice}
              onChange={(e) => setAddonPrice(e.target.value)}
              placeholder="Addon Price"
              className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleAddAddon}
            className="w-full py-3 px-6 bg-blue-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Add Addon
          </button>
        </div>
      )}
    </div>
  );
};

export default Test;
