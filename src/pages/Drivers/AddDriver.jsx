import { useState } from 'react';


const AddDriverModal = ({ onClose, onSave }) => {
    const [newDriver, setNewDriver] = useState({
        fullname: '',
        email: '',
        phone: '',
        "vehicle-info": {
            carColor: '',
            carImage: '',
            carModel: '',
            carPlateNumber: '',
            carType: '',
            carYear: ''
        }
    });

    const handleChange = (e, field, isVehicleInfo = false) => {
        if (isVehicleInfo) {
            setNewDriver({
                ...newDriver,
                "vehicle-info": {
                    ...newDriver["vehicle-info"],
                    [field]: e.target.value
                }
            });
        } else {
            setNewDriver({ ...newDriver, [field]: e.target.value });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDriver({
                ...newDriver,
                "vehicle-info": {
                    ...newDriver["vehicle-info"],
                    carImage: URL.createObjectURL(file)
                }
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(newDriver);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg mx-4 overflow-auto max-h-full">
                <h2 className="text-xl font-bold mb-4">Add New Driver</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            value={newDriver.fullname}
                            onChange={(e) => handleChange(e, 'fullname')}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={newDriver.email}
                            onChange={(e) => handleChange(e, 'email')}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Phone</label>
                        <input
                            type="text"
                            value={newDriver.phone}
                            onChange={(e) => handleChange(e, 'phone')}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Vehicle Information</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car Color</label>
                        <input
                            type="text"
                            value={newDriver["vehicle-info"].carColor}
                            onChange={(e) => handleChange(e, 'carColor', true)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car Image</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            accept="image/*"
                            required
                        />
                        {newDriver["vehicle-info"].carImage && (
                            <img
                                src={newDriver["vehicle-info"].carImage}
                                alt="Car"
                                className="mt-2 w-full h-32 object-cover rounded"
                            />
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car Model</label>
                        <input
                            type="text"
                            value={newDriver["vehicle-info"].carModel}
                            onChange={(e) => handleChange(e, 'carModel', true)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car Plate Number</label>
                        <input
                            type="text"
                            value={newDriver["vehicle-info"].carPlateNumber}
                            onChange={(e) => handleChange(e, 'carPlateNumber', true)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car Type</label>
                        <input
                            type="text"
                            value={newDriver["vehicle-info"].carType}
                            onChange={(e) => handleChange(e, 'carType', true)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car Year</label>
                        <input
                            type="text"
                            value={newDriver["vehicle-info"].carYear}
                            onChange={(e) => handleChange(e, 'carYear', true)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="mt-4 text-right">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDriverModal;