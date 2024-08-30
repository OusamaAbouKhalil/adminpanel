import React from "react";

const CategoriesForm = ({
  categoriesForm,
  setCategoriesForm,
  handleCategoryChange,
  title,
}) => {
  // Add a new empty category
  const addCategory = () => {
    setCategoriesForm((prev) => [...prev, ""]);
  };

  // Remove a category at the specified index
  const removeCategory = (index) => {
    const newCategories = [...categoriesForm];
    newCategories.splice(index, 1);
    setCategoriesForm(newCategories);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">
        {categoriesForm.map((category, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 bg-gray-100 border border-gray-300 rounded-lg p-2 flex-1 min-w-[150px] md:min-w-[200px]"
          >
            <input
              type="text"
              placeholder="Category Name"
              value={category}
              onChange={(e) => handleCategoryChange(index, e.target.value)}
              className="flex-1 bg-transparent border-none outline-none p-1 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-lg transition duration-200"
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={addCategory}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {title}
        </button>
      </div>
    </div>
  );
};

export default CategoriesForm;
