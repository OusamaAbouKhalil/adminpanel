import React, { useState, useEffect } from "react";
import { menuGrid } from "../data/dummy";
import { useNavigate, useParams } from "react-router-dom";
import { Header, SizesForm } from "../components";
import { useCreateItem } from "../lib/query/queries";
import { uploadImage } from "../lib/firebase/api";
import { transformSizesToObject } from "../lib/utils";
import { getDoc, doc } from "firebase/firestore";
import {fsdb} from "../utils/firebaseconfig";

function AddItem() {
  const { id } = useParams();
  const { mutate: createItem } = useCreateItem();
  const navigate = useNavigate();
  const [sizesForm, setSizesForm] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  const [menuData, setMenuData] = useState({
    item_category: "",
    available: true,
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
  const [categories, setCategories] = useState([]); // State for categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const docRef = doc(fsdb, "restaurants", id); 
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCategories(data.sub_categories || []); 
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [id]);

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
    if (loading) return; // Prevent multiple submissions

    setLoading(true); // Set loading state
    const imageDir = "images";
    try {
      let itemImageUrl = "";
      if (itemImage) {
        itemImageUrl = await uploadImage(itemImage, imageDir);
      }
      const itemId = createItem({
        rest_id: id,
        itemData: { ...menuData, sizes: transformSizesToObject(sizesForm), item_image: itemImageUrl },
      });

      console.log("Menu item added with ID: ", itemId);
      navigate(`/restaurants/${id}`);
    } catch (error) {
      console.error("Error adding menu item: ", error);
    } finally {
      setLoading(false); // Reset loading state
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
                <SizesForm sizesForm={sizesForm} setSizesForm={setSizesForm} />
              ) : item.value === "item_category" ? (
                <select
                  className="bg-gray-200 rounded-lg p-1 w-full"
                  name={item.value}
                  value={menuData.item_category}
                  onChange={handleChange}
                >
                  <option value="">Select a Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="bg-gray-200 rounded-lg p-1 w-full"
                  type={item.value === "item_price" ? "number" : item.inputType}
                  step={item.value === "item_price" ? "0.01" : undefined}
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
            disabled={loading} // Disable button while loading
            className={`${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            } text-white font-bold py-2 px-4 rounded mt-4`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
