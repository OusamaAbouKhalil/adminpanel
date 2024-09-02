import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateAdmin } from '../lib/query/queries';
import { permissionsList } from '../data/dummy';

const AdminPage = () => {
  const { register, handleSubmit, reset, watch } = useForm();
  const avatarFile = watch('avatar'); // Watch the avatar file input
  const { mutate: createAdmin } = useCreateAdmin();

  const onSubmit = (data) => {
    createAdmin({ data, avatarFile }, {
      onSuccess: () => {
        alert('Admin created successfully!');
        reset();
      },
      onError: (error) => {
        console.error("Error creating admin: ", error);
      }
    });
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