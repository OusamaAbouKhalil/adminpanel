import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useGetRestaurants } from "../lib/query/queries";
import useDebounce from "../hooks/useDebounce";

export default function Restaurants() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedValue = useDebounce(searchTerm, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetRestaurants(debouncedValue);

  const restaurants = data?.pages.flatMap((page) => page.restaurantList) || [];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleScroll = () => {
    const scrollPosition =
      window.innerHeight + document.documentElement.scrollTop;
    const threshold = document.documentElement.offsetHeight - 100;

    if (scrollPosition >= threshold && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);


  const add = () => {
    navigate("/add");
  };

  return (
    <div className="m-4 md:m-8 lg:m-12 mt-12 p-4 md:p-8 bg-gray-50 rounded-lg shadow-lg">
      <Header category="Page" title="Restaurants" />
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <button
          onClick={add}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-lg transition duration-300"
        >
          Add
        </button>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border-2 border-gray-300 bg-white h-12 px-4 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {isLoading && restaurants.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-800 uppercase bg-gray-200">
                <tr>
                  <th scope="col" className="py-3 px-4">Logo</th>
                  <th scope="col" className="py-3 px-4">Restaurant Name</th>
                  <th scope="col" className="py-3 px-4">Location</th>
                  <th scope="col" className="py-3 px-4">Category</th>
                  <th scope="col" className="py-3 px-4">Time</th>
                  <th scope="col" className="py-3 px-4">Action</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <img
                        src={restaurant.main_image}
                        className="w-16 h-16 object-cover rounded-md shadow-sm"
                        alt={restaurant.rest_name}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/restaurants/${restaurant.rest_id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {restaurant.rest_name}
                      </Link>
                    </td>
                    <td className="py-4 px-4">{restaurant.location}</td>
                    <td className="py-4 px-4">{restaurant.Category?.join(", ")}</td>
                    <td className="py-4 px-4">{restaurant.time}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 transition duration-300"
                        onClick={() =>
                          navigate(`/restaurants/${restaurant.rest_id}/edit`)
                        }
                      >
                        <FaEdit />
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {restaurant.isClosed ? (
                        <span className="text-red-500 font-semibold">Closed</span>
                      ) : (
                        <span className="text-green-500 font-semibold">Open</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center items-center mt-4">
              <p className="text-gray-500">Loading more...</p>
            </div>
          )}
        </div>
      )}
      {isError && (
        <div className="flex justify-center items-center mt-4">
          <p className="text-red-500">Error loading data.</p>
        </div>
      )}
    </div>
  );
}