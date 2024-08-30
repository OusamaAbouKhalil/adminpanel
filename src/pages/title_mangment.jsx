import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { FaEdit, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';

const db = getFirestore();

const Titles = () => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState({ title: "", show_in_morning: false, show_in_afternoon: false });
  const [editTitle, setEditTitle] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("add");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    const fetchTitles = async () => {
      setLoading(true);
      const docRef = doc(db, "section_titles", "swiftbites");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTitles(docSnap.data().titles || []);
      }
      setLoading(false);
    };

    fetchTitles();
  }, []);

  const handleInputChange = (e, setter) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    let updatedTitles = [...titles];
    if (editIndex !== null) {
      updatedTitles[editIndex] = editTitle;
    } else {
      updatedTitles.push(newTitle);
    }

    try {
      await updateDoc(doc(db, "section_titles", "swiftbites"), {
        titles: updatedTitles,
      });
      setTitles(updatedTitles);
      setNewTitle({ title: "", show_in_morning: false, show_in_afternoon: false });
      setEditTitle(null);
      setEditIndex(null);
      setMessage('Title saved successfully!');
      setMessageType('success');
    } catch (err) {
      setMessage('Error saving title.');
      setMessageType('error');
      console.error('Error saving title:', err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (index) => {
    setEditTitle(titles[index]);
    setEditIndex(index);
    setActiveTab("edit");
  };

  const handleDelete = async (index) => {
    if (window.confirm("Are you sure you want to delete this title?")) {
      try {
        let updatedTitles = titles.filter((_, i) => i !== index);

        await updateDoc(doc(db, "section_titles", "swiftbites"), {
          titles: updatedTitles,
        });

        setTitles(updatedTitles);
        setMessage('Title deleted successfully!');
        setMessageType('success');
      } catch (err) {
        setMessage('Error deleting title.');
        setMessageType('error');
        console.error('Error deleting title:', err);
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;

    let updatedTitles = [...titles];
    [updatedTitles[index - 1], updatedTitles[index]] = [updatedTitles[index], updatedTitles[index - 1]];

    setTitles(updatedTitles);
    updateTitlesInDB(updatedTitles);
  };

  const handleMoveDown = (index) => {
    if (index === titles.length - 1) return;

    let updatedTitles = [...titles];
    [updatedTitles[index + 1], updatedTitles[index]] = [updatedTitles[index], updatedTitles[index + 1]];

    setTitles(updatedTitles);
    updateTitlesInDB(updatedTitles);
  };

  const updateTitlesInDB = async (updatedTitles) => {
    try {
      await updateDoc(doc(db, "section_titles", "swiftbites"), {
        titles: updatedTitles,
      });
      setMessage('Titles reordered successfully!');
      setMessageType('success');
    } catch (err) {
      setMessage('Error updating titles.');
      setMessageType('error');
      console.error('Error updating titles:', err);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white min-h-screen ">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Manage Titles</h1>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("add")}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === "add" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Add New Title
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === "edit" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Edit Existing Titles
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Add New Title Section */}
        {activeTab === "add" && (
          <div className="mb-12 p-6 bg-white rounded-lg shadow-lg border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add New Title</h2>
            <input
              type="text"
              name="title"
              value={newTitle.title}
              onChange={(e) => handleInputChange(e, setNewTitle)}
              placeholder="Enter title"
              className="w-full border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="show_in_morning"
                checked={newTitle.show_in_morning}
                onChange={(e) => handleInputChange(e, setNewTitle)}
                className="mr-2"
              />
              <label className="text-gray-700">Show in Morning</label>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="show_in_afternoon"
                checked={newTitle.show_in_afternoon}
                onChange={(e) => handleInputChange(e, setNewTitle)}
                className="mr-2"
              />
              <label className="text-gray-700">Show in Afternoon</label>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition duration-300 ease-in-out"
            >
              Add Title
            </button>
          </div>
        )}

        {/* Edit Existing Title Section */}
        {activeTab === "edit" && (
          <div className="mt-8">
            {editIndex !== null ? (
              <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Title</h2>
                <input
                  type="text"
                  name="title"
                  value={editTitle.title}
                  onChange={(e) => handleInputChange(e, setEditTitle)}
                  placeholder="Enter title"
                  className="w-full border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="show_in_morning"
                    checked={editTitle.show_in_morning}
                    onChange={(e) => handleInputChange(e, setEditTitle)}
                    className="mr-2"
                  />
                  <label className="text-gray-700">Show in Morning</label>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="show_in_afternoon"
                    checked={editTitle.show_in_afternoon}
                    onChange={(e) => handleInputChange(e, setEditTitle)}
                    className="mr-2"
                  />
                  <label className="text-gray-700">Show in Afternoon</label>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition duration-300 ease-in-out"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditIndex(null)}
                  className="mt-4 w-full bg-red-600 text-white py-3 rounded-lg shadow-lg hover:bg-red-700 transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Existing Titles</h2>
                <ul className="space-y-4">
                  {titles.map((title, index) => (
                    <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-300">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{title.title}</h3>
                        <p className="text-sm text-gray-600">
                          Morning: {title.show_in_morning ? "Yes" : "No"} | Afternoon: {title.show_in_afternoon ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="bg-blue-600 text-white rounded-full p-3 shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="bg-red-600 text-white rounded-full p-3 shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
                        >
                          <FaTrash size={20} />
                        </button>
                        <button
                          onClick={() => handleMoveUp(index)}
                          className="bg-purple-600 text-white rounded-full p-3 shadow-md hover:bg-purple-700 transition duration-300 ease-in-out"
                        >
                          <FaArrowUp size={20} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          className="bg-green-600 text-white rounded-full p-3 shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
                        >
                          <FaArrowDown size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Titles;
