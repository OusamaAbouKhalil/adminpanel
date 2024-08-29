import React, { useState } from "react";
import { menuGrid } from "../data/dummy";
import { useNavigate, useParams } from "react-router-dom";
import { Header, SizesForm } from "../components";
import { useCreateItem } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";
import { transformSizesToObject } from "../lib/utils";

function AddItem() {
  const { id } = useParams();
  const { mutate: createItem } = useCreateItem();
  const Navigate = useNavigate();
  const [sizesForm, setSizesForm] = useState([]);

  const [menuData, setMenuData] = useState({
    item_category: "",
    available: true,
    // preferences: "",
    combo: {},
    item_description: "",
    item_name: "",
    item_price: 0,
    item_discount: 0,
    likes: [],
    orders_count: 0,
    sizes: {},
  });

  const [itemImage, setItemImage] = useState(null);

  const handleFileInputChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuData((prevState) => ({
      ...prevState,
      [name]: name === "item_price" && value ? parseFloat(value) : value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let itemImageUrl = "";
      if (itemImage) {
        itemImageUrl = await uploadImage(itemImage);
      }
      const itemId = createItem({
        rest_id: id,
        itemData: { ...menuData, sizes: transformSizesToObject(sizesForm), item_image: itemImageUrl }
      });

      console.log("Menu item added with ID: ", itemId);
      Navigate(`/restaurants/${id}`);

    } catch (error) {
      console.error("Error adding menu item: ", error);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Add Item" />
      <div>
        <form onSubmit={handleSubmit} className="flex flex-wrap">
          {menuGrid.map((item) => (
            <div key={item.value} className="w-full md:w-1/2 p-2">
              <label className="block">{item.headerText}</label>
              {item.value === "sizes" ? (
                <SizesForm
                  sizesForm={sizesForm}
                  setSizesForm={setSizesForm}
                />
              ) : (
                <input
                  // required
                  className="bg-gray-200 rounded-lg p-1 w-full"
                  type={item.inputType}
                  name={item.value}
                  value={
                    item.inputType === "file" ? undefined : menuData[item.value]
                  }
                  onChange={
                    item.inputType === "file"
                      ? handleFileInputChange
                      : handleChange
                  }
                  placeholder={item.placeholder || ""}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
