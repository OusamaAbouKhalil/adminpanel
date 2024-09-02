import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { fsdb } from '../utils/firebaseconfig'; 
import { useHistory } from 'react-router-dom';

const AdminListPage = () => {
  const [admins, setAdmins] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsCollection = collection(fsdb, 'admins');
        const adminsSnapshot = await getDocs(adminsCollection);
        const adminsList = adminsSnapshot.docs.map(doc => ({
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

  const handleEdit = (adminId) => {
    history.push(`/edit-admin/${adminId}`);
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-green-800 text-center">Admin List</h2>
        <table className="w-full mt-6 border-collapse">
          <thead>
            <tr className="bg-green-200 text-green-800">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id} className="text-center">
                <td className="px-4 py-2 border">{admin.name}</td>
                <td className="px-4 py-2 border">{admin.email}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleEdit(admin.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminListPage;
