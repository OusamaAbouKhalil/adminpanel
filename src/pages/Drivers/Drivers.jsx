import React, { useState } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import { driverGrid } from '../../data/dummy';
import VehicleInfoModal from './VehicleInfoModal';
import AddDriverModal from './AddDriver';
import { addDriver, saveDriver } from '../../lib/firebase/api';

const Drivers = () => {
    const { drivers } = useStateContext();
    const [editIdx, setEditIdx] = useState(-1);
    const [editedDriver, setEditedDriver] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleEdit = (index) => {
        setEditIdx(index);
        setEditedDriver({ ...drivers[index] });
    };

    const handleChange = (e, field) => {
        setEditedDriver({ ...editedDriver, [field]: e.target.value });
    };

    const handleSave = async (driver) => {
        try {
            // Save the edited driver data using saveDriver function
            await saveDriver(driver);

            // Reset the edit state
            setEditIdx(-1);
            setEditedDriver(null);
        } catch (error) {
            console.error("Error saving driver data: ", error);
        }
    };

    const handleCancel = () => {
        setEditIdx(-1);
        setEditedDriver(null);
    };

    const handleShowModal = (driver) => {
        if (driver) {
            setEditedDriver(driver);
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setEditIdx(-1);
        setShowModal(false);
        setEditedDriver(null);
    };

    const handleShowAddModal = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleAddDriver = async (newDriver) => {
        await addDriver(newDriver);
        setShowAddModal(false);
    };

  
    return (
        <div className="p-6 bg-green-50 min-h-screen">
            <h2 className="text-3xl font-semibold text-green-800 mb-6">Drivers</h2>
            <button
                onClick={handleShowAddModal}
                className="mb-6 px-6 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
            >
                Add Driver
            </button>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="w-full text-sm text-center text-gray-600">
            <thead className="bg-green-600 text-white font-bold"> 
                        <tr>
                            {driverGrid.map((col) => (
                                <th key={col.value} className="py-3 px-4 text-left text-sm font-bold text-center text-white">
                                    {col.headerText}
                                </th>
                            ))}
                            <th className="py-3 px-4 text-left text-sm font-bold text-white text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-green-200">
                        {drivers.map((driver, index) => (
                            <tr key={index} className="hover:bg-green-100">
                                {driverGrid.map((col) => (
                                    <td key={col.value} className="py-3 px-4 text-sm text-green-700">
                                        {col.value === 'vehicle-info' ? (
                                            <button
                                                onClick={() => handleShowModal(driver)}
                                                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                View Vehicle Info
                                            </button>
                                        ) : editIdx === index ? (
                                            <input
                                                type={col.inputType}
                                                value={editedDriver[col.value]}
                                                onChange={(e) => handleChange(e, col.value)}
                                                className="w-full px-3 py-2 border border-green-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            driver[col.value]
                                        )}
                                    </td>
                                ))}
                                <td className="py-3 px-4 text-sm text-green-700">
                                    {editIdx === index ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(editedDriver)}
                                                className="mr-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && editedDriver && <VehicleInfoModal driver={editedDriver} onClose={handleCloseModal} onSave={handleSave} />}
            {showAddModal && <AddDriverModal onClose={handleCloseAddModal} onSave={handleAddDriver} />}
        </div>
    );
};

export default Drivers;