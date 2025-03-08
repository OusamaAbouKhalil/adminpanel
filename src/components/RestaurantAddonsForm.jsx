import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddAddonToRestaurant, useGetRestaurantAddons, useDeleteAddon, useUpdateAddon } from '../lib/query/queries';

const RestaurantAddonsForm = ({ isOpen, onClose, restaurantId }) => {
    const [newAddons, setNewAddons] = useState([{ addon_name: '', addon_price: 0 }]);
    const [editedAddons, setEditedAddons] = useState({});
    const [addonsToDelete, setAddonsToDelete] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showExistingAddons, setShowExistingAddons] = useState(false);
    const [showNewAddons, setShowNewAddons] = useState(true);

    // Get existing addons
    const { data: existingAddons = [], isLoading: isLoadingAddons } = useGetRestaurantAddons(restaurantId, isOpen);

    // Mutations
    const addAddonMutation = useAddAddonToRestaurant();
    const updateAddonMutation = useUpdateAddon();
    const deleteAddonMutation = useDeleteAddon();

    // Reset form state when modal opens
    useEffect(() => {
        if (isOpen) {
            setNewAddons([{ addon_name: '', addon_price: 0 }]);
            setEditedAddons({});
            setAddonsToDelete([]);
            setShowExistingAddons(false);
            setShowNewAddons(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddAddon = () => {
        setNewAddons([...newAddons, { addon_name: '', addon_price: 0 }]);
    };

    const handleRemoveAddon = (index) => {
        const updatedAddons = [...newAddons];
        updatedAddons.splice(index, 1);
        setNewAddons(updatedAddons);
    };

    const handleChange = (index, field, value) => {
        const updatedAddons = [...newAddons];
        updatedAddons[index] = {
            ...updatedAddons[index],
            [field]: field === 'addon_price' ? parseFloat(value) || 0 : value
        };
        setNewAddons(updatedAddons);
    };

    const handleEditExistingAddon = (addon, field, value) => {
        const updatedValue = field === 'addon_price' ? parseFloat(value) || 0 : value;
        setEditedAddons({
            ...editedAddons,
            [addon.id]: {
                ...addon,
                ...(editedAddons[addon.id] || {}),
                [field]: updatedValue
            }
        });
    };

    const handleDeleteExistingAddon = (addonId) => {
        setAddonsToDelete([...addonsToDelete, addonId]);
    };

    const undoDeleteAddon = (addonId) => {
        setAddonsToDelete(addonsToDelete.filter(id => id !== addonId));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Create new addons
            const validNewAddons = newAddons.filter(addon => addon.addon_name.trim() !== '');
            if (validNewAddons.length > 0) {
                await Promise.all(validNewAddons.map(addon =>
                    addAddonMutation.mutateAsync({ restaurantId, addonData: addon })
                ));
            }

            // Update modified addons
            const addonUpdates = Object.entries(editedAddons);
            if (addonUpdates.length > 0) {
                await Promise.all(addonUpdates.map(([addonId, addonData]) =>
                    updateAddonMutation.mutateAsync({
                        restaurantId,
                        addonId,
                        addonData
                    })
                ));
            }

            // Delete addons
            if (addonsToDelete.length > 0) {
                await Promise.all(addonsToDelete.map(addonId =>
                    deleteAddonMutation.mutateAsync({
                        restaurantId,
                        addonId
                    })
                ));
            }

            onClose();
        } catch (error) {
            console.error("Error managing addons:", error);
            alert("Failed to save addons. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAddonDeleted = (addonId) => addonsToDelete.includes(addonId);
    const getEditedAddon = (addon) => editedAddons[addon.id] || addon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </span>
                    Restaurant Addons
                </h2>

                {/* Existing Addons Section */}
                {existingAddons.length > 0 && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                                Existing Addons
                                <span className="ml-2 text-sm text-gray-500">({existingAddons.length})</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowExistingAddons(!showExistingAddons)}
                                className="text-sm text-purple-600 hover:text-purple-800"
                            >
                                {showExistingAddons ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showExistingAddons && (
                            <div className="space-y-4 mb-6">
                                {isLoadingAddons ? (
                                    <div className="flex justify-center items-center p-8">
                                        <FaSpinner className="animate-spin text-purple-600 text-2xl" />
                                        <span className="ml-2 text-gray-600">Loading addons...</span>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {existingAddons.map((addon) => (
                                            <motion.div
                                                key={addon.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{
                                                    opacity: isAddonDeleted(addon.id) ? 0.5 : 1,
                                                    y: 0,
                                                    scale: isAddonDeleted(addon.id) ? 0.98 : 1
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={`bg-gray-50 p-4 rounded-lg shadow-sm border ${isAddonDeleted(addon.id)
                                                    ? 'border-red-200 bg-red-50'
                                                    : editedAddons[addon.id]
                                                        ? 'border-yellow-200 bg-yellow-50'
                                                        : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-lg font-medium text-gray-700">
                                                        {isAddonDeleted(addon.id) ? (
                                                            <span className="text-red-500">Marked for deletion</span>
                                                        ) : (
                                                            <span>
                                                                {editedAddons[addon.id] && (
                                                                    <span className="text-yellow-600 text-sm mr-2">[Modified]</span>
                                                                )}
                                                                {getEditedAddon(addon).addon_name}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex space-x-2">
                                                        {isAddonDeleted(addon.id) ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => undoDeleteAddon(addon.id)}
                                                                className="text-blue-500 hover:text-blue-700 px-2 py-1 text-sm rounded-md hover:bg-blue-50"
                                                            >
                                                                Undo
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteExistingAddon(addon.id)}
                                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {!isAddonDeleted(addon.id) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                            <input
                                                                type="text"
                                                                value={getEditedAddon(addon).addon_name}
                                                                onChange={(e) => handleEditExistingAddon(addon, 'addon_name', e.target.value)}
                                                                placeholder="Addon name"
                                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                                            <input
                                                                type="number"
                                                                value={getEditedAddon(addon).addon_price}
                                                                onChange={(e) => handleEditExistingAddon(addon, 'addon_price', e.target.value)}
                                                                placeholder="0.00"
                                                                step="0.01"
                                                                min="0"
                                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Divider when both sections are present */}
                {existingAddons.length > 0 && (
                    <div className="border-t border-gray-200 my-6"></div>
                )}

                {/* New Addons Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                            New Addons
                            <span className="ml-2 text-sm text-gray-500">({newAddons.length})</span>
                        </h3>
                        {newAddons.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowNewAddons(!showNewAddons)}
                                className="text-sm text-purple-600 hover:text-purple-800"
                            >
                                {showNewAddons ? 'Hide' : 'Show'}
                            </button>
                        )}
                    </div>

                    {showNewAddons && (
                        <div className="space-y-4 mb-6">
                            {newAddons.map((addon, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-medium text-green-700">New Addon #{index + 1}</h3>
                                        {newAddons.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAddon(index)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={addon.addon_name}
                                                onChange={(e) => handleChange(index, 'addon_name', e.target.value)}
                                                placeholder="Addon name"
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                value={addon.addon_price}
                                                onChange={(e) => handleChange(index, 'addon_price', e.target.value)}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleAddAddon}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors"
                    >
                        <FaPlus /> Add New Addon
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6 border-t pt-6 border-gray-200">
                    <div>
                        {/* Summary of changes */}
                        {(Object.keys(editedAddons).length > 0 || addonsToDelete.length > 0 || newAddons.some(a => a.addon_name.trim() !== '')) && (
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Changes: </span>
                                {newAddons.some(a => a.addon_name.trim() !== '') && (
                                    <span className="text-green-600 mr-3">
                                        {newAddons.filter(a => a.addon_name.trim() !== '').length} new
                                    </span>
                                )}
                                {Object.keys(editedAddons).length > 0 && (
                                    <span className="text-yellow-600 mr-3">
                                        {Object.keys(editedAddons).length} modified
                                    </span>
                                )}
                                {addonsToDelete.length > 0 && (
                                    <span className="text-red-600">
                                        {addonsToDelete.length} deleted
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:bg-purple-400 flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : 'Save Addons'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RestaurantAddonsForm;