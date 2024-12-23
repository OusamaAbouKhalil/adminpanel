import { getDatabase, ref, get, onValue, set, push } from "firebase/database";
import CryptoJS from "crypto-js";
import db, {
  auth,
  fsdb,
  functions,
  httpsCallable,
  secondaryAuth,
} from "../../utils/firebaseconfig";
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  query,
  orderBy,
  startAfter,
  limit,
  where,
} from "firebase/firestore";
import { getLocationByCoordinates } from "../utils";
import { permissionsList } from "../../data/dummy";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

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
      return restaurantSnapshot.data();
    }
  } catch (error) {
    console.error("Error fetching restaurant: ", error);
  }
};
export const getRestaurantReviews = async (id) => {
  try {
    const reviewsRef = collection(fsdb, `restaurants/${id}/reviews`);
    const querySnapshot = await getDocs(reviewsRef);
    const reviewsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return reviewsList;
  } catch (error) {
    console.error("Error fetching reviews: ", error);
  }
};

export const getMenuItem = async (restaurantId, itemId) => {
  try {
    const itemRef = doc(fsdb, `restaurants/${restaurantId}/menu_items`, itemId);
    const itemSnapshot = await getDoc(itemRef);
    if (itemSnapshot.exists()) {
      return itemSnapshot.data();
    }
  } catch (error) {
    console.error("Error fetching menu item: ", error);
  }
};
export const setMenuItem = async (restaurantId, itemId, itemData) => {
  try {
    const itemRef = doc(fsdb, `restaurants/${restaurantId}/menu_items`, itemId);
    await updateDoc(itemRef, itemData);

  } catch (error) {
    console.error("Error updating document: ", error);
  }
};

export const uploadImage = async (file, path) => {
  const storage = getStorage();
  const filename = Date.now() + "." + file.name.split(".").pop();
  const storageReference = storageRef(storage, `${path}/${filename}`);
  try {

    const snapshot = await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

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
export const addAddonToMenuItem = async (
  restaurantId,
  menuItemId,
  addonData
) => {
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
    const querySnapshot = await getDocs(collection(fsdb, `orders`));
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
      "🎉 Your order is completed! Time to dig in and enjoy! 🍽️",
      "👏 It’s here! Enjoy your delicious meal! 😋",
      "🎊 Your order’s complete – feast time! 🍴",
      "🏆 Your meal is ready for the ultimate taste test! 🍕",
      "🎉 The wait is over! Enjoy your freshly prepared meal! 🥂",
      "🍽️ Your food has arrived! Let the deliciousness begin! 🎉",
      "🎉 Your meal is ready! Time to treat yourself! 🍲",
      "🍴 Dig in! Your order is complete and ready to enjoy! 🌟",
      "🥂 Celebrate! Your meal is here and it’s time to feast! 🍝",
      "🍲 Your order is complete – get ready for a flavor explosion! 🎇",
      "🎉 Your meal is finally here – time to savor every bite! 🥳",
      "🍛 Enjoy your food! Your order is officially complete! 🌟",
      "🥘 Your meal is served! Bon appétit! 🍷",
      "🍕 Your order is complete and ready to enjoy! 🍽️",
      "🍕 Your order is done! Indulge in your delicious meal! 🍝",
    ],
    rejected: [
      "🚫 Unfortunately, your order has been rejected. Please contact support if you need assistance. 🙁",
      "❌ We’re sorry, but your order could not be processed. Please try again later. 😔",
      "🔴 Your order has been rejected. We apologize for the inconvenience. Please reach out to us for more information. 📞",
      "🚷 Your order has been canceled due to an issue. Contact us for help with your next order. 📩",
      "❗ We’re sorry, but something went wrong with your order. Please contact customer service for assistance. 🙇",
      "⚠️ Your order has been rejected. Please check with us for more details. 🚨",
      "🚪 Unfortunately, we had to reject your order. Please get in touch with us for support. 🏥",
      "🛑 Your order could not be completed. Reach out to us if you have questions or need help. 📧",
      "🚫 Your order has been rejected. We apologize for the inconvenience. Please contact us for a resolution. 🔧",
      "⚠️ We regret to inform you that your order has been rejected. Please contact us for further assistance. 📞",
      "💔 Your order was not accepted. We apologize and are here to assist you with any issues. 📬",
      "😞 Your order has been rejected. Please reach out to us for any queries or support. 💬",
      "🚷 Your order could not be processed. We’re sorry for the inconvenience and are here to help. 🙋",
      "🛑 Order rejection notice: We’re sorry, but there was a problem with your order. Contact us for more information. 📞",
      "🚫 Your order has been rejected. We apologize for any trouble this may have caused. Please contact us for assistance. 📨",
    ],
    preparing: [
      "👨‍🍳 Your order is being prepared with love, spice, and everything nice! 🍲",
      "🔪 Our chef is in the kitchen channeling their inner wizard for your meal! 🪄",
      "🥄 Stirring, sautéing, and sprinkling magic on your dish! 🍛",
      "🍳 We’re cracking eggs and cracking jokes to make your meal perfect! 🌟",
      "🔄 Your meal is in the works – soon you’ll be eating like royalty! 🕒",
      "🍲 Your order is bubbling away – it’s almost time to feast! 🕛",
      "🔪 We’re slicing, dicing, and making your meal a masterpiece! 🍴",
      "🔥 Your meal is getting the heat it deserves – perfection in progress! 🍲",
      "🧑‍🍳 The chef is flipping, sautéing, and singing while making your meal! 🍝",
      "🍛 Your dish is almost there – it’s been treated with all the care! 🍽️",
      "🔧 Your order is in the kitchen, being perfected like a fine-tuned engine! 🍳",
      "🥘 Your meal is almost perfect – just a little more spice and flair! ⏳",
      "🛠️ Our chefs are working like culinary superheroes to save your hunger! 🍲",
      "🔄 Almost there! Your food is stirring up some serious flavor! 🕒",
      "🥣 Cooking your meal with all the love, spices, and a dash of secret sauce! 🍲",
    ],
    accepted: [
      "🤝 We’ve accepted your order – it’s officially in the queue! 🚦",
      "✔️ Your order is in the lineup! We’re getting it ready! 🎬",
      "📋 Your order is in the system and ready to roll! 🎉",
      "🚀 Your order’s been accepted and is on its way! 🌟",
      "✅ Order confirmed! We’re on it – stay tuned! ⏳",
      "📥 Your order is locked in and getting ready! 🔒",
      "📝 Your order is in the queue – hang tight! ⏰",
      "🎯 Your order is confirmed! We’re prepping it now! 🏹",
      "📅 Your order is scheduled and being prepared! 📦",
      "🛠️ We’ve accepted your order and are starting the process! 🔄",
      "🔍 Order accepted! We’re gathering everything you need! 📦",
      "🔖 Your order has been accepted! Preparing it just for you! 🎁",
      "📋 Your order is in our system and in the works! 🛠️",
      "🚦 We’ve accepted your order and are starting the process! 🛠️",
      "📅 Order accepted! We’re getting everything in place! 🎯",
    ],
    "on the way": [
      "🛵 Your order is on the way – like a superhero, but with food! 🦸‍♂️🍕",
      "📦 Your meal is on its way – brace yourself for an epic food adventure! 🎉",
      "🛵 Your order is zooming towards you like a food-powered rocket! 🚀🍔",
      "🌟 Your order’s journey has begun – it’s currently fighting traffic to reach you! 🚗💨",
      "🚚 Your meal is cruising down the road – just a few more snacks away! 🕒🍟",
      "🏍️ Your food is on its way – prepare to be amazed and stuffed! 🍽️",
      "🚗 Your order is in transit – no traffic jam can stop it now! 🏁",
      "🛣️ Your meal is on its way – it’s like the food equivalent of a world tour! 🌍",
      "🚀 Your order is on the move – it’s almost there, ready to make an entrance! 🎉",
      "📦 Your meal is coming your way – it’s almost like a food parade! 🎺🍕",
      "🛵 Your order is zooming through the streets like a hungry ninja! 🥷🍣",
      "🚗 Your meal is coming at you faster than your willpower to resist it! 🍽️",
      "🛵 Your order is en route – like a food chase scene from an action movie! 🎬🍔",
      "🚚 Your order is in transit – hang in there, it’s nearly snack o’clock! 🕒🍕",
      "🛵 Your meal is speeding your way – ready for a flavor explosion! 💥🍲",
    ],
    default: [
      `🔍 We’re not sure what's up with your order right now: ${status}. Stay tuned! 👀`,
      `🤔 It looks like your order status is a bit of a mystery: ${status}. We’ll keep you posted! 📡`,
      `🕵️‍♂️ Order status unknown: ${status}. We’re on it! 🔍`,
    ],
  };

  const getRandomMessage = (messagesArray) => {
    const randomIndex = Math.floor(Math.random() * messagesArray.length);
    return messagesArray[randomIndex];
  };

  return getRandomMessage(messages[status] || messages.default);
};

export const updateOrderStatus = async (order) => {

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
        // 
        await sendNotification(
          userData.firebaseMessagingToken,
          "SwiftBites Order Status",
          getOrderStatusMessage(order.status)
        );
      }
    } else {

    }
  } catch (error) {
    console.error("Error updating order: ", error);
  }
};

const sendNotification = async (token, title, body) => {
  const sendNotificationFunction = httpsCallable(functions, "sendNotification");
  try {
    const result = await sendNotificationFunction({ token, title, body });

    if (result.data.success) {

    } else {

    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
export const createRestaurant = async (formData, menuData) => {
  try {
    const collectionRef = collection(fsdb, "restaurants");
    const docRef = await addDoc(collectionRef, formData);



    const menuRef = collection(fsdb, `restaurants/${docRef.id}/menu_items`);
    const menuItemRef = await addDoc(menuRef, menuData);

    await setDoc(menuItemRef, { item_id: menuItemRef.id }, { merge: true });


    await setDoc(docRef, { ...formData, rest_id: docRef.id }, { merge: true });
  } catch (error) {
    console.error("Error adding document: ", error);
    return null; // Explicitly return null in case of error
  }
};
export const createItem = async (id, formData) => {
  try {
    const menuRef = collection(fsdb, `restaurants/${id}/menu_items`);
    const menuItemRef = await addDoc(menuRef, formData);

    await setDoc(menuItemRef, { item_id: menuItemRef.id }, { merge: true });
    return menuItemRef.id;
  } catch (error) {
    console.error("Error adding menu item: ", error);
  }
};
export const getPermissions = async (currentUser) => {
  try {
    const userRef = doc(fsdb, "admins", currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().permissions;
    }
    console.error("No such document!");
    return [];
  } catch (error) {
    console.error("Error fetching user permissions:", error);
  }
};

export const createAdmin = async (data, avatarFile) => {
  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const permissions = {};
  permissionsList.forEach((permission) => {
    permissions[permission.id] = data[permission.id] || false;
  });

  let avatarURL = "";
  if (avatarFile && avatarFile.length > 0) {
    avatarURL = await uploadImage(avatarFile[0], "adminPP");
  }

  try {
    // Check if the email is already in use
    const signInMethods = await fetchSignInMethodsForEmail(
      secondaryAuth,
      data.email
    );
    if (signInMethods.length > 0) {
      throw new Error("auth/email-already-in-use");
    }

    // Create the new user using the secondary Auth instance
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email,
      data.password
    );
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

  } catch (error) {
    console.error("Error saving driver data: ", error);
  }
};
export const addDriver = async (newDriver) => {
  try {
    const driversRef = ref(db, "/drivers");
    await push(driversRef, {
      ...newDriver,
      email: "Driver-" + newDriver.email,
    });
  } catch (error) {
    console.error("Error adding driver: ", error);
  }
};

export const getDashboardData = async (startDate, endDate) => {
  const db = getDatabase();
  try {


    const usersSnapshot = await get(ref(db, 'users'));
    const driversSnapshot = await get(ref(db, 'drivers'));
    const swiftBitesDriversSnapshot = await get(ref(db, 'swiftBitesDrivers'));


    const revenueRef = collection(fsdb, 'revenue');
    const revenueSnapshot = await getDocs(revenueRef);
    const revenueEntries = revenueSnapshot.docs.map(doc => doc.data());

    const filteredEntries = revenueEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    return {
      users: {
        normal: usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0,
        drivers: driversSnapshot.exists() ? Object.keys(driversSnapshot.val()).length : 0,
        swiftBitesDrivers: swiftBitesDriversSnapshot.exists() ? Object.keys(swiftBitesDriversSnapshot.val()).length : 0,
      },
      revenue: filteredEntries,
      driversData: {
        drivers: driversSnapshot.exists() ? Object.keys(driversSnapshot.val()) : [],
        swiftBitesDrivers: swiftBitesDriversSnapshot.exists() ? Object.keys(swiftBitesDriversSnapshot.val()) : [],
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};