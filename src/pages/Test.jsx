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

  // State for addons, sizes, and combos
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [showAddonsForm, setShowAddonsForm] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [combos, setCombos] = useState([]);
  const [sizeForm, setSizeForm] = useState({ name: '', price: '' });
  const [comboForm, setComboForm] = useState({ name: '', price: '' });

  const [item, setItem] = useState();
  const Navigate = useNavigate();

  useEffect(() => {
    if (itemData) {
      setItem(itemData);
      setSizes(itemData.sizes || []);
      setCombos(itemData.combo || []);
    }
  }, [itemData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: (name === "item_price" || name === "item_discount") && value
        ? parseFloat(value)
        : name === "available"
        ? value === "true"
        : value,
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
      const updatedItem = { ...item, item_image: updatedImageUrl, sizes, combo: combos };
      setMenuItem({ rest_id: id, item_id: item_id, itemData: updatedItem });
      Navigate(`/restaurants/${id}`);
    } catch (error) {
      console.error("Error uploading image or saving changes:", error);
    }
  };

  const handleAddAddon = () => {
    const addonData = { addon_name: addonName, addon_price: parseFloat(addonPrice) };
    addAddonToMenuItem({ rest_id: id, item_id: item_id, addonData });
    setAddonName('');
    setAddonPrice('');
  };

  const handleAddSize = () => {
    setSizes([...sizes, { ...sizeForm, price: parseFloat(sizeForm.price) }]);
    setSizeForm({ name: '', price: '' });
  };

  const handleAddCombo = () => {
    setCombos([...combos, { ...comboForm, price: parseFloat(comboForm.price) }]);
    setComboForm({ name: '', price: '' });
  };

  const handleDelete = (index, type) => {
    if (type === 'size') setSizes(sizes.filter((_, i) => i !== index));
    if (type === 'combo') setCombos(combos.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-8 space-y-12">
      <button
        onClick={() => Navigate(`/restaurants/${id}`)}
        className="mb-8 bg-gray-700 text-white rounded-full p-4"
      >
        &#x2190; Back
      </button>

      {item ? (
        <div>
          {/* General Fields */}
          <div>
            {/* ...existing form fields for item details */}
          </div>

          {/* Sizes Section */}
          <div>
            <h3>Sizes</h3>
            {sizes.map((size, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{size.name} - ${size.price}</span>
                <button onClick={() => handleDelete(index, 'size')}>Delete</button>
              </div>
            ))}
            <div>
              <input
                type="text"
                value={sizeForm.name}
                onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                placeholder="Size Name"
              />
              <input
                type="number"
                value={sizeForm.price}
                onChange={(e) => setSizeForm({ ...sizeForm, price: e.target.value })}
                placeholder="Price"
              />
              <button onClick={handleAddSize}>Add Size</button>
            </div>
          </div>

          {/* Combos Section */}
          <div>
            <h3>Combos</h3>
            {combos.map((combo, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{combo.name} - ${combo.price}</span>
                <button onClick={() => handleDelete(index, 'combo')}>Delete</button>
              </div>
            ))}
            <div>
              <input
                type="text"
                value={comboForm.name}
                onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })}
                placeholder="Combo Name"
              />
              <input
                type="number"
                value={comboForm.price}
                onChange={(e) => setComboForm({ ...comboForm, price: e.target.value })}
                placeholder="Price"
              />
              <button onClick={handleAddCombo}>Add Combo</button>
            </div>
          </div>

          {/* Save Changes */}
          <button onClick={handleSaveChanges}>Save Changes</button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Test;