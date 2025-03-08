import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useCreateItem, useGetRestaurantAddons, useSaveItemAddons } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";
import { doc, getDoc } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";

const BulkItemEntryForm = ({ isOpen, onClose, restaurantId }) => {
    // Define the initial structure for a single item
    const initialItem = {
        item_name: "",
        item_category: "",
        item_price: 0,
        item_discount: 0,
        item_description: "",
        available: true,
        sizes: {},
        combo: {},
        likes: [],
        orders_count: 0,
        item_image: "",
    };

    // State for form fields
    const [items, setItems] = useState([{ ...initialItem }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([null]);
    const [imageFilesUrls, setImageFilesUrls] = useState([null]);
    const [categories, setCategories] = useState([]);
    const [progress, setProgress] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);

    // State for toggling form visibility
    const [showSizesForms, setShowSizesForms] = useState([false]);
    const [showComboForms, setShowComboForms] = useState([false]);

    // State for size and combo inputs
    const [sizeNames, setSizeNames] = useState([""]);
    const [sizePrices, setSizePrices] = useState([""]);
    const [comboNames, setComboNames] = useState([""]);
    const [comboPrices, setComboPrices] = useState([""]);

    // State for sizes and combos objects
    const [itemSizes, setItemSizes] = useState([{}]);
    const [itemCombos, setItemCombos] = useState([{}]);

    const [itemsSelectedAddons, setItemsSelectedAddons] = useState([[]]);
    const { data: restaurantAddons = [], isLoading: loadingRestaurantAddons } =
        useGetRestaurantAddons(restaurantId);
    const { mutate: saveItemAddons } = useSaveItemAddons();
    const handleAddonToggle = (itemIndex, addon) => {
        const newItemsSelectedAddons = [...itemsSelectedAddons];
        const currentItemAddons = [...(newItemsSelectedAddons[itemIndex] || [])];

        const isSelected = currentItemAddons.some(a => a.original_id === addon.id);

        if (isSelected) {
            newItemsSelectedAddons[itemIndex] = currentItemAddons.filter(a => a.original_id !== addon.id);
        } else {
            newItemsSelectedAddons[itemIndex] = [
                ...currentItemAddons,
                {
                    addon_name: addon.addon_name,
                    addon_price: addon.addon_price,
                    original_id: addon.id
                }
            ];
        }

        setItemsSelectedAddons(newItemsSelectedAddons);
    };
    // Get the mutation function from React Query
    const { mutateAsync: createItem } = useCreateItem();

    // Fetch restaurant categories when the modal opens
    useEffect(() => {
        const fetchCategories = async () => {
            if (!restaurantId) return;

            try {
                const docRef = doc(fsdb, "restaurants", restaurantId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCategories(data.sub_categories || []);
                } else {
                    console.error("Restaurant document not found");
                    toast.error("Restaurant not found");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to fetch categories");
            }
        };

        if (isOpen && restaurantId) {
            fetchCategories();
        }
    }, [restaurantId, isOpen]);

    // Toggle size form visibility for a specific item
    const toggleSizesForm = (index) => {
        const newShowSizesForms = [...showSizesForms];
        newShowSizesForms[index] = !newShowSizesForms[index];
        setShowSizesForms(newShowSizesForms);
    };

    // Toggle combo form visibility for a specific item
    const toggleComboForm = (index) => {
        const newShowComboForms = [...showComboForms];
        newShowComboForms[index] = !newShowComboForms[index];
        setShowComboForms(newShowComboForms);
    };

    // Handle input changes for fields
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        if (field === 'item_price' || field === 'item_discount') {
            newItems[index][field] = parseFloat(value) || 0;
        } else {
            newItems[index][field] = value;
        }
        setItems(newItems);
    };

    // Handle size name change
    const handleSizeNameChange = (index, value) => {
        const newSizeNames = [...sizeNames];
        newSizeNames[index] = value;
        setSizeNames(newSizeNames);
    };

    // Handle size price change
    const handleSizePriceChange = (index, value) => {
        const newSizePrices = [...sizePrices];
        newSizePrices[index] = value;
        setSizePrices(newSizePrices);
    };

    // Handle combo name change
    const handleComboNameChange = (index, value) => {
        const newComboNames = [...comboNames];
        newComboNames[index] = value;
        setComboNames(newComboNames);
    };

    // Handle combo price change
    const handleComboPriceChange = (index, value) => {
        const newComboPrices = [...comboPrices];
        newComboPrices[index] = value;
        setComboPrices(newComboPrices);
    };

    // Add a size to an item
    const handleAddSize = (index) => {
        if (!sizeNames[index] || !sizePrices[index]) {
            toast.error('Please fill in all size fields');
            return;
        }

        const newItemSizes = [...itemSizes];
        newItemSizes[index] = {
            ...newItemSizes[index],
            [sizeNames[index]]: parseFloat(sizePrices[index])
        };
        setItemSizes(newItemSizes);

        // Clear inputs
        const newSizeNames = [...sizeNames];
        const newSizePrices = [...sizePrices];
        newSizeNames[index] = "";
        newSizePrices[index] = "";
        setSizeNames(newSizeNames);
        setSizePrices(newSizePrices);
    };

    // Add a combo to an item
    const handleAddCombo = (index) => {
        if (!comboNames[index] || !comboPrices[index]) {
            toast.error('Please fill in all combo fields');
            return;
        }

        const newItemCombos = [...itemCombos];
        newItemCombos[index] = {
            ...newItemCombos[index],
            [comboNames[index]]: parseFloat(comboPrices[index])
        };
        setItemCombos(newItemCombos);

        // Clear inputs
        const newComboNames = [...comboNames];
        const newComboPrices = [...comboPrices];
        newComboNames[index] = "";
        newComboPrices[index] = "";
        setComboNames(newComboNames);
        setComboPrices(newComboPrices);
    };

    // Remove a size from an item
    const handleRemoveSize = (itemIndex, sizeName) => {
        const newItemSizes = [...itemSizes];
        const newSizes = { ...newItemSizes[itemIndex] };
        delete newSizes[sizeName];
        newItemSizes[itemIndex] = newSizes;
        setItemSizes(newItemSizes);
    };

    // Remove a combo from an item
    const handleRemoveCombo = (itemIndex, comboName) => {
        const newItemCombos = [...itemCombos];
        const newCombos = { ...newItemCombos[itemIndex] };
        delete newCombos[comboName];
        newItemCombos[itemIndex] = newCombos;
        setItemCombos(newItemCombos);
    };

    // Toggle availability status
    const toggleAvailable = (index) => {
        const newItems = [...items];
        newItems[index].available = !newItems[index].available;
        setItems(newItems);
    };

    // Handle file input changes
    const handleFileInputChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileURL = URL.createObjectURL(file);

        // Update the image files and URLs
        const newImageFiles = [...imageFiles];
        newImageFiles[index] = file;
        setImageFiles(newImageFiles);

        const newImageFilesUrls = [...imageFilesUrls];
        newImageFilesUrls[index] = fileURL;
        setImageFilesUrls(newImageFilesUrls);
    };

    // Add a new item to the form
    const addItem = () => {
        setItems([...items, { ...initialItem }]);
        setImageFiles([...imageFiles, null]);
        setImageFilesUrls([...imageFilesUrls, null]);
        setShowSizesForms([...showSizesForms, false]);
        setShowComboForms([...showComboForms, false]);
        setSizeNames([...sizeNames, ""]);
        setSizePrices([...sizePrices, ""]);
        setComboNames([...comboNames, ""]);
        setComboPrices([...comboPrices, ""]);
        setItemSizes([...itemSizes, {}]);
        setItemCombos([...itemCombos, {}]);
        setItemsSelectedAddons([...itemsSelectedAddons, []]);
    };

    // Remove an item from the form
    const removeItem = (index) => {
        if (items.length <= 1) {
            toast.error("At least one item is required");
            return;
        }

        setItems(items.filter((_, i) => i !== index));
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        setImageFilesUrls(imageFilesUrls.filter((_, i) => i !== index));
        setShowSizesForms(showSizesForms.filter((_, i) => i !== index));
        setShowComboForms(showComboForms.filter((_, i) => i !== index));
        setSizeNames(sizeNames.filter((_, i) => i !== index));
        setSizePrices(sizePrices.filter((_, i) => i !== index));
        setComboNames(comboNames.filter((_, i) => i !== index));
        setComboPrices(comboPrices.filter((_, i) => i !== index));
        setItemSizes(itemSizes.filter((_, i) => i !== index));
        setItemCombos(itemCombos.filter((_, i) => i !== index));
        setItemsSelectedAddons(itemsSelectedAddons.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error("Add at least one item to submit");
            return;
        }

        try {
            setIsSubmitting(true);
            setProgress(0);
            setProcessedCount(0);
            const totalItems = items.length;
            const imageDir = "images";

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                let updatedItem = { ...item };

                if (imageFiles[i]) {
                    updatedItem.item_image = await uploadImage(imageFiles[i], imageDir);
                } else {
                    updatedItem.item_image = "";
                }

                // Make sure these are proper objects and not empty/undefined
                updatedItem.sizes = itemSizes[i] || {};
                updatedItem.combo = itemCombos[i] || {};

                // Log the data being sent for debugging
                console.log(`Item ${i + 1} data:`, {
                    rest_id: restaurantId,
                    itemData: updatedItem
                });

                // Create the menu item
                const result = await createItem({
                    rest_id: restaurantId,
                    itemData: updatedItem
                });

                // Check if we successfully got back an item ID
                if (result?.id) {
                    console.log(`Item ${i + 1} created with ID: ${result.id}`);

                    // Make sure addons have valid original_id values
                    const validAddons = itemsSelectedAddons[i]?.filter(addon =>
                        addon && addon.original_id && addon.addon_name && addon.addon_price
                    );

                    // Save addons for this item if there are any valid ones
                    if (validAddons && validAddons.length > 0) {
                        console.log(`Saving ${validAddons.length} addons for item ${result.id}`, validAddons);

                        try {
                            await saveItemAddons({
                                restaurantId: restaurantId,
                                itemId: result.id,
                                selectedAddons: validAddons
                            });
                            console.log(`Addons saved successfully for item ${result.id}`);
                        } catch (addonError) {
                            console.error(`Error saving addons for item ${result.id}:`, addonError);
                            toast.error(`Item ${i + 1} created but addons failed to save: ${addonError.message}`);
                        }
                    }
                } else {
                    console.error(`Failed to get item ID for item ${i + 1}`);
                    toast.error(`Item ${i + 1} may not have been created properly`);
                }

                const newProcessedCount = i + 1;
                setProcessedCount(newProcessedCount);
                setProgress(Math.round((newProcessedCount / totalItems) * 100));
            }

            toast.success('Items added successfully');
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error adding items:', error);
            toast.error('Failed to add items: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset the form
    const resetForm = () => {
        setItems([{ ...initialItem }]);
        setImageFiles([null]);
        setImageFilesUrls([null]);
        setShowSizesForms([false]);
        setShowComboForms([false]);
        setSizeNames([""]);
        setSizePrices([""]);
        setComboNames([""]);
        setComboPrices([""]);
        setItemSizes([{}]);
        setItemCombos([{}]);
        setProgress(0);
        setProcessedCount(0);
        setItemsSelectedAddons([[]]);
    };

    // Don't render anything if the modal is closed
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => onClose()}>
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Bulk Add Menu Items</h2>

                {items.map((item, index) => (
                    <div key={index} className="border p-4 mb-8 rounded">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Item #{index + 1}</h3>
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Left Section: Form Fields */}
                            <div className="bg-white p-4 rounded-lg space-y-4">
                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Item Name</label>
                                    <input
                                        type="text"
                                        value={item.item_name}
                                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                        placeholder="Enter item name"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Item Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.item_price}
                                        onChange={(e) => handleItemChange(index, 'item_price', e.target.value)}
                                        placeholder="Enter item price"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Item Discount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.item_discount}
                                        onChange={(e) => handleItemChange(index, 'item_discount', e.target.value)}
                                        placeholder="Enter item discount"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Item Category</label>
                                    <select
                                        value={item.item_category}
                                        onChange={(e) => handleItemChange(index, 'item_category', e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
                                    >
                                        <option value="">Select a Category</option>
                                        {categories.map((category, idx) => (
                                            <option key={idx} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Availability</label>
                                    <button
                                        type="button"
                                        onClick={() => toggleAvailable(index)}
                                        className={`px-4 py-2 rounded-md ${item.available
                                            ? "bg-green-500 text-white"
                                            : "bg-red-500 text-white"
                                            }`}
                                    >
                                        {item.available ? "Available" : "Not Available"}
                                    </button>
                                </div>
                            </div>

                            {/* Right Section: Image Upload & Description */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Item Description</label>
                                    <textarea
                                        value={item.item_description}
                                        onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                        placeholder="Enter item description"
                                        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="block text-lg font-medium text-gray-800 mb-2">Item Image</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileInputChange(index, e)}
                                        className="cursor-pointer p-3 bg-gray-200 rounded-xl text-gray-700"
                                        accept="image/*"
                                    />
                                    {imageFilesUrls[index] && (
                                        <img
                                            src={imageFilesUrls[index]}
                                            alt="Item preview"
                                            className="mt-3 h-32 w-32 object-cover rounded"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sizes Section */}
                            <div className="bg-white p-4 rounded-lg shadow border space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-gray-800">Sizes</h3>
                                    <button
                                        onClick={() => toggleSizesForm(index)}
                                        className="py-1 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                    >
                                        {showSizesForms[index] ? 'Cancel' : 'Add Size'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(itemSizes[index] || {}).map(([name, price]) => (
                                        <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                            <span className="font-medium">{name}: ${price}</span>
                                            <button
                                                onClick={() => handleRemoveSize(index, name)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {showSizesForms[index] && (
                                    <div className="space-y-3 mt-4">
                                        <input
                                            type="text"
                                            value={sizeNames[index]}
                                            onChange={(e) => handleSizeNameChange(index, e.target.value)}
                                            placeholder="Size Name"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                        />
                                        <input
                                            type="number"
                                            value={sizePrices[index]}
                                            onChange={(e) => handleSizePriceChange(index, e.target.value)}
                                            placeholder="Size Price"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                        />
                                        <button
                                            onClick={() => handleAddSize(index)}
                                            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
                                        >
                                            Add Size
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Combos Section */}
                            <div className="bg-white p-4 rounded-lg shadow border space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-gray-800">Combos</h3>
                                    <button
                                        onClick={() => toggleComboForm(index)}
                                        className="py-1 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                    >
                                        {showComboForms[index] ? 'Cancel' : 'Add Combo'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(itemCombos[index] || {}).map(([name, price]) => (
                                        <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                            <span className="font-medium">{name}: ${price}</span>
                                            <button
                                                onClick={() => handleRemoveCombo(index, name)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {showComboForms[index] && (
                                    <div className="space-y-3 mt-4">
                                        <input
                                            type="text"
                                            value={comboNames[index]}
                                            onChange={(e) => handleComboNameChange(index, e.target.value)}
                                            placeholder="Combo Name"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                        />
                                        <input
                                            type="number"
                                            value={comboPrices[index]}
                                            onChange={(e) => handleComboPriceChange(index, e.target.value)}
                                            placeholder="Combo Price"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                        />
                                        <button
                                            onClick={() => handleAddCombo(index)}
                                            className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
                                        >
                                            Add Combo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border space-y-4 mt-4">
                            <h3 className="text-xl font-semibold text-gray-800">Available Addons</h3>

                            {loadingRestaurantAddons ? (
                                <p className="text-gray-500">Loading available addons...</p>
                            ) : restaurantAddons.length === 0 ? (
                                <p className="text-gray-500">No addons available for this restaurant.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {restaurantAddons.map(addon => (
                                        <div
                                            key={addon.id}
                                            onClick={() => handleAddonToggle(index, addon)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${itemsSelectedAddons[index]?.some(a => a.original_id === addon.id)
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="w-[85%]">
                                                    <p className="font-medium truncate">{addon.addon_name}</p>
                                                    <p className="text-sm text-green-600">
                                                        ${parseFloat(addon.addon_price).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    {itemsSelectedAddons[index]?.some(a => a.original_id === addon.id) ? (
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

                            {itemsSelectedAddons[index]?.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Selected Addons:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {itemsSelectedAddons[index].map(addon => (
                                            <span
                                                key={addon.original_id}
                                                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                                            >
                                                {addon.addon_name}: ${parseFloat(addon.addon_price).toFixed(2)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={addItem}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add Another Item
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit All'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>

                {isSubmitting && (
                    <div className="mt-6">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                                Creating items: {processedCount} of {items.length}
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                                {progress}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkItemEntryForm;