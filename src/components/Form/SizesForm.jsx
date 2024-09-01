import React from 'react'

const SizesForm = ({ sizesForm, setSizesForm }) => {
    const addSize = () => {
        setSizesForm(prev => [...prev, { name: "", value: 0 }]);
    };

    const removeSize = (index) => {
        const newSizes = [...sizesForm];
        newSizes.splice(index, 1);
        setSizesForm(newSizes);
    };

    const handleSizeChange = (index, field, value) => {
        setSizesForm((prevSizes) => {
            const newSizes = [...prevSizes];
            const currentSize = newSizes[index];

            if (field === "name") {
                currentSize.name = value;
            } else if (field === "value") {
                currentSize.value = value;
            }

            newSizes[index] = currentSize;
            return newSizes;
        });
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
            <button key="addSize" type="button" onClick={addSize} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add Size</button>
        </>
    );
}
export default SizesForm;