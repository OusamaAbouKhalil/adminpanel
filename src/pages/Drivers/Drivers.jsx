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
      await saveDriver(driver);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Drivers
          </h2>
          <button
            onClick={handleShowAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="text-sm uppercase tracking-wide">Add Driver</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  {driverGrid.map((col) => (
                    <th
                      key={col.value}
                      className="py-4 px-6 text-left font-semibold tracking-wide uppercase"
                    >
                      {col.headerText}
                    </th>
                  ))}
                  <th className="py-4 px-6 text-left font-semibold tracking-wide uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drivers.map((driver, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    {driverGrid.map((col) => (
                      <td key={col.value} className="py-4 px-6">
                        {col.value === 'vehicle-info' ? (
                          <button
                            onClick={() => handleShowModal(driver)}
                            className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 font-medium text-sm"
                          >
                            View Vehicle
                          </button>
                        ) : editIdx === index ? (
                          <input
                            type={col.inputType}
                            value={editedDriver[col.value]}
                            onChange={(e) => handleChange(e, col.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 transition-all duration-200"
                          />
                        ) : (
                          <span className="text-gray-700">{driver[col.value]}</span>
                        )}
                      </td>
                    ))}
                    <td className="py-4 px-6">
                      {editIdx === index ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(editedDriver)}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium text-sm"
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
        </div>

        {/* Modals */}
        {showModal && editedDriver && (
          <VehicleInfoModal
            driver={editedDriver}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
        {showAddModal && (
          <AddDriverModal
            onClose={handleCloseAddModal}
            onSave={handleAddDriver}
          />
        )}
      </div>
    </div>
  );
};

export default Drivers;