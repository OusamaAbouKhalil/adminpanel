import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

const Test = () => {
  const { getMenuItem, setMenuItem, addAddonToMenuItem, uploadImage } = useStateContext();
  const { id, item_id } = useParams();
  const [item, setItem] = useState(null);
  const [ItemImage, setItemImage] = useState(null);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [showAddonsForm, setShowAddonsForm] = useState(false);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      const item_data = await getMenuItem(id, item_id);
      setItem(item_data);
    };
    fetchItem();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // if (value == "true") {
    //   console.log('true')
    //   value = true
    // }
    setItem(prevItem => ({
      ...prevItem,
      [name]: name === ("item_price" || name === "item_discount") ? parseFloat(value) : name === "available" ? value == "true" : value
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
      await setMenuItem(id, item_id, item);
      Navigate(`/restaurants/${id}`);
    }
  };

  const handleAddAddon = () => {
    const addonData = {
      name: addonName,
      price: parseFloat(addonPrice),
    };
    addAddonToMenuItem(id, item_id, addonData);
    setAddonName('');
    setAddonPrice('');
  };

  const back = () => {
    Navigate(`/restaurants/${id}`);
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <button onClick={back} className='mb-2 bg-gray-500 rounded-lg'><span className='bg-white rounded-lg m-0.5 px-4'>&#x2190;</span></button>
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
              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item discount:</label>
              <input
                type="text"
                name="item_discount"
                value={item.item_discount}
                onChange={handleInputChange}
                placeholder="Item Discount"
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              />
              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item sizes:</label>

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
                name="available"
                onChange={handleInputChange}
                value={item.isAvailable}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              >
                <option value={true}>Available</option>
                <option value={false}>Not Available</option>
              </select>

              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Item Image:</label>
              <input
                type="file"
                onChange={handleFileInputChange}
                className='mb-4'
              />

              {item.item_image && (
                <div>
                  <img className="object-cover h-48 w-full mt-4" src={item.item_image} alt="Preview" />
                </div>
              )}

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
