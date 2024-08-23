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
    return <div>Loading...</div>
  }
  return (
  <div className="m-4 md:m-12 mt-8 p-4 md:p-12 bg-white rounded-3xl shadow-lg">
    <button onClick={back} className='mb-4 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors'>
      <span className='bg-white rounded-lg px-4 py-2 text-gray-800'>&#x2190;</span>
    </button>
    
    {item && (
      <div className="space-y-6">
        <div className='bg-gray-100 p-6 rounded-lg shadow-md'>
          <div className='space-y-4'>
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Item Image:</label>
              <input
                type="file"
                onChange={handleFileInputChange}
                className='mb-4'
              />
              {item.item_image && (
                <div>
                  <img className="object-cover h-48 w-full mt-4 rounded-lg shadow-md" src={item.item_image} alt="Preview" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Item Name:</label>
              <input
                type="text"
                name="item_name"
                value={item.item_name}
                onChange={handleInputChange}
                placeholder="Item Name"
                className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Item Category:</label>
              <input
                type="text"
                name="item_category"
                value={item.item_category}
                onChange={handleInputChange}
                placeholder="Item Category"
                className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Item Price:</label>
              <input
                type="text"
                name="item_price"
                value={item.item_price}
                onChange={handleInputChange}
                placeholder="Item Price"
                className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Item Discount:</label>
              <input
                type="text"
                name="item_discount"
                value={item.item_discount}
                onChange={handleInputChange}
                placeholder="Item Discount"
                className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Item Description:</label>
              <textarea
                name="item_description"
                value={item.item_description}
                onChange={handleInputChange}
                placeholder="Item Description"
                className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">Availability:</label>
              <select
                name="available"
                onChange={handleInputChange}
                value={item.isAvailable}
                className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              >
                <option value={true}>Available</option>
                <option value={false}>Not Available</option>
              </select>
            </div>
          </div>

          <div className='mt-8 flex flex-col gap-4'>
            <button onClick={handleSaveChanges} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors'>
              Save Changes
            </button>
            <button onClick={() => setShowAddonsForm(!showAddonsForm)} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors'>
              Add Addon
            </button>
            {showAddonsForm && (
              <div className='bg-gray-100 p-4 rounded-lg shadow-md'>
                <input
                  type="text"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  placeholder="Addon Name"
                  className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                />
                <input
                  type="number"
                  value={addonPrice}
                  onChange={(e) => setAddonPrice(e.target.value)}
                  placeholder="Addon Price"
                  className='shadow-md appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-4'
                />
                <button onClick={handleAddAddon} className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md mt-4 transition-colors'>
                  Add Addon
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default Test;
