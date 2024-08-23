import React, { useMemo, useState } from "react";
import { Header } from "../components";
import { useStateContext } from "../contexts/ContextProvider";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetRestaurantMenu } from "../lib/query/queries";

export default function Menu() {
  const { getRestaurantsMenu } = useStateContext();
  const { id } = useParams();
  const Navigate = useNavigate();

  const { data: menu, isLoading } = useGetRestaurantMenu(id);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const tableMenuDsiplay = ["", "Name", "Price", "Description", "Order Count"];


  const filteredItems = useMemo(() => {
    return menu?.filter((item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, searchTerm]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredItems?.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredItems?.length / rowsPerPage);

  const additem = () => {
    Navigate(`/restaurants/${id}/additem`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
return (
  <div className="m-4 md:m-8 lg:m-12 mt-16 p-4 md:p-8 lg:p-12 bg-gray-50 rounded-lg shadow-lg">
    <Header category="restaurant" title={" "} />
    <div className="flex flex-col md:flex-row items-center justify-between mb-6">
      <button
        onClick={additem}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
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
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-800 bg-gray-200">
          <tr>
            {tableMenuDsiplay.map((item, index) => (
              <th key={index} className="py-3 px-4">
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows?.map((item, index) => (
            <tr
              key={index}
              className="border-b bg-white hover:bg-gray-50"
            >
              <td className="py-4 px-4 text-center">
                <img
                  src={item.item_image}
                  className="w-24 sm:w-32 lg:w-40 h-auto max-w-full rounded-lg shadow-md"
                  alt={item.item_name || 'Item Image'}
                />
              </td>
              <td className="py-4 px-4">
                <Link
                  to={`/restaurants/${id}/${item.item_id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {item.item_name}
                </Link>
              </td>
              <td className="py-4 px-4">{item.item_price}</td>
              <td className="py-4 px-4">{item.item_description}</td>
              <td className="py-4 px-4">{item.orders_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex justify-center mt-6">
      <nav aria-label="Page navigation">
        {(!isLoading && menu) && (
          <ul className="inline-flex items-center space-x-1">
            {[...Array(totalPages).keys()].map((number) => (
              <li key={number}>
                <button
                  onClick={() => goToPage(number + 1)}
                  className={`py-2 px-3 text-sm font-semibold rounded-md border ${currentPage === number + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-blue-500 hover:text-white"
                    } transition duration-200`}
                >
                  {number + 1}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  </div>
);
}
