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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Add New Admin</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              {...register("name", { required: true })}
              type="text"
              placeholder="Admin Name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f51b5] focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              {...register("email", { required: true })}
              type="email"
              placeholder="Admin Email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f51b5] focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              {...register("password", { required: true })}
              type="password"
              placeholder="Admin Password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f51b5] focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Avatar */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar
            </label>
            <input
              id="avatar"
              {...register("avatar")}
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3f51b5] file:text-white hover:file:bg-[#303f9f] focus:outline-none focus:ring-2 focus:ring-[#3f51b5] transition-colors duration-200"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
              {permissionsList.map(permission => (
                <div key={permission.id} className="flex items-center">
                  <input
                    id={permission.id}
                    {...register(permission.id)}
                    type="checkbox"
                    className="h-4 w-4 text-[#3f51b5] border-gray-300 rounded focus:ring-[#3f51b5] transition-colors duration-200"
                  />
                  <label htmlFor={permission.id} className="ml-2 text-sm text-gray-700">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#3f51b5] text-white font-semibold py-3 rounded-lg hover:bg-[#303f9f] transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#3f51b5] focus:ring-offset-2"
          >
            Add Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;