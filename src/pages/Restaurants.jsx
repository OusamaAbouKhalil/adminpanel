import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useGetRestaurants } from "../lib/query/queries";
import useDebounce from "../hooks/useDebounce";
import { useInView } from 'react-intersection-observer';
import { getRestaurantReviews } from "../lib/firebase/api";
import { Header } from "../components";
import BulkEntryForm from '../components/BulkEntryForm';
import Modal from 'react-modal';

// Initialize Modal
Modal.setAppElement('#root');

const Restaurants = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const debouncedValue = useDebounce(searchTerm, 500);
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useGetRestaurants(debouncedValue);

  const restaurants = data?.pages.flatMap(page => page.items) || [];

  // Infinite scroll effect
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  // Event handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleAdd = () => navigate("/add");
  const handleEdit = (id) => navigate(`/restaurants/${id}/edit`);
  
  // Reviews handling
  const fetchReviews = useCallback(async (restaurantId) => {
    try {
      const reviewsSnapshot = await getRestaurantReviews(restaurantId);
      return reviewsSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }, []);

  const openReviewsModal = useCallback(async (restaurant) => {
    setSelectedRestaurant({
      rest_name: restaurant.rest_name,
      rest_id: restaurant.rest_id,
      reviews: []
    });
    setIsModalOpen(true);
    
    const reviews = await fetchReviews(restaurant.rest_id);
    setSelectedRestaurant(prev => ({ ...prev, reviews: reviews || [] }));
  }, [fetchReviews]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header category="Page" title="Restaurants" />
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Add Restaurant
            </button>
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Bulk Upload
            </button>
          </div>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Bulk Upload Modal */}
        <BulkEntryForm
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
        />

        {/* Restaurants List */}
        {isLoading ? (
          <RestaurantsSkeleton />
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                  <tr>
                    {["Logo", "Name", "Location", "Category", "Time", "Action", "Status", "Reviews"].map((header) => (
                      <th key={header} className="py-4 px-6 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.rest_id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <img
                          src={restaurant.main_image}
                          alt={restaurant.rest_name}
                          className="w-12 h-12 rounded-full object-cover shadow-sm"
                          loading="lazy"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/restaurants/${restaurant.rest_id}`}
                          className="text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
                        >
                          {restaurant.rest_name}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        {restaurant.location?._lat && restaurant.location?._long ? (
                          <a
                            href={`https://www.google.com/maps?q=${restaurant.location._lat},${restaurant.location._long}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                          >
                            View Map
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">{restaurant.Category?.join(", ") || "N/A"}</td>
                      <td className="py-4 px-6">{restaurant.time || "N/A"}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleEdit(restaurant.rest_id)}
                          className="text-green-500 hover:text-green-700 transition-colors duration-200"
                        >
                          <FaEdit size={18} />
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          restaurant.isClosed 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {restaurant.isClosed ? "Closed" : "Open"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openReviewsModal(restaurant)}
                          className="text-green-500 hover:text-green-700 transition-colors duration-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Infinite Scroll Loader */}
            <div ref={ref} className="py-6 text-center">
              {isFetchingNextPage ? (
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
              ) : hasNextPage ? (
                <span className="text-gray-500">Loading more...</span>
              ) : (
                <span className="text-gray-500">That's all folks!</span>
              )}
            </div>
          </div>
        )}

        {/* Reviews Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="max-w-2xl mx-4 my-16 bg-white rounded-xl shadow-2xl p-6 outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Reviews for {selectedRestaurant?.rest_name}
          </h2>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {selectedRestaurant?.reviews?.length > 0 ? (
              selectedRestaurant.reviews.map((review, index) => (
                <div key={index} className="border-b pb-4">
                  <p className="font-semibold text-gray-700">{review.uid}</p>
                  <p className="text-gray-600">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {review.datePublished?.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
          <button
            onClick={closeModal}
            className="mt-6 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Close
          </button>
        </Modal>
      </div>
    </div>
  );
};

const RestaurantsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-12 bg-gray-200 rounded-lg" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 rounded-lg" />
    ))}
  </div>
);

export default Restaurants;