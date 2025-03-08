import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header, SizesForm } from "../components";
import { useCreateItem, useGetRestaurantAddons, useSaveItemAddons } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";
import { transformSizesToObject } from "../lib/utils";
import { getDoc, doc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import { FaCheckSquare, FaRegSquare, FaTag, FaDollarSign, FaImage, FaList } from "react-icons/fa";

function AddItem() {
  const { id } = useParams();
  const { mutateAsync: createItem } = useCreateItem();
  const { mutateAsync: saveItemAddons } = useSaveItemAddons();
  const navigate = useNavigate();
  const [sizesForm, setSizesForm] = useState([]);
  const [comboSizesForm, setComboSizesForm] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [menuData, setMenuData] = useState({
    item_category: "",
    available: true,
    combo: {},
    item_description: "",
    item_name: "",
    item_price: 0,
    item_discount: 0,
    likes: [],
    orders_count: 0,
    sizes: {},
  });

  const [itemImage, setItemImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);

  const { data: restaurantAddons = [], isLoading: loadingAddons } = useGetRestaurantAddons(id);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const docRef = doc(fsdb, "restaurants", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCategories(data.sub_categories || []);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [id]);

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.some(a => a.original_id === addon.id);
      if (isSelected) {
        return prev.filter(a => a.original_id !== addon.id);
      } else {
        return [...prev, { ...addon, original_id: addon.id }];
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMenuData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox"
        ? checked
        : (name === "item_price" || name === "item_discount") && value !== ""
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const imageDir = "images";
    try {
      let itemImageUrl = "";
      if (itemImage) {
        itemImageUrl = await uploadImage(itemImage, imageDir);
      }

      // First create the item
      const itemData = {
        ...menuData,
        sizes: transformSizesToObject(sizesForm),
        combo: transformSizesToObject(comboSizesForm),
        item_image: itemImageUrl,
      };

      const result = await createItem({
        rest_id: id,
        itemData: itemData
      });

      // Check if we have selected addons and a valid item ID
      if (selectedAddons.length > 0 && result?.id) {
        await saveItemAddons({
          restaurantId: id,
          itemId: result.id,
          selectedAddons: selectedAddons
        });
      }

      navigate(`/restaurants/${id}`);
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert(`Error creating item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Menu" title="Add New Item" />

      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Name */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaTag className="inline mr-2 text-green-600" />
                  Item Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  type="text"
                  name="item_name"
                  value={menuData.item_name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />
              </div>

              {/* Category */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaList className="inline mr-2 text-green-600" />
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  name="item_category"
                  value={menuData.item_category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaDollarSign className="inline mr-2 text-green-600" />
                  Price
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  type="number"
                  step="0.01"
                  min="0"
                  name="item_price"
                  value={menuData.item_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount %
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  type="number"
                  min="0"
                  max="100"
                  name="item_discount"
                  value={menuData.item_discount}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  name="item_description"
                  value={menuData.item_description}
                  onChange={handleChange}
                  placeholder="Describe this item"
                />
              </div>

              {/* Image Upload */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaImage className="inline mr-2 text-green-600" />
                  Item Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  {previewImage && (
                    <div className="h-20 w-20 rounded-md overflow-hidden">
                      <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Available Switch */}
              <div className="col-span-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    name="available"
                    checked={menuData.available}
                    onChange={handleChange}
                  />
                  <div className={`relative w-11 h-6 rounded-full transition ${menuData.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white transition transform ${menuData.available ? 'translate-x-6' : 'translate-x-1'} top-1`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {menuData.available ? 'Available' : 'Not Available'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Sizes and Combos Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Sizes</h3>
              <SizesForm sizesForm={sizesForm} setSizesForm={setSizesForm} />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Combo Options</h3>
              <SizesForm sizesForm={comboSizesForm} setSizesForm={setComboSizesForm} />
            </div>
          </div>

          {/* Addons Section */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Available Addons</h3>

            {loadingAddons ? (
              <p className="text-gray-500">Loading addons...</p>
            ) : restaurantAddons.length === 0 ? (
              <p className="text-gray-500">No addons available for this restaurant. Please add some first.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {restaurantAddons.map(addon => (
                  <div
                    key={addon.id}
                    onClick={() => handleAddonToggle(addon)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedAddons.some(a => a.id === addon.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{addon.addon_name}</p>
                        <p className="text-sm text-green-600">${addon.addon_price.toFixed(2)}</p>
                      </div>
                      <div>
                        {selectedAddons.some(a => a.id === addon.id) ? (
                          <FaCheckSquare className="text-green-600 text-xl" />
                        ) : (
                          <FaRegSquare className="text-gray-400 text-xl" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg shadow-sm text-white font-medium ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {loading ? "Submitting..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItem;