import React, { useState } from 'react'

 export default function SizesForm({ handleSizeChange }) {
    const [sizesForm, setSizesForm] = useState([]);
    const addSize = () => {
        setSizesForm(prev => [...prev, { name: "", value: 0 }]);
    };


    const removeSize = (index) => {
        const newSizes = [...sizesForm];
        newSizes.splice(index, 1);
        setSizesForm(newSizes);
    };


    return (
        <>
            {sizesForm.map((size, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                        type="text"
                        placeholder="Size Name"
                        value={size.name}
                        onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                        className="bg-gray-200 rounded-lg p-1"
                    />
                    <input
                        type="number"
                        placeholder="Value"
                        value={size.value}
                        onChange={(e) => handleSizeChange(index, 'value', e.target.value)}
                        className="bg-gray-200 rounded-lg p-1"
                    />
                    <button type='button' onClick={() => removeSize(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">X</button>
                </div>
            ))}
            <button key="addSize" type="button" onClick={addSize} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Add Size</button>
        </>
    );
}
