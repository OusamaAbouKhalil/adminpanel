import React, { useState } from "react";

const CategoriesForm = ({
  categoriesForm,
  setCategoriesForm,
  handleCategoryChange,
  title,
}) => {
  // console.log(categoriesForm);
  const addCategory = () => {
    setCategoriesForm((prev) => [...prev, ""]);
  };

  const removeCategory = (index) => {
    const newCategories = [...categoriesForm];
    newCategories.splice(index, 1);
    setCategoriesForm(newCategories);
  };

  return (
    <>
      {categoriesForm.map((category, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            placeholder="Category Name"
            value={category}
            onChange={(e) =>
              handleCategoryChange(index, e.target.value)
            }
            className="bg-gray-200 rounded-lg p-1"
          />

          <button
            type="button"
            onClick={() => removeCategory(index)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            X
          </button>
        </div>
      ))}
      <div className="flex">
        <button
          key="addCategory"
          type="button"
          onClick={addCategory}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {title}
        </button>
      </div>
    </>
  );
};
export default CategoriesForm;
