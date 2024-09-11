import { getDatabase, ref, get, onValue, set, push } from "firebase/database";
import CryptoJS from 'crypto-js';
import db, { auth, fsdb, functions, httpsCallable, secondaryAuth } from "../../utils/firebaseconfig";
import {
    getDownloadURL,
    getStorage,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc, query, orderBy, startAfter, limit, where } from "firebase/firestore";
import { getLocationByCoordinates } from "../utils";
import { permissionsList } from "../../data/dummy";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth, signInWithCustomToken, signInWithEmailAndPassword, signOut } from "firebase/auth";


export const getRestaurants = async (
    lastDocSnapshot = null,
    searchTerm = ""
) => {
    try {
        let queryRef;

        if (lastDocSnapshot) {
            queryRef = query(
                collection(fsdb, "restaurants"),
                orderBy("rest_name"),
                startAfter(lastDocSnapshot),
                limit(10)
            );
        } else {
            queryRef = query(
                collection(fsdb, "restaurants"),
                orderBy("rest_name"),
                limit(10)
            );
        }

        const querySnapshot = await getDocs(queryRef);
        let restaurantList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            restaurantList = restaurantList.filter((restaurant) =>
                restaurant.rest_name.toLowerCase().includes(searchTermLower)
            );
        }

        // Update locations for each restaurant
        for (let i = 0; i < restaurantList.length; i++) {
            const location = await getLocationByCoordinates(
                restaurantList[i].location._lat,
                restaurantList[i].location._long
            );
            restaurantList[i].location = location;
        }

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { restaurantList, lastVisible };
    } catch (error) {
        console.error("Error fetching restaurants: ", error);
        throw error;
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

export const uploadImage = async (file, path) => {
    const storage = getStorage();
    const filename = Date.now() + "." + file.name.split('.').pop();
    const storageReference = storageRef(storage, `${path}/${filename}`);
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
export const getRestaurantMenu = async (id) => {
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

// Function to get a random message based on order status
const getOrderStatusMessage = (status) => {
    const messages = {
        completed: [
            '🎉 Your order is completed! Time to dig in and enjoy! 🍽️',
            '👏 It’s here! Enjoy your delicious meal! 😋',
            '🎊 Your order’s complete – feast time! 🍴',
            '🏆 Your meal is ready for the ultimate taste test! 🍕',
            '🎉 The wait is over! Enjoy your freshly prepared meal! 🥂',
            '🍽️ Your food has arrived! Let the deliciousness begin! 🎉',
            '🎉 Your meal is ready! Time to treat yourself! 🍲',
            '🍴 Dig in! Your order is complete and ready to enjoy! 🌟',
            '🥂 Celebrate! Your meal is here and it’s time to feast! 🍝',
            '🍲 Your order is complete – get ready for a flavor explosion! 🎇',
            '🎉 Your meal is finally here – time to savor every bite! 🥳',
            '🍛 Enjoy your food! Your order is officially complete! 🌟',
            '🥘 Your meal is served! Bon appétit! 🍷',
            '🍕 Your order is complete and ready to enjoy! 🍽️',
            '🍕 Your order is done! Indulge in your delicious meal! 🍝'
        ],
        rejected: [
            '🚫 Unfortunately, your order has been rejected. Please contact support if you need assistance. 🙁',
            '❌ We’re sorry, but your order could not be processed. Please try again later. 😔',
            '🔴 Your order has been rejected. We apologize for the inconvenience. Please reach out to us for more information. 📞',
            '🚷 Your order has been canceled due to an issue. Contact us for help with your next order. 📩',
            '❗ We’re sorry, but something went wrong with your order. Please contact customer service for assistance. 🙇',
            '⚠️ Your order has been rejected. Please check with us for more details. 🚨',
            '🚪 Unfortunately, we had to reject your order. Please get in touch with us for support. 🏥',
            '🛑 Your order could not be completed. Reach out to us if you have questions or need help. 📧',
            '🚫 Your order has been rejected. We apologize for the inconvenience. Please contact us for a resolution. 🔧',
            '⚠️ We regret to inform you that your order has been rejected. Please contact us for further assistance. 📞',
            '💔 Your order was not accepted. We apologize and are here to assist you with any issues. 📬',
            '😞 Your order has been rejected. Please reach out to us for any queries or support. 💬',
            '🚷 Your order could not be processed. We’re sorry for the inconvenience and are here to help. 🙋',
            '🛑 Order rejection notice: We’re sorry, but there was a problem with your order. Contact us for more information. 📞',
            '🚫 Your order has been rejected. We apologize for any trouble this may have caused. Please contact us for assistance. 📨'
        ],
        preparing: [
            '👨‍🍳 Your order is being prepared with love and care! 🍲',
            '🔪 Our chef is working their magic on your meal! 🪄',
            '🥄 Your dish is being cooked to perfection! 🍛',
            '🍳 Cooking up something special just for you! 🌟',
            '🔄 Your meal is in the works – almost time to eat! 🕒',
            '🍲 Your order is simmering away – won’t be long now! 🕛',
            '🔪 Crafting your meal to be a culinary masterpiece! 🍴',
            '🔥 Your meal is being prepared to perfection! 🍲',
            '🧑‍🍳 We’re whipping up something delicious for you! 🍝',
            '🍛 Your meal is being crafted with care – almost ready! 🍽️',
            '🔧 Your order is in the kitchen and being prepared! 🍳',
            '🥘 Your meal is on the way to perfection – just a moment longer! ⏳',
            '🛠️ Our chefs are working hard on your meal! 🍲',
            '🔄 Preparing your order – it’ll be ready soon! 🕒',
            '🥣 Cooking your meal with all the right ingredients! 🍲'
        ],
        accepted: [
            '🤝 We’ve accepted your order – it’s officially in the queue! 🚦',
            '✔️ Your order is in the lineup! We’re getting it ready! 🎬',
            '📋 Your order is in the system and ready to roll! 🎉',
            '🚀 Your order’s been accepted and is on its way! 🌟',
            '✅ Order confirmed! We’re on it – stay tuned! ⏳',
            '📥 Your order is locked in and getting ready! 🔒',
            '📝 Your order is in the queue – hang tight! ⏰',
            '🎯 Your order is confirmed! We’re prepping it now! 🏹',
            '📅 Your order is scheduled and being prepared! 📦',
            '🛠️ We’ve accepted your order and are starting the process! 🔄',
            '🔍 Order accepted! We’re gathering everything you need! 📦',
            '🔖 Your order has been accepted! Preparing it just for you! 🎁',
            '📋 Your order is in our system and in the works! 🛠️',
            '🚦 We’ve accepted your order and are starting the process! 🛠️',
            '📅 Order accepted! We’re getting everything in place! 🎯'
        ],
        'on the way': [
            '🛵 Your order is en route and coming your way! 🛣️',
            '📦 Your meal is on its way – get ready for a feast! 🎉',
            '🛵 Your order is speeding toward you! Hold on tight! 🎈',
            '🌟 Your order’s journey has begun – it’s almost there! 🚀',
            '🚚 Your meal is on the move – just a little longer! 🕒',
            '🏍️ Your food is on its way – prepare to dig in! 🍽️',
            '🚗 Your order is in transit – not long now! 🕑',
            '🛣️ Your meal is on its way – the wait is almost over! 🚴',
            '🚀 Your order is on the move – get ready! 🚚',
            '📦 Your meal is on its way – just a bit longer! 🕒',
            '🛵 Your order is on the move and almost there! 🚴',
            '🚗 Your meal is on its way – get your appetite ready! 🍽️',
            '🛵 Your order is en route – just a little longer! ⏰',
            '🚚 Your order is in transit – almost there! 🕒',
            '🛵 Your meal is speeding your way – get ready! 🍽️'
        ],
        default: [
            `🔍 We’re not sure what's up with your order right now: ${status}. Stay tuned! 👀`,
            `🤔 It looks like your order status is a bit of a mystery: ${status}. We’ll keep you posted! 📡`,
            `🕵️‍♂️ Order status unknown: ${status}. We’re on it! 🔍`
        ]
    };

    const getRandomMessage = (messagesArray) => {
        const randomIndex = Math.floor(Math.random() * messagesArray.length);
        return messagesArray[randomIndex];
    };

    return getRandomMessage(messages[status] || messages.default);
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
            console.log("User found:", userData);
            if (userData.firebaseMessagingToken) {
                // console.log("Sending notification to user");
                await sendNotification(
                    userData.firebaseMessagingToken,
                    "SwiftBites Order Status",
                    getOrderStatusMessage(order.status)
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
export const createItem = async (id, formData) => {
    try {

        const menuRef = collection(fsdb, `restaurants/${id}/menu_items`);
        const menuItemRef = await addDoc(menuRef, formData);

        await setDoc(
            menuItemRef,
            { item_id: menuItemRef.id },
            { merge: true }
        );
        return menuItemRef.id;
    } catch (error) {
        console.error("Error adding menu item: ", error);
    }
}
export const getPermissions = async (currentUser) => {
    try {
        const userRef = doc(fsdb, 'admins', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data().permissions;
        }
        console.error('No such document!');
        return [];
    } catch (error) {
        console.error('Error fetching user permissions:', error);
    }
};

export const createAdmin = async (data, avatarFile) => {
    const hashPassword = (password) => {
        return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    };

    const permissions = {};
    permissionsList.forEach(permission => {
        permissions[permission.id] = data[permission.id] || false;
    });

    let avatarURL = '';
    if (avatarFile && avatarFile.length > 0) {
        avatarURL = await uploadImage(avatarFile[0], 'adminPP');
    }

    try {
        // Check if the email is already in use
        const signInMethods = await fetchSignInMethodsForEmail(secondaryAuth, data.email);
        if (signInMethods.length > 0) {
            throw new Error('auth/email-already-in-use');
        }

        // Create the new user using the secondary Auth instance
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
        const user = userCredential.user;

        // Save the new admin data to Firestore
        const adminRef = doc(fsdb, "admins", user.uid);
        await setDoc(adminRef, {
            name: data.name,
            email: data.email,
            password: hashPassword(data.password),
            avatarURL: avatarURL,
            permissions: permissions,
        });

        // Sign out the secondary Auth instance
        await secondaryAuth.signOut();

        return { success: true };
    } catch (e) {
        console.error("Error creating admin: ", e);

        // Sign out the secondary Auth instance in case of error
        await secondaryAuth.signOut();

        return { success: false, error: e.message };
    }
};
export const saveDriver = async (driverData) => {
    try {
        const driverRef = ref(db, `drivers/${driverData.id}`);
        await set(driverRef, driverData);
        console.log("Driver data saved successfully!");
    } catch (error) {
        console.error("Error saving driver data: ", error);
    }
};
export const addDriver = async (newDriver) => {
    try {
        const driversRef = ref(db, '/drivers');
        await push(driversRef, {
            ...newDriver,
            email: "Driver-" + newDriver.email,
        });
    } catch (error) {
        console.error("Error adding driver: ", error);
    }
}
