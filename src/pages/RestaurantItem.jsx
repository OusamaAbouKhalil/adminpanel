import React, { useEffect, useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadImage } from '../lib/firebase/api';
import { useSaveItemAddons, useDeleteMenuItemAddon, useGetAddons, useGetMenuItem, useGetRestaurantAddons, useSetMenuItem } from '../lib/query/queries';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

// Reusable Form Input Component
const FormInput = memo(({ label, name, value, onChange, type = "text", ...props }) => (
  <div className="form-group">
    <label className="text-lg font-medium text-gray-800">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      {...props}
    />
  </div>
));

// Loading Spinner Component
const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center h-64">
    <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
  </div>
));

const RestaurantItem = () => {
  const { id, item_id } = useParams();
  const Navigate = useNavigate();
  const { mutate: setMenuItem } = useSetMenuItem();
  const { data: itemData, isPending } = useGetMenuItem({ rest_id: id, item_id: item_id });

  const { data: addonsData, isPending: addonsPending } = useGetAddons({ rest_id: id, item_id: item_id });
  const { mutate: saveItemAddons } = useSaveItemAddons();
  const { mutate: deleteAddonFromMenuItem } = useDeleteMenuItemAddon();

  const [item, setItem] = useState(null);
  const [ItemImage, setItemImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [editingAddonId, setEditingAddonId] = useState(null);
  const [editingAddonName, setEditingAddonName] = useState('');
  const [editingAddonPrice, setEditingAddonPrice] = useState('');

  const [sizes, setSizes] = useState({});
  const [showSizesForm, setShowSizesForm] = useState(false);
  const [sizeName, setSizeName] = useState('');
  const [sizePrice, setSizePrice] = useState('');

  const [combo, setCombos] = useState({});
  const [showCombosForm, setShowCombosForm] = useState(false);
  const [comboName, setComboName] = useState('');
  const [comboPrice, setComboPrice] = useState('');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();
  const { data: restaurantAddons = [], isLoading: loadingRestaurantAddons } =
    useGetRestaurantAddons(id);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [localAddonsData, setLocalAddonsData] = useState([]);
  useEffect(() => {
    if (addonsData) {
      setLocalAddonsData(addonsData);
    }
  }, [addonsData]);
  useEffect(() => {
    if (itemData) {
      const hasChanges =
        JSON.stringify(itemData.sizes) !== JSON.stringify(sizes) ||
        JSON.stringify(itemData.combo) !== JSON.stringify(combo) ||
        JSON.stringify(itemData) !== JSON.stringify(item) ||
        ItemImage !== null;

      setHasUnsavedChanges(hasChanges);
    }
  }, [itemData, sizes, combo, item, ItemImage]);

  useEffect(() => {
    if (addonsData && restaurantAddons) {
      const linkedOriginalIds = addonsData.map(addon => addon.original_id);

      const matchedAddons = restaurantAddons.filter(addon =>
        linkedOriginalIds.includes(addon.id)
      );
      setSelectedAddons(matchedAddons);
    }
  }, [addonsData, restaurantAddons]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (itemData) {
      setItem(itemData);
      setSizes(itemData.sizes || {});
      setCombos(itemData.combo || {});
    }
  }, [itemData]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!item?.item_name) errors.item_name = 'Item name is required';
    if (!item?.item_price) errors.item_price = 'Price is required';
    if (item?.item_price < 0) errors.item_price = 'Price cannot be negative';
    return errors;
  }, [item]);

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const isAlreadySelected = prev.some(a => a.id === addon.id);
      if (isAlreadySelected) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddSize = useCallback(() => {
    if (!sizeName || !sizePrice) {
      toast.error('Please fill in all size fields');
      return;
    }

    setSizes(prev => ({
      ...prev,
      [sizeName]: parseFloat(sizePrice)
    }));
    setSizeName('');
    setSizePrice('');
  }, [sizeName, sizePrice]);

  const handleAddCombo = useCallback(() => {
    if (!comboName || !comboPrice) {
      toast.error('Please fill in all combo fields');
      return;
    }

    setCombos(prev => ({
      ...prev,
      [comboName]: parseFloat(comboPrice)
    }));
    setComboName('');
    setComboPrice('');
  }, [comboName, comboPrice]);

  const handleRemoveSize = useCallback((key) => {
    setSizes(prev => {
      const newSizes = { ...prev };
      delete newSizes[key];
      return newSizes;
    });
  }, []);

  const handleRemoveCombo = useCallback((key) => {
    setCombos(prev => {
      const newCombos = { ...prev };
      delete newCombos[key];
      return newCombos;
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: (name === "item_price" || name === "item_discount") && value
        ? parseFloat(value)
        : name === "available"
          ? value === "true"
          : value
    }));
  }, []);

  const handleFileInputChange = useCallback((e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setItemImage(file);
    }
  }, []);

  const handleSaveChanges = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // 1. First handle image upload if needed
      let updatedImageUrl = item.item_image;
      if (ItemImage) {
        const imageDir = "images";
        updatedImageUrl = await uploadImage(ItemImage, imageDir);
      }

      // 2. Next, update the main item data
      const updatedItem = {
        ...item,
        item_image: updatedImageUrl,
        sizes,
        combo
      };

      await setMenuItem({
        rest_id: id,
        item_id: item_id,
        itemData: updatedItem,
        item_image: updatedImageUrl
      });

      if (addonsData) {
        try {
          for (const addon of addonsData) {
            try {
              await deleteAddonFromMenuItem({
                rest_id: id,
                item_id: item_id,
                addon_id: addon.id
              });
            } catch (error) {
              console.error(`Failed to delete addon ${addon.id}:`, error);
            }
          }

          if (selectedAddons && selectedAddons.length > 0) {

            const addonDataArray = selectedAddons.map(addon => ({
              addon_name: addon.addon_name,
              addon_price: addon.addon_price,
              original_id: addon.id
            }));

            if (addonDataArray && addonDataArray.length > 0) {
              await saveItemAddons({
                restaurantId: id,
                itemId: item_id,
                selectedAddons: addonDataArray
              });
            }
          }


          await queryClient.invalidateQueries(['item_addons', id, item_id]);
        } catch (error) {
          console.error("Error managing item addons:", error);
        }
      }

      await queryClient.invalidateQueries(['item_addons', id, item_id]);

      setHasUnsavedChanges(false);
      toast.success('Changes saved successfully!');
    } catch (error) {
      toast.error('Failed to save changes. Please try again.');
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [item, ItemImage, id, item_id, validateForm, setMenuItem, sizes, combo, selectedAddons, addonsData]);

  const back = useCallback(() => {
    Navigate(`/restaurants/${id}`);
  }, [id, Navigate]);

  if (isPending || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-8 space-y-12">
      {hasUnsavedChanges && (
        <div className="sticky top-0 z-50 transition-all duration-300 ease-in-out">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have unsaved changes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="sticky top-16 z-50 transition-all duration-300 ease-in-out">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Back Button */}
      <button
        onClick={back}
        className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white rounded-full p-2 pt-1 transition duration-300 ease-in-out transform hover:scale-105"
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

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Addons Section */}
        <div className="bg-white p-8 rounded-lg shadow-xl space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Available Restaurant Addons</h3>
          {loadingRestaurantAddons ? (
            <p className="text-gray-500">Loading available addons...</p>
          ) : restaurantAddons.length === 0 ? (
            <p className="text-gray-500">No addons available for this restaurant. Please add some first.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div className='w-[85%]'>
                      <p className="font-medium truncate">{addon.addon_name}</p>
                      <p className="text-sm text-green-600">${addon.addon_price.toFixed(2)}</p>
                    </div>
                    <div>
                      {selectedAddons.some(a => a.id === addon.id) ? (
                        <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-white p-8 rounded-lg shadow-xl space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Item-Specific Addons</h3>

            {addonsPending ? (
              <p className="text-gray-500">Loading item addons...</p>
            ) : !addonsData || addonsData.length === 0 ? (
              <p className="text-gray-500">No item-specific addons found.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {localAddonsData.filter(addon => {
                    return !restaurantAddons.some(rAddon => rAddon.id === addon.original_id);
                  }).map(addon => (
                    <div key={addon.id} className="p-4 bg-gray-50 rounded-lg border border-green-100">
                      {editingAddonId === addon.id ? (
                        // Edit Mode with improved styling
                        <div className="w-full">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Addon Name
                            </label>
                            <input
                              type="text"
                              value={editingAddonName}
                              onChange={(e) => setEditingAddonName(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price
                            </label>
                            <input
                              type="number"
                              value={editingAddonPrice}
                              onChange={(e) => setEditingAddonPrice(e.target.value)}
                              step="0.01"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              onClick={() => setEditingAddonId(null)}
                              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (editingAddonName && editingAddonPrice) {
                                  const addonId = addon.id;

                                  // 1. Update local state immediately for instant UI feedback
                                  setLocalAddonsData(currentAddons =>
                                    currentAddons.map(a => {
                                      if (a.id === addonId) {
                                        return {
                                          ...a,
                                          addon_name: editingAddonName,
                                          addon_price: parseFloat(editingAddonPrice)
                                        };
                                      }
                                      return a;
                                    })
                                  );

                                  // 2. Process the database operations
                                  deleteAddonFromMenuItem({
                                    rest_id: id,
                                    item_id: item_id,
                                    addon_id: addonId
                                  });

                                  saveItemAddons({
                                    restaurantId: id,
                                    itemId: item_id,
                                    selectedAddons: [{
                                      addon_name: editingAddonName,
                                      addon_price: parseFloat(editingAddonPrice),
                                      original_id: addon.original_id || 'custom'
                                    }]
                                  });

                                  // 3. Eventually refresh the data from server
                                  queryClient.invalidateQueries(['item_addons', id, item_id]);

                                  // 4. Exit edit mode
                                  setEditingAddonId(null);
                                }
                              }}
                              className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg transition duration-200"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode with improved layout
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium truncate">{addon.addon_name}</span>
                            <p className="text-sm text-green-600">${parseFloat(addon.addon_price).toFixed(2)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingAddonId(addon.id);
                                setEditingAddonName(addon.addon_name);
                                setEditingAddonPrice(addon.addon_price.toString());
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition duration-200"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this addon?")) {
                                  deleteAddonFromMenuItem({
                                    rest_id: id,
                                    item_id: item_id,
                                    addon_id: addon.id
                                  });
                                }
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition duration-200"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sizes Section */}
        <div className="bg-white p-8 rounded-lg shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">Sizes</h3>
            <button
              onClick={() => setShowSizesForm(!showSizesForm)}
              className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300"
            >
              {showSizesForm ? 'Cancel' : 'Add Size'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.entries(sizes).map(([name, price]) => (
              <div key={name} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium">{name}: ${price}</span>
                <button
                  onClick={() => handleRemoveSize(name)}
                  className="text-red-500 hover:text-red-700 transition duration-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {showSizesForm && (
            <div className="space-y-4 mt-6">
              <input
                type="text"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                placeholder="Size Name"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                value={sizePrice}
                onChange={(e) => setSizePrice(e.target.value)}
                placeholder="Size Price"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddSize}
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl transition duration-300"
              >
                Add Size
              </button>
            </div>
          )}
        </div>

        {/* Combos Section */}
        <div className="bg-white p-8 rounded-lg shadow-xl space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">Combos</h3>
            <button
              onClick={() => setShowCombosForm(!showCombosForm)}
              className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-300"
            >
              {showCombosForm ? 'Cancel' : 'Add Combo'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.entries(combo).map(([name, price]) => (
              <div key={name} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium">{name}: ${price}</span>
                <button
                  onClick={() => handleRemoveCombo(name)}
                  className="text-red-500 hover:text-red-700 transition duration-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {showCombosForm && (
            <div className="space-y-4 mt-6">
              <input
                type="text"
                value={comboName}
                onChange={(e) => setComboName(e.target.value)}
                placeholder="Combo Name"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                value={comboPrice}
                onChange={(e) => setComboPrice(e.target.value)}
                placeholder="Combo Price"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddCombo}
                className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl transition duration-300"
              >
                Add Combo
              </button>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-between gap-6 mt-8">
        </div>
        <button
          onClick={handleSaveChanges}
          className="w-full md:w-auto py-3 px-6 bg-green-500 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default memo(RestaurantItem);