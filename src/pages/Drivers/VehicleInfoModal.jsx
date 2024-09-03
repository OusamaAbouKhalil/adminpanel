import React, { useState, useEffect } from 'react';

const VehicleInfoModal = ({ driver, onClose, onSave }) => {
    if (!driver) {
        return null;
    }

    const defaultVehicleInfo = {
        carColor: '',
        carImage: '',
        carModel: '',
        carPlateNumber: '',
        carType: '',
        carYear: ''
    };

    const [info, setInfo] = useState(driver["vehicle-info"] || defaultVehicleInfo);
    const [isEdited, setIsEdited] = useState(false);

    useEffect(() => {
        setInfo(driver["vehicle-info"] || defaultVehicleInfo);
    }, [driver]);

    const handleChange = (key, value) => {
        const updatedInfo = {
            ...info,
            [key]: value
        };
        setInfo(updatedInfo);
        setIsEdited(JSON.stringify(updatedInfo) !== JSON.stringify(driver["vehicle-info"]));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleChange('carImage', URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        const updatedDriver = { ...driver, "vehicle-info": info };
        onSave(updatedDriver);
        setIsEdited(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg w-full max-w-lg mx-4 overflow-auto max-h-full">
                <h2 className="text-xl font-bold mb-4">Vehicle Information</h2>
                <table className="min-w-full bg-white border border-gray-200">
                    <tbody>
                        {Object.entries(info).map(([key, value]) => (
                            <tr key={key} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left font-bold">
                                    {key}
                                </td>
                                {key === 'carImage' ? (
                                    <td className="py-2 px-4 border-b border-gray-200 text-left">
                                        {value ? (
                                            <img src={value} alt="car" className="h-52" />
                                        ) : (
                                            <input
                                                type="file"
                                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        )}
                                    </td>
                                ) : (
                                    <td className="py-2 px-4 border-b border-gray-200 text-left">
                                        <input
                                            type="text"
                                            value={value}
                                            className="w-full px-2 py-1 border border-gray-300 rounded"
                                            onChange={(e) => handleChange(key, e.target.value)}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Close
                    </button>
                    {isEdited && (
                        <button
                            onClick={handleSave}
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleInfoModal;