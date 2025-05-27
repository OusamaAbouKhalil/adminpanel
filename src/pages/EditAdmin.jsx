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
  { id: "map", label: "Map" },
  { id: "revenue", label: "Revenues Pages" },
  { id: "restaurants", label: "Restaurants Pages" },
  { id: "add", label: "add Restaurants" },
  { id: "orders", label: "Orders" },
  { id: "drivers", label: "View drivers" },
  { id: "rides", label: "View rides" },
  { id: "prices", label: "Pricing" },
  { id: "methods", label: "Payment Methods" },
  { id: "users", label: "Users" },
  { id: "calculator", label: "Calculator" },
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
  { id: "addowner", label: "Add Restaurant Owner" },
];

const placeholderImage =
  "https://avatar.iran.liara.run/public/boy?username=Ash";

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
        setValue("avatar", data.avatarURL || "");
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Admin Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-6 py-4 text-left rounded-tl-xl">Avatar</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={admin.avatarURL || placeholderImage}
                        alt={admin.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-700">{admin.name}</td>
                    <td className="px-6 py-4 text-gray-700">{admin.email}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditClick(admin.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  Edit Admin
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      {...register("name", { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="text"
                      placeholder="Admin Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      {...register("email", { required: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="email"
                      placeholder="Admin Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      {...register("password")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="password"
                      placeholder="Admin Password (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar
                    </label>
                    <input
                      id="avatar"
                      {...register("avatar")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      type="file"
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissionsList.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            id={permission.id}
                            {...register(permission.id)}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-gray-700 text-sm"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Update Admin
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAdminPage;