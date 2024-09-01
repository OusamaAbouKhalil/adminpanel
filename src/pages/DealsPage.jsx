import React, { useEffect, useState } from 'react';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDealId, setNewDealId] = useState('');
  const [newOfferImage, setNewOfferImage] = useState(null);
  const [previousOfferImagePath, setPreviousOfferImagePath] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  const firestore = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const dealsCollection = collection(firestore, 'deals');
    const unsubscribe = onSnapshot(dealsCollection, (snapshot) => {
      const dealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeals(dealsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const handleAddDeal = async () => {
    if (!newDealId || !newOfferImage) {
      setMessage('Please provide a valid deal ID and offer image.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    try {
      // Upload the new image
      const imagePath = `deals/${newDealId}`;
      const imageRef = storageRef(storage, imagePath);
      await uploadBytes(imageRef, newOfferImage);
      const imageUrl = await getDownloadURL(imageRef);

      // Add new deal with image URL
      const newDeal = {
        deal_id: newDealId,
        offer_image: imageUrl, // Store the URL in Firestore
      };

      await addDoc(collection(firestore, 'deals'), newDeal);
      setMessage('Deal added successfully!');
      setMessageType('success');
      setNewDealId('');
      setNewOfferImage(null);
      setPreviousOfferImagePath(null);
    } catch (err) {
      setMessage('Error adding deal.');
      setMessageType('error');
      console.error('Error adding deal:', err);
    }
    setSaving(false);
  };

  const handleUpdateDeal = async (id, field, file) => {
    setSaving(true);
    try {
      if (field === 'offer_image') {
        // Get the previous deal data
        const dealDoc = doc(firestore, 'deals', id);
        const dealSnapshot = await getDoc(dealDoc);
        const dealData = dealSnapshot.data();

        if (dealData && dealData.offer_image) {
          // Extract the path from the URL
          const previousImagePath = dealData.offer_image.split('/o/')[1].split('?')[0];
          const previousImageRef = storageRef(storage, decodeURIComponent(previousImagePath));
          await deleteObject(previousImageRef);
        }

        // Upload the new image
        const newImagePath = `deals/${id}`;
        const newImageRef = storageRef(storage, newImagePath);
        await uploadBytes(newImageRef, file);
        const newImageUrl = await getDownloadURL(newImageRef);

        // Update Firestore document with the new image URL
        await updateDoc(dealDoc, { offer_image: newImageUrl });
      } else {
        // Update other fields (not images)
        const dealDoc = doc(firestore, 'deals', id);
        await updateDoc(dealDoc, { [field]: file });
      }
      setMessage('Deal updated successfully!');
      setMessageType('success');
    } catch (err) {
      setMessage('Error updating deal.');
      setMessageType('error');
      console.error('Error updating deal:', err);
    }
    setSaving(false);
  };

  const handleDeleteDeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        const dealDoc = doc(firestore, 'deals', id);
        const dealSnapshot = await getDoc(dealDoc);
        const dealData = dealSnapshot.data();
        if (dealData && dealData.offer_image) {
          // Extract the path from the URL
          const imagePath = dealData.offer_image.split('/o/')[1].split('?')[0];
          const imageRef = storageRef(storage, decodeURIComponent(imagePath));
          await deleteObject(imageRef);
        }
        await deleteDoc(dealDoc);
        setMessage('Deal deleted successfully!');
        setMessageType('success');
      } catch (err) {
        setMessage('Error deleting deal.');
        setMessageType('error');
        console.error('Error deleting deal:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Deals Management</h1>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === 'add' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Add Deal
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-6 rounded-t-lg text-lg font-semibold transition-transform transform ${activeTab === 'edit' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Edit Deals
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Form to Add a New Deal */}
        {activeTab === 'add' && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add New Deal</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Deal ID"
                value={newDealId}
                onChange={(e) => setNewDealId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <input
                type="file"
                onChange={(e) => setNewOfferImage(e.target.files[0])}
                className="w-full border border-gray-300 rounded-lg p-4 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                onClick={handleAddDeal}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg shadow-lg hover:from-green-700 hover:to-green-600 transition duration-300 ease-in-out"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                    <span className="ml-2">Saving...</span>
                  </div>
                ) : (
                  'Add Deal'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Form to Edit Existing Deals */}
        {activeTab === 'edit' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Edit Existing Deals</h2>
            <ul className="space-y-4">
              {deals.map((deal) => (
                <li key={deal.id} className="bg-white p-4 border border-gray-300 rounded-lg shadow-md">
                  <div className="flex items-center space-x-6">
                    <div className="relative w-32 h-32 overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={deal.offer_image}
                        alt={deal.deal_id}
                        className="w-full h-full object-cover"
                      />
                      <input
                        type="file"
                        onChange={(e) => handleUpdateDeal(deal.id, 'offer_image', e.target.files[0])}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-red-700 transition duration-300 ease-in-out"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
