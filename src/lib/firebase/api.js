import { getDatabase, ref, get, onValue } from "firebase/database";

import db, { fsdb, functions, httpsCallable } from "../../utils/firebaseconfig";
import {
    getDownloadURL,
    getStorage,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getLocationByCoordinates } from "../utils";


export const getRestaurants = async () => {
    try {
        const querySnapshot = await getDocs(collection(fsdb, "restaurants"));
        const restaurantList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
        }));
        for (let i = 0; i < restaurantList.length; i++) {
            const location = await getLocationByCoordinates(
                restaurantList[i].location._lat,
                restaurantList[i].location._long
            );
            restaurantList[i].location = location;
        }
        return restaurantList;
    } catch (error) {
        console.error("Error fetching restaurants: ", error);
    }
};
export const getRestaurantById = async (id) => {
    try {
        const restaurantRef = doc(fsdb, "restaurants", id);
        const restaurantSnapshot = await getDoc(restaurantRef);
        if (restaurantSnapshot.exists()) {
            console.log(restaurantSnapshot.data());
            return restaurantSnapshot.data();
        }

    } catch (error) {
        console.error("Error fetching restaurant: ", error);
    }
};
export const getMenuItem = async (restaurantId, itemId) => {
    try {
        const itemRef = doc(
            fsdb,
            `restaurants/${restaurantId}/menu_items`,
            itemId
        );
        const itemSnapshot = await getDoc(itemRef);
        if (itemSnapshot.exists()) {
            console.log(itemSnapshot.data());
            return itemSnapshot.data();
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching menu item: ", error);
    }
};
export const setMenuItem = async (restaurantId, itemId, itemData) => {
    try {
        const itemRef = doc(
            fsdb,
            `restaurants/${restaurantId}/menu_items`,
            itemId
        );
        await updateDoc(itemRef, itemData);
        console.log("Document successfully updated!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }
};

export const uploadImage = async (file) => {
    const storage = getStorage();
    const filename = Date.now() + "." + file.name.split('.').pop();
    const storageReference = storageRef(storage, `images/${filename}`);
    try {
        console.log("Uploading to:", storageReference.fullPath);
        const snapshot = await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("File available at:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error during file upload:", error);
        throw error;
    }
};
export const getRestaurantsMenu = async (id) => {
    try {
        const querySnapshot = await getDocs(
            collection(fsdb, `restaurants/${id}/menu_items`)
        );
        const menuList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
        }));
        return menuList;
    } catch (error) {
        console.error("Error fetching Menu: ", error);
    }
};
export const addAddonToMenuItem = async (restaurantId, menuItemId, addonData) => {
    try {
        const addonRef = collection(
            fsdb,
            `restaurants/${restaurantId}/menu_items/${menuItemId}/addons`
        );
        await addDoc(addonRef, addonData);
    } catch (error) {
        console.error("Error adding addon: ", error);
    }
};

export const getOrders = async () => {
    try {
        const querySnapshot = await getDocs(
            collection(fsdb, `orders`)
        );
        const ordersList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
        }));
        return ordersList;
    } catch (error) {
        console.error("Error fetching orders: ", error);
    }
};
export const updateOrderStatus = async (order) => {
    console.log("Updating order:", order);
    const orderRef = doc(fsdb, "orders", order.order_id);

    try {
        await updateDoc(orderRef, {
            status: order.status,
            driver_id: order.driver_id,
        });
        // Fetch user data based on user_id from the Realtime Database
        const userRef = ref(db, `users/${order.user_id}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            if (userData.firebaseMessagingToken) {
                // console.log("Sending notification to user");
                await sendNotification(
                    userData.firebaseMessagingToken,
                    "Order " + order.status[0, 1].toUpperCase() + order.status[1, order.status.length - 1],
                    "Your order is " + order.status
                );
            }
        } else {
            console.log("User not found");
        }
    } catch (error) {
        console.error("Error updating order: ", error);
    }
};
const sendNotification = async (token, title, body) => {
    const sendNotificationFunction = httpsCallable(
        functions,
        "sendNotification"
    );
    try {
        const result = await sendNotificationFunction({ token, title, body });
        console.log(result.data);
        if (result.data.success) {
            console.log("Notification sent successfully");
        } else {
            console.log("Failed to send notification:", result.data.error);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};
export const createRestaurant = async (formData, menuData) => {
    try {
        const collectionRef = collection(fsdb, "restaurants");
        const docRef = await addDoc(collectionRef, formData);

        console.log("Document written with ID: ", docRef.id);

        const menuRef = collection(fsdb, `restaurants/${docRef.id}/menu_items`);
        const menuItemRef = await addDoc(menuRef, menuData);

        await setDoc(menuItemRef, { item_id: menuItemRef.id }, { merge: true });
        console.log("Menu item added with ID: ", menuItemRef.id);

        const reviewsRef = collection(fsdb, `restaurants/${docRef.id}/reviews`);

        await addDoc(reviewsRef, { initial: true });

        await setDoc(
            docRef,
            { ...formData, rest_id: docRef.id },
            { merge: true }
        );
    } catch (error) {
        console.error("Error adding document: ", error);
        return null;  // Explicitly return null in case of error
    }
};
