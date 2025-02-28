import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useGetRestaurants } from "../lib/query/queries";
import useDebounce from "../hooks/useDebounce";
import ReactModal from "react-modal";
import { getRestaurantReviews } from "../lib/firebase/api";
import { useInView } from 'react-intersection-observer';
import BulkEntryForm from '../components/BulkEntryForm';

export default function Restaurants() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedValue = useDebounce(searchTerm, 500);
  const { ref, inView } = useInView();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useGetRestaurants(debouncedValue);

  const restaurants = data?.pages.flatMap(page => page.items) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const add = () => {
    navigate("/add");
  };

  const fetchReviews = useCallback(async (restaurantId) => {
    try {
      const reviewsSnapshot = await getRestaurantReviews(restaurantId);
      return reviewsSnapshot.docs.map((doc) => doc.data());
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
    setSelectedRestaurant(prev => ({
      ...prev,
      reviews: reviews || []
    }));
  }, [fetchReviews]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  return (
    <div className="m-4 md:m-8 lg:m-12 mt-12 p-4 md:p-8 bg-gray-50 rounded-lg shadow-lg">
      <Header category="Page" title="Restaurants" />
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex space-x-4">
          <button
            onClick={add}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-2 rounded-lg transition duration-300"
          >
            Add
          </button>
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-lg transition duration-300"
          >
            Bulk Upload
          </button>
        </div>
        <BulkEntryForm
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
        />
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border-2 border-gray-300 bg-white h-12 px-4 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      {isLoading ? (
        <RestaurantsSkeleton />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full text-sm text-center text-gray-600">
            <thead className="bg-green-600 text-white font-bold">
              <tr>
                <th scope="col" className="py-3 px-4">
                  Logo
                </th>
                <th scope="col" className="py-3 px-4">
                  Restaurant Name
                </th>
                <th scope="col" className="py-3 px-4">
                  Location
                </th>
                <th scope="col" className="py-3 px-4">
                  Category
                </th>
                <th scope="col" className="py-3 px-4">
                  Time
                </th>
                <th scope="col" className="py-3 px-4">
                  Action
                </th>
                <th scope="col" className="py-3 px-4">
                  Status
                </th>
                <th scope="col" className="py-3 px-4">
                  Reviews
                </th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant.rest_id}>
                  <td className="py-4 px-4">
                    <img
                      src={restaurant.main_image}
                      className="w-16 h-16 object-fit rounded-md shadow-sm"
                      alt={restaurant.rest_name}
                      loading="lazy"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      to={`/restaurants/${restaurant.rest_id}`}
                      className="font-medium text-green-600 hover:underline"
                    >
                      {restaurant.rest_name}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    {restaurant.location?._lat && restaurant.location?._long ? (
                      <a
                        href={`https://www.google.com/maps?q=${restaurant.location._lat},${restaurant.location._long}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View on Map
                      </a>
                    ) : (
                      "Location not available"
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {restaurant.Category?.join(", ")}
                  </td>
                  <td className="py-4 px-4">{restaurant.time}</td>
                  <td className="py-4 px-4 text-center">
                    <button
                      className="text-green-500 hover:text-green-700 transition duration-300"
                      onClick={() =>
                        navigate(`/restaurants/${restaurant.rest_id}/edit`)
                      }
                    >
                      <FaEdit />
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {restaurant.isClosed ? (
                      <span className="text-red-500 font-semibold">
                        Closed
                      </span>
                    ) : (
                      <span className="text-green-500 font-semibold">
                        Open
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openReviewsModal(restaurant)}
                      className="text-green-500 hover:text-green-700 transition duration-300"
                    >
                      Reviews
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Infinite scroll trigger */}
          <div ref={ref} className="h-20 flex items-center justify-center">
            {isFetchingNextPage ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            ) : hasNextPage ? (
              <div className="text-gray-400">Loading more...</div>
            ) : (
              <div className="text-gray-400">No more restaurants</div>
            )}
          </div>
        </div>

      )}
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Restaurant Reviews"
        className="bg-white rounded-lg p-8 max-w-2xl mx-auto shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4">
          Reviews for {selectedRestaurant?.rest_name}
        </h2>
        {/* Display reviews for the selected restaurant */}
        {selectedRestaurant?.reviews?.length > 0 ? (
          selectedRestaurant.reviews.map((review, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{review.uid}</p>
              <p className="text-gray-600">{review.text}</p>
              <p className="text-sm text-gray-400">
                {review.datePublished.toDate().toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>No reviews available.</p>
        )}
        <button
          onClick={closeModal}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
        >
          Close
        </button>
      </ReactModal>
    </div>
  );
}
const RestaurantsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-16 bg-gray-200 rounded mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-20 bg-gray-200 rounded mb-2"></div>
    ))}
  </div>
);