import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { fsdb } from "../utils/firebaseconfig";
import CryptoJS from "crypto-js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
const permissionsList = [
  { id: "dashboard", label: "Dashboard" },
  { id: "revenue", label: "Revenues Pages" },
  { id: "restaurants", label: "Restaurants Pages" },
  { id: "orders", label: "Orders" },
  { id: "drivers", label: "View drivers" },
  { id: "rides", label: "View rides" },
  { id: "prices", label: "Pricing" },
  { id: "methods", label: "Payment Methods" },
  { id: "users", label: "Users" },
  {id: "calculator", label: "Calculator"},
  { id: "notification", label: "Notification Center" },
  { id: "editnotification", label: "Edit Notification" },
  { id: "offers", label: "Promotions Center" },
  { id: "promo", label: "Promotions - Promo" },
  { id: "titles", label: "Personalization - Titles" },
  { id: "banners", label: "Personalization - Banners" },
  { id: "addadmin", label: "Admins Center" },
  { id: "editadmin", label: "Edit Admin?" },
  { id: "version", label: "Edit Version" },
  { id: "calendar", label: "Calendar" },
  { id: "kanban", label: "Kanban" },
];

const placeholderImage =
  "https://avatar.iran.liara.run/public/boy?username=Ash"; // Placeholder URL for avatars

const EditAdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const avatarFile = watch("avatar");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsCollection = collection(fsdb, "admins");
        const adminsSnapshot = await getDocs(adminsCollection);
        const adminsList = adminsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdmins(adminsList);
      } catch (e) {
        console.error("Error fetching admins: ", e);
      }
    };

    fetchAdmins();
  }, []);

  const handleEditClick = async (adminId) => {
    try {
      const adminRef = doc(fsdb, "admins", adminId);
      const docSnap = await getDoc(adminRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSelectedAdmin(adminId);
        setValue("name", data.name);
        setValue("email", data.email);
        Object.keys(data.permissions).forEach((permissionId) => {
          setValue(permissionId, data.permissions[permissionId]);
        });
        setValue("avatar", data.avatarURL || ""); // Set avatar URL if exists
      }
    } catch (e) {
      console.error("Error fetching admin data: ", e);
    }
  };

  const handleCloseModal = () => {
    setSelectedAdmin(null);
    reset();
  };

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const onSubmit = async (data) => {
    const permissions = {};
    permissionsList.forEach((permission) => {
      permissions[permission.id] = data[permission.id] || false;
    });

    let avatarURL = "";
    if (avatarFile && avatarFile.length > 0) {
      try {
        const imagePath = `adminPP/${selectedAdmin}`;
        const imageRef = storageRef(getStorage(), imagePath);
        await uploadBytes(imageRef, avatarFile[0]);

        // Retrieve the download URL
        avatarURL = await getDownloadURL(imageRef);
      } catch (e) {
        console.error("Error uploading avatar: ", e);
      }
    }

    try {
      const adminRef = doc(fsdb, "admins", selectedAdmin);
      await updateDoc(adminRef, {
        name: data.name,
        email: data.email,
        password: hashPassword(data.password),
        avatarURL: avatarURL,
        permissions: permissions,
      });

      alert("Admin updated successfully!");
      handleCloseModal();
    } catch (e) {
      console.error("Error updating admin: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-4xl font-bold text-green-800 text-center mb-8">
          Admin Management
        </h2>
        <table className="w-full mt-6 border-collapse">
          <thead>
            <tr className="bg-green-500 text-white rounded-t-lg">
              <th className="px-4 py-2 border-b border-gray-200 rounded-tl-lg">
                Avatar
              </th>
              <th className="px-4 py-2 border-b border-gray-200">Name</th>
              <th className="px-4 py-2 border-b border-gray-200">Email</th>
              <th className="px-4 py-2 border-b border-gray-200 rounded-tr-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="text-center hover:bg-green-100">
                <td className="px-4 py-2 border-b border-gray-200">
                  <img
                    src={admin.avatarURL || placeholderImage}
                    alt={admin.name}
                    className="w-24 h-24 object-cover rounded-full"
                  />
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {admin.name}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {admin.email}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  <button
                    onClick={() => handleEditClick(admin.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:bg-green-600 hover:scale-105"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedAdmin && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-auto relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
              >
                &times;
              </button>
              <h3 className="text-3xl font-bold text-green-800 mb-6">
                Edit Admin
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="mb-6">
                  <label
                    className="block text-green-600 font-semibold mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    {...register("name", { required: true })}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="text"
                    placeholder="Admin Name"
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-green-600 font-semibold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    {...register("email", { required: true })}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="email"
                    placeholder="Admin Email"
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-green-600 font-semibold mb-2"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    {...register("password")}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="password"
                    placeholder="Admin Password (optional)"
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-green-600 font-semibold mb-2"
                    htmlFor="avatar"
                  >
                    Avatar
                  </label>
                  <input
                    id="avatar"
                    {...register("avatar")}
                    className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="file"
                    accept="image/*"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-green-600 font-semibold mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {permissionsList.map((permission) => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          id={permission.id}
                          {...register(permission.id)}
                          type="checkbox"
                          className="mr-2"
                        />
                        <label
                          htmlFor={permission.id}
                          className="text-gray-700"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out"
                >
                  Update Admin
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAdminPage;
