import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { FaEdit } from "react-icons/fa";

export default function Drivers() {
  const { restaurants } = useStateContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const tableDisplay = [
    "Main Image",
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
    return restaurants.filter((restaurant) =>
      restaurant.rest_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [restaurants, searchTerm]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRestaurants.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(filteredRestaurants.length / rowsPerPage);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when search term changes
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Restaurants" />
      <div className="flex justify-between mb-4">
        <button
          onClick={add}
          className="bg-gray-800 text-white text-sm px-4 rounded-md"
        >
          Add
        </button>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
        />
      </div>
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {tableDisplay.map((item, index) => (
                <th key={index} scope="col" className="py-3 px-6">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((restaurant, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="py-4 px-6">
                  <img
                    src={restaurant.main_image}
                    width={"30"}
                    height={""}
                    alt=""
                  />
                </td>
                <td className="py-4 px-6">
                  <Link
                    to={`/restaurants/${restaurant.rest_id}`}
                    className="font-medium text-gray-900 dark:text-white hover:underline"
                  >
                    {restaurant.rest_name}
                  </Link>
                </td>
                <td className="py-4 px-6">{restaurant.location}</td>
                <td className="py-4 px-6">
                  {restaurant.Category?.map(
                    (category, index) =>
                      category +
                      (index < restaurant.Category.length - 1 ? ", " : "")
                  )}
                </td>
                <td className="py-4 px-6">{restaurant.time}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center h-full">
                    <button
                      className="text-blue-500"
                      onClick={() =>
                        navigate(`/restaurants/${restaurant.rest_id}/edit`)
                      }
                    >
                      <FaEdit />
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {restaurant.isClosed ? (
                    <span className="text-red-500">Closed</span>
                  ) : (
                    <span className="text-green-500">Open</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <nav aria-label="Page navigation">
          <ul className="inline-flex items-center -space-x-px">
            {[...Array(totalPages).keys()].map((number) => (
              <li key={number}>
                <button
                  onClick={() => goToPage(number + 1)}
                  className={`py-2 px-3 leading-tight ${currentPage === number + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-500"
                    } border border-gray-300 hover:bg-blue-500 hover:text-white`}
                >
                  {number + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
