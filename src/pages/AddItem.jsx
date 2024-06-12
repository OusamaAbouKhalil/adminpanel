import React, { useState } from 'react';
import { collection, addDoc, setDoc } from 'firebase/firestore';
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { fsdb } from '../utils/firebaseconfig';
import { menuGrid } from '../data/dummy';
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components';
function AddItem() {
    const { id } = useParams();
    const Navigate = useNavigate();

    const [menuData, setMenuData] = useState({
        item_category: "",
        isAvailable: true,
        ordersCount: 0,
        preferences: "",
        combo: {},
        item_description: "",
        item_name: "",
        item_price: 0,
        likes: [],
        orders_count: 0,
        sizes: {
            large: 0,
            medium: 0,
            small: 0
        }
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
        setMenuData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const uploadImage = async (file) => {
        const storage = getStorage();
        const storageReference = storageRef(storage, `images/${file.name}`);
        try {
            console.log('Uploading to:', storageReference.fullPath);
            const snapshot = await uploadBytes(storageReference, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error during file upload:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (itemImage) {
                const itemImageUrl = await uploadImage(itemImage);
                setMenuData(prevState => ({
                    ...prevState,
                    item_image: itemImageUrl
                }));
            }

            const menuRef = collection(fsdb, `restaurants/${id}/menu_items`);
            const menuItemRef = await addDoc(menuRef, menuData);
            await setDoc(menuItemRef, { menu_item_id: menuItemRef.id }, { merge: true });
            console.log("Menu item added with ID: ", menuItemRef.id);
            Navigate(`/restaurants/${id}`)
        } catch (error) {
            console.error("Error adding menu item: ", error);
        }
    };

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Add Item"/>
            <div>
                <form onSubmit={handleSubmit} className='flex flex-wrap'>
                    {menuGrid.map((item) => (
                        <div key={item.value} className="w-full md:w-1/2 p-2">
                            <label className='block'>{item.headerText}</label>
                            {item.value === "sizes" ? (
                                <input
                                    className='bg-gray-200 rounded-lg p-1 w-full'
                                    type="text"
                                    name={item.value}
                                    value={`${menuData.sizes.small}, ${menuData.sizes.medium}, ${menuData.sizes.large}`}
                                    onChange={handleChange}
                                    placeholder="Enter sizes as small, medium, large"
                                />
                            ) : (
                                <input
                                    className='bg-gray-200 rounded-lg p-1 w-full'
                                    type={item.inputType}
                                    name={item.value}
                                    value={item.inputType === "file" ? undefined : menuData[item.value]}
                                    onChange={item.inputType === "file" ? handleFileInputChange : handleChange}
                                    placeholder={item.placeholder || ""}
                                />
                            )}

                        </div>))}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default AddItem;
