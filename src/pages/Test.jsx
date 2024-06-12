import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

const Test = () => {
  const { getMenuItem, setMenuItem, addAddonToMenuItem } = useStateContext();
  const { id, item_id } = useParams();
  const [item, setItem] = useState(null);
  const [ItemImage, setItemImage] = useState(null);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [showAddonsForm, setShowAddonsForm] = useState(false);
  const Navigate = useNavigate();
  const back = () => {
    Navigate(`/restaurants/${id}`);
  }
  useEffect(() => {
    const fetchItem = async () => {
      const item_data = await getMenuItem(id, item_id);
      setItem(item_data);
    };
    fetchItem();
  }, [id, item_id, getMenuItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (item) {
      await setMenuItem(id, item_id, item);
    }
  };
  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
    }
  }
  const handleAddAddon = () => {
    const addonData = {
      name: addonName,
      price: parseFloat(addonPrice),
    };
    addAddonToMenuItem(id, item_id, addonData);
    setAddonName('');
    setAddonPrice('');
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <button onClick={back} className='mb-2 bg-gray-500 rounded-lg'><span  className='bg-white rounded-lg m-0.5 px-4'>&#x2190;</span></button>
      {item && (
        <div>
          <div className='bg-gray-200 flex flex-col p-1 gap-1'>
            <div className='mt-10'>
              <label className="block text-gray-700 text-sm font-bold mb-2">Item Name:</label>
              <input
                type="text"
                name="item_name"
                value={item.item_name}
                onChange={handleInputChange}
                placeholder="Item Name"
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item Price:</label>
              <input
                type="text"
                name="item_price"
                value={item.item_price}
                onChange={handleInputChange}
                placeholder="Item Price"
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item Description:</label>
              <textarea
                name="item_description"
                value={item.item_description}
                onChange={handleInputChange}
                placeholder="Item Description"
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <div className="flex flex-col mt-10">
              <label className="block text-gray-700 text-sm font-bold mb-2">Availability:</label>
              <select
                name="isAvailable"
                onChange={handleInputChange}
                value={item.isAvailable}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              >
                <option value={true}>Available</option>
                <option value={false}>Not Available</option>
              </select>

              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item Image URL:</label>
              <input
                type="text"
                name="item_image"
                value={item.item_image}
                onChange={handleFileInputChange}
                placeholder="Item Image URL"
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
              <img className="object-cover h-48 w-full mt-4" src={item.item_image} alt="Preview" />

              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item Category:</label>
              <input
                type="text"
                name="item_category"
                value={item.item_category}
                onChange={handleInputChange}
                placeholder="Item Category"
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <button onClick={handleSaveChanges} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'>Save Changes</button>
            <button onClick={() => setShowAddonsForm(!showAddonsForm)} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'>Add Addon</button>
            {showAddonsForm && (
              <div className='mt-4'>
                <input
                  type="text"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  placeholder="Addon Name"
                  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                />
                <input
                  type="number"
                  value={addonPrice}
                  onChange={(e) => setAddonPrice(e.target.value)}
                  placeholder="Addon Price"
                  className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-4'
                />
                <button onClick={handleAddAddon} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4'>Add Addon</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;
