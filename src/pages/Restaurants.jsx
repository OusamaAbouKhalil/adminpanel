import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useGetRestaurants } from "../lib/query/queries";

export default function Drivers() {
  const { data: restaurants, isPending: isLoading, isError } = useGetRestaurants();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const tableDisplay = [
    "Logo",
    "Restuarnt Name",
    "Location",
    "Category",
    "time",
    "Action",
    "Status",
  ];

  const add = () => {
    navigate("/add");
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants?.filter((restaurant) =>
      restaurant.rest_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [restaurants, searchTerm]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRestaurants?.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(filteredRestaurants?.length / rowsPerPage);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-800 uppercase bg-gray-200">
                <tr>
                  {tableDisplay.map((item, index) => (
                    <th key={index} scope="col" className="py-3 px-4">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((restaurant, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
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
                    <td className="py-4 px-4">
                      {restaurant.Category?.join(", ")}
                    </td>
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
          <div className="flex justify-center mt-6">
            <nav aria-label="Page navigation">
              <ul className="inline-flex items-center space-x-1">
                {[...Array(totalPages).keys()].map((number) => (
                  <li key={number}>
                    <button
                      onClick={() => goToPage(number + 1)}
                      className={`py-2 px-3 text-sm font-medium rounded-md border ${currentPage === number + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-blue-500 hover:text-white"
                        } transition duration-300`}
                    >
                      {number + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
