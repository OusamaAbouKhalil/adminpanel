import React from "react";

const Modal = ({ isOpen, onClose, drivers, onSelectDriver }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold">Select a Driver</h2>
        <ul className='flex flex-col flex-nowrap'>
          {drivers.map((driver) => (
            <li key={driver.id} className="my-1">
              {driver.fullname}
              <button
                className=" float-right ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                onClick={() => onSelectDriver(driver)}
              >
                Assign
              </button>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
export default Modal;