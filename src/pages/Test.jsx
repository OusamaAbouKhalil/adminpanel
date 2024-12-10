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
  }

// Existing code logic remains unchanged
const handleSaveChanges = async () => {
  const imageDir = "images";

  try {
    let updatedImageUrl = item.item_image; // Retain the current image by default

    // Check if a new image is selected
    if (ItemImage) {
      // Upload the new image and get the URL
      updatedImageUrl = await uploadImage(ItemImage, imageDir);

      // Update the item_image field in the item state
      setItem((prevItem) => ({
        ...prevItem,
        item_image: updatedImageUrl,
      }));
    }

    // Save changes with the updated or existing image
    const updatedItem = {
      ...item,
      item_image: updatedImageUrl, // Ensure the image URL is included
    };

    // Call the mutation with the updated item data
    setMenuItem({ rest_id: id, item_id: item_id, itemData: updatedItem,item_image: updatedImageUrl });

    // Navigate to the restaurant's page
    Navigate(`/restaurants/${id}`);
  } catch (error) {
    console.error("Error uploading image or saving changes:", error);
  }
};

// Function to upload image and return the URL
const uploadImage = async (imageFile, directory) => {
  // Simulate the upload logic
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const imageUrl = `${directory}/${imageFile.name}`; // Simulated image URL
      resolve(imageUrl);
    }, 1000); // Simulated delay
  });
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
  }

  if (isPending) {
    return <div className="flex justify-center items-center h-64">
      <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="m-4 md:m-12 mt-24 p-4 md:p-12 bg-white rounded-3xl shadow-lg">
      <button onClick={back} className="mb-4 bg-gray-500 rounded-lg p-2">
        <span className="bg-white rounded-lg p-2 text-xl">&#x2190;</span>
      </button>

      {/* Check if item is loaded */}
      {item ? (
        <>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Form Inputs Section */}
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Item Name:</label>
              <input
                type="text"
                name="item_name"
                value={item.item_name}
                onChange={handleInputChange}
                placeholder="Item Name"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />

              <label className="block text-gray-700 text-sm font-semibold mb-2">Item Price:</label>
              <input
                type="text"
                name="item_price"
                value={item.item_price}
                onChange={handleInputChange}
                placeholder="Item Price"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />

              <label className="block text-gray-700 text-sm font-semibold mb-2">Item Discount:</label>
              <input
                type="text"
                name="item_discount"
                value={item.item_discount}
                onChange={handleInputChange}
                placeholder="Item Discount"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />

              <label className="block text-gray-700 text-sm font-semibold mb-2">Item Description:</label>
              <textarea
                name="item_description"
                value={item.item_description}
                onChange={handleInputChange}
                placeholder="Item Description"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />

              <label className="block text-gray-700 text-sm font-semibold mb-2">Availability:</label>
              <select
                name="available"
                onChange={handleInputChange}
                value={item.available}
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              >
                <option value={true}>Available</option>
                <option value={false}>Not Available</option>
              </select>

              <label className="block text-gray-700 text-sm font-semibold mb-2">Item Category:</label>
              <input
                type="text"
                name="item_category"
                value={item.item_category}
                onChange={handleInputChange}
                placeholder="Item Category"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Image Section */}
            <div className="relative w-full md:w-1/3 flex justify-center items-center">
              <div className="flex flex-col items-center">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Item Image:</label>
                <input
                  type="file"
                  onChange={handleFileInputChange}
                  className="mb-4"
                />
                {item.item_image && (
                  <img
                    className="object-cover w-36 h-36 mt-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                    src={item.item_image}
                    alt="Preview"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md">
              Save Changes
            </button>
            <button onClick={() => setShowAddonsForm(!showAddonsForm)} className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md">
              Add Addon
            </button>
          </div>

          {showAddonsForm && (
            <div className="mt-6 flex flex-col gap-4">
              <input
                type="text"
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
                placeholder="Addon Name"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />
              <input
                type="number"
                value={addonPrice}
                onChange={(e) => setAddonPrice(e.target.value)}
                placeholder="Addon Price"
                className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />
              <button onClick={handleAddAddon} className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md">
                Add Addon
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-48">
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Test;
