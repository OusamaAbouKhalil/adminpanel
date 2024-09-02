import React from 'react';
import { useForm } from 'react-hook-form';
import { doc } from "firebase/firestore";
import CryptoJS from 'crypto-js';
import { fsdb, auth } from '../utils/firebaseconfig'; // Ensure storage is imported
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';



const permissionsList = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'restaurants', label: 'Restaurants Pages' },
  { id: 'orders', label: 'Orders' },
  { id: 'prices', label: 'Pricing' },
  { id: 'notification', label: 'Notification Center' },
  { id: 'editnotification', label: 'Edit Notification' },
  { id: 'offers', label: 'Promotions Center' },
  { id: 'promo', label: 'Promotions - Promo' },
  { id: 'titles', label: 'Personalization - Titles' },
  { id: 'banners', label: 'Personalization - Banners' },
  { id: 'addadmin', label: 'Admins Center' },
  { id: 'editadmin', label: 'Edit Admin?' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'kanban', label: 'Kanban' },
];

const AdminPage = () => {
  const { register, handleSubmit, reset, watch } = useForm();
  const avatarFile = watch('avatar'); // Watch the avatar file input

  const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const onSubmit = async (data) => {
    const permissions = {};
    permissionsList.forEach(permission => {
      permissions[permission.id] = data[permission.id] || false;
    });
  
    let avatarURL = '';
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
  
      alert('Admin updated successfully!');
      handleCloseModal();
    } catch (e) {
      console.error("Error updating admin: ", e);
    }
  };
  
  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-green-800 text-center">Add Admin</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="name">Name</label>
            <input
              id="name"
              {...register("name", { required: true })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="text"
              placeholder="Admin Name"
            />
          </div>
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              {...register("email", { required: true })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="email"
              placeholder="Admin Email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              {...register("password", { required: true })}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="password"
              placeholder="Admin Password"
            />
          </div>
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2" htmlFor="avatar">Avatar</label>
            <input
              id="avatar"
              {...register("avatar")}
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              type="file"
              accept="image/*"
            />
          </div>
          <div className="mb-6">
            <label className="block text-green-600 font-semibold mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-4">
              {permissionsList.map(permission => (
                <div key={permission.id} className="flex items-center">
                  <input
                    id={permission.id}
                    {...register(permission.id)}
                    type="checkbox"
                    className="mr-3 rounded text-green-500 focus:ring-green-300"
                  />
                  <label htmlFor={permission.id} className="text-green-700">{permission.label}</label>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Add Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
