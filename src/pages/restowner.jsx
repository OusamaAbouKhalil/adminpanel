import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import CryptoJS from "crypto-js";

const AddRestaurantOwner = () => {
  const [restaurants, setRestaurants] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch restaurants from Firestore
  useEffect(() => {
    const fetchRestaurants = async () => {
      const restsCollection = collection(fsdb, "restaurants");
      const restSnapshot = await getDocs(restsCollection);
      const restList = restSnapshot.docs.map((doc) => ({
        id: doc.rest_id,
        ...doc.data(),
      }));
      setRestaurants(restList);
    };

    fetchRestaurants();
  }, []);

   const hashPassword = (password) => {
      return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Hash the password before storing it
      const hashedPassword = hashPassword(data.password);

      await addDoc(collection(fsdb, "restOwners"), {
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: hashedPassword, // Store the hashed password
        rest_id: data.restaurant,
        created_at: Timestamp.now(),
      });
      alert("Restaurant owner added successfully!");
      reset();
    } catch (error) {
      console.error("Error adding owner: ", error);
      alert("Failed to add owner. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-green-800 text-center">
          Add Restaurant Owner
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          {/* Owner Name */}
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="ownerName">
              Owner Name
            </label>
            <input
              id="ownerName"
              {...register("ownerName", { required: "Owner name is required" })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="text"
              placeholder="Owner Name"
            />
            {errors.ownerName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.ownerName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="email"
              placeholder="Owner Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              {...register("phone", { required: "Phone number is required" })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="tel"
              placeholder="Owner Phone"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="password"
              placeholder="Enter Password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Restaurant */}
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="restaurant">
              Restaurant
            </label>
            <select
              id="restaurant"
              {...register("restaurant", {
                required: "Please select a restaurant",
              })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              style={{ color: "#333" }}
            >
              <option value="" style={{ color: "#333" }}>
                Select a Restaurant
              </option>
              {restaurants.map((restaurant) => (
                <option
                  key={restaurant.rest_id}
                  value={restaurant.rest_id}
                  style={{ color: "#333" }}
                >
                  {restaurant.rest_name}
                </option>
              ))}
            </select>
            {errors.restaurant && (
              <p className="text-red-500 text-sm mt-1">
                {errors.restaurant.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Add Owner
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantOwner;
