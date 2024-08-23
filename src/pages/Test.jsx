import React, { useState } from 'react';
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
  const [item, setItem] = useState(itemData ? itemData : null);
  const Navigate = useNavigate();


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: (name === "item_price" || name === "item_discount") && value ? parseFloat(value) : name === "available" ? value == "true" : value
    }));
  };


  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
    }
  }

  const handleSaveChanges = async () => {
    if (ItemImage) {
      const mainImageUrl = await uploadImage(ItemImage);
      setItem(prevItem => ({
        ...prevItem,
        item_image: mainImageUrl
      }))
    }
    if (item) {
      setMenuItem({ rest_id: id, item_id: item_id, itemData: item });
      Navigate(`/restaurants/${id}`);
    }
  };

  const handleAddAddon = () => {
    const addonData = {
      name: addonName,
      price: parseFloat(addonPrice),
    };
    addAddonToMenuItem({ rest_id: id, item_id: item_id, addonData: addonData });
    setAddonName('');
    setAddonPrice('');
  };

  const back = () => {
    Navigate(`/restaurants/${id}`);
  }

 if (isPending) {
    return <div>Loading...</div>;
  }

 return (
  <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
    <button onClick={back} className="mb-2 bg-gray-500 rounded-lg">
      <span className="bg-white rounded-lg m-0.5 px-4">&#x2190;</span>
    </button>
    {item && (
      <div className="flex flex-col md:flex-row gap-6">
        {/* Form Inputs Section */}
        <div className="flex-1">
          <label className="block text-gray-700 text-sm font-bold">Item Name:</label>
          <input
            type="text"
            name="item_name"
            value={item.item_name}
            onChange={handleInputChange}
            placeholder="Item Name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />

          <label className="block text-gray-700 text-sm font-bold mt-4">Item Price:</label>
          <input
            type="text"
            name="item_price"
            value={item.item_price}
            onChange={handleInputChange}
            placeholder="Item Price"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />

          <label className="block text-gray-700 text-sm font-bold mt-4">Item Discount:</label>
          <input
            type="text"
            name="item_discount"
            value={item.item_discount}
            onChange={handleInputChange}
            placeholder="Item Discount"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />

          <label className="block text-gray-700 text-sm font-bold mt-4">Item Description:</label>
          <textarea
            name="item_description"
            value={item.item_description}
            onChange={handleInputChange}
            placeholder="Item Description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />

          <label className="block text-gray-700 text-sm font-bold mt-4">Availability:</label>
          <select
            name="available"
            onChange={handleInputChange}
            value={item.isAvailable}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={true}>Available</option>
            <option value={false}>Not Available</option>
          </select>

          <label className="block text-gray-700 text-sm font-bold mt-4">Item Category:</label>
          <input
            type="text"
            name="item_category"
            value={item.item_category}
            onChange={handleInputChange}
            placeholder="Item Category"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Image Section */}
        <div className="relative w-full md:w-1/3 flex justify-end">
          <div className="flex flex-col items-center">
            <label className="block text-gray-700 text-sm font-bold mb-2">Item Image:</label>
            <input
              type="file"
              onChange={handleFileInputChange}
              className="mb-4"
            />
            {item.item_image && (
              <img
                className="object-cover w-32 h-32 mt-4 transition-transform transform hover:scale-105 cursor-pointer"
                src={item.item_image}
                alt="Preview"
              />
            )}
          </div>
        </div>
      </div>
    )}

    {/* Buttons */}
    <div className="flex flex-col md:flex-row gap-4 mt-4">
      <button onClick={handleSaveChanges} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Save Changes
      </button>
      <button onClick={() => setShowAddonsForm(!showAddonsForm)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Add Addon
      </button>
    </div>

    {showAddonsForm && (
      <div className="mt-4 flex flex-col gap-4">
        <input
          type="text"
          value={addonName}
          onChange={(e) => setAddonName(e.target.value)}
          placeholder="Addon Name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <input
          type="number"
          value={addonPrice}
          onChange={(e) => setAddonPrice(e.target.value)}
          placeholder="Addon Price"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button onClick={handleAddAddon} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Addon
        </button>
      </div>
    )}
  </div>
);

};

export default Test;
