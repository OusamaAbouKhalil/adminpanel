import React, { useState } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import { driverGrid } from '../../data/dummy';
import VehicleInfoModal from './VehicleInfoModal';
import AddDriverModal from './AddDriver';
import { push, ref } from 'firebase/database';
import db from '../../utils/firebaseconfig';
import { addDriver, saveDriver } from '../../lib/firebase/api';
import { add } from 'date-fns';

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
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Drivers</h2>
            <button
                onClick={handleShowAddModal}
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
                Add Driver
            </button>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            {driverGrid.map((col) => (
                                <th key={col.value} className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">
                                    {col.headerText}
                                </th>
                            ))}
                            <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map((driver, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {driverGrid.map((col) => (
                                    <td key={col.value} className="py-2 px-4 border-b border-gray-200">
                                        {col.value === 'vehicle-info' ? (
                                            <button
                                                onClick={() => handleShowModal(driver)}
                                                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                View Vehicle Info
                                            </button>
                                        ) : editIdx === index ? (
                                            <input
                                                type={col.inputType}
                                                value={editedDriver[col.value]}
                                                onChange={(e) => handleChange(e, col.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                            />
                                        ) : (
                                            driver[col.value]
                                        )}
                                    </td>
                                ))}
                                <td className="py-2 px-4 border-b border-gray-200">
                                    {editIdx === index ? (
                                        <>
                                            <button
                                                onClick={() => handleSave(editedDriver)}
                                                className="mr-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
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
}

export default Drivers;