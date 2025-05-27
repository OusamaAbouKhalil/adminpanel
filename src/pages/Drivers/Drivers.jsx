import React, { useState, useEffect } from 'react';
import { useStateContext } from '../../contexts/ContextProvider';
import { driverGrid } from '../../data/dummy';
import VehicleInfoModal from './VehicleInfoModal';
import AddDriverModal from './AddDriver';
import DriverRidesModal from './DriverRidesModal';
import { addDriver, saveDriver, getDriverOutstandingAmount } from '../../lib/firebase/api';

const Drivers = () => {
  const { drivers } = useStateContext();
  const [editIdx, setEditIdx] = useState(-1);
  const [editedDriver, setEditedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRidesModal, setShowRidesModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverOutstanding, setDriverOutstanding] = useState({});

  useEffect(() => {
    // Calculate outstanding payments for each driver
    const calculateOutstanding = async () => {
      const outstanding = {};

      for (const driver of drivers) {
        try {
          const totalOutstanding = await getDriverOutstandingAmount(driver.id);
          outstanding[driver.id] = totalOutstanding;
        } catch (error) {
          console.error(`Error calculating outstanding for driver ${driver.id}:`, error);
          outstanding[driver.id] = 0;
        }
      }

      setDriverOutstanding(outstanding);
    };

    if (drivers.length > 0) {
      calculateOutstanding();
    }
  }, [drivers]);

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

  const handleShowRidesModal = (driver) => {
    setSelectedDriver(driver);
    setShowRidesModal(true);
  };

  const handleCloseRidesModal = () => {
    setShowRidesModal(false);
    setSelectedDriver(null);

    // Refresh outstanding amounts after closing the rides modal
    if (drivers.length > 0) {
      const calculateOutstanding = async () => {
        const outstanding = {};

        for (const driver of drivers) {
          try {
            const totalOutstanding = await getDriverOutstandingAmount(driver.id);
            outstanding[driver.id] = totalOutstanding;
          } catch (error) {
            console.error(`Error calculating outstanding for driver ${driver.id}:`, error);
            outstanding[driver.id] = 0;
          }
        }

        setDriverOutstanding(outstanding);
      };

      calculateOutstanding();
    }
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
                    Outstanding
                  </th>
                  <th className="py-4 px-6 text-left font-semibold tracking-wide uppercase">
                    Rides
                  </th>
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
                      {driverOutstanding[driver.id] > 0 ? (
                        <span className="bg-red-100 text-red-800 font-medium px-3 py-1.5 rounded-lg">
                          ${driverOutstanding[driver.id].toFixed(2)}
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 font-medium px-3 py-1.5 rounded-lg">
                          $0.00
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleShowRidesModal(driver)}
                        className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium text-sm"
                      >
                        View Rides
                      </button>
                    </td>
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
        {showRidesModal && selectedDriver && (
          <DriverRidesModal
            driver={selectedDriver}
            onClose={handleCloseRidesModal}
          />
        )}
      </div>
    </div>
  );
};

export default Drivers;
