import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadImage } from '../lib/firebase/api';
import { useAddAddonToMenuItem, useGetMenuItem, useSetMenuItem } from '../lib/query/queries';

const Test = () => {
  const { mutate: setMenuItem } = useSetMenuItem();
  const { id, item_id } = useParams();
  const { data: itemData, isPending } = useGetMenuItem({ rest_id: id, item_id: item_id });
  const [item, setItem] = useState();
  const [sizesForm, setSizesForm] = useState([]);
  const [comboForm, setComboForm] = useState({});
  const [itemImage, setItemImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (itemData) {
      setItem(itemData);
      setSizesForm(itemData.sizes || []);
      setComboForm(itemData.combo || {});
    }
  }, [itemData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: (name === "item_price" || name === "item_discount") && value 
        ? parseFloat(value) 
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
      let updatedImageUrl = item.item_image;
      if (itemImage) {
        updatedImageUrl = await uploadImage(itemImage, imageDir);
      }

      const updatedItem = {
        ...item,
        sizes: sizesForm,
        combo: comboForm,
        item_image: updatedImageUrl,
      };

      setMenuItem({ rest_id: id, item_id: item_id, itemData: updatedItem });
      navigate(`/restaurants/${id}`);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleAddSize = () => {
    setSizesForm([...sizesForm, { name: "", price: 0 }]);
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizesForm];
    updatedSizes[index][field] = field === "price" ? parseFloat(value) : value;
    setSizesForm(updatedSizes);
  };

  const handleComboChange = (field, value) => {
    setComboForm(prevCombo => ({
      ...prevCombo,
      [field]: value,
    }));
  };

  const back = () => {
    navigate(`/restaurants/${id}`);
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-12">
      <button onClick={back} className="mb-8 bg-gray-700 text-white rounded-full p-4">
        Back
      </button>

      {item ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg space-y-6">
            <h2>Edit Menu Item</h2>
            <input
              type="text"
              name="item_name"
              value={item.item_name}
              onChange={handleInputChange}
              placeholder="Item Name"
            />
            <input
              type="number"
              name="item_price"
              value={item.item_price}
              onChange={handleInputChange}
              placeholder="Item Price"
            />
            <textarea
              name="item_description"
              value={item.item_description}
              onChange={handleInputChange}
              placeholder="Item Description"
            />

            <h3>Sizes</h3>
            {sizesForm.map((size, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={size.name}
                  onChange={(e) => handleSizeChange(index, "name", e.target.value)}
                  placeholder="Size Name"
                />
                <input
                  type="number"
                  value={size.price}
                  onChange={(e) => handleSizeChange(index, "price", e.target.value)}
                  placeholder="Size Price"
                />
              </div>
            ))}
            <button onClick={handleAddSize}>Add Size</button>

            <h3>Combo</h3>
            <input
              type="text"
              value={comboForm.name || ""}
              onChange={(e) => handleComboChange("name", e.target.value)}
              placeholder="Combo Name"
            />
            <input
              type="number"
              value={comboForm.price || 0}
              onChange={(e) => handleComboChange("price", e.target.value)}
              placeholder="Combo Price"
            />
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h3>Item Image</h3>
            <input type="file" onChange={handleFileInputChange} />
            {item.item_image && <img src={item.item_image} alt="Item" />}
          </div>
        </div>
      ) : (
        <div>No Item Found</div>
      )}

      <button onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
};

export default Test;