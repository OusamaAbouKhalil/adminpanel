import React, { useMemo, useState } from "react";
import { Header } from "../components";
import { useStateContext } from "../contexts/ContextProvider";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetRestaurantMenu } from "../lib/query/queries";

export default function Menu() {
  const { id } = useParams();
  const Navigate = useNavigate();

  const { data: menu, isLoading } = useGetRestaurantMenu(id);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const tableMenuDsiplay = ["Item Image", "Name", "Price", "Description", "Discount percentage", "Availabilty", "Order Count"];


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

      {/* Search and Add Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <button
          onClick={additem}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
        >
          Add
        </button>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-64 border-2 border-gray-300 bg-white h-12 px-4 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table Section */}
      <div className="w-full overflow-hidden bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="text-xs text-gray-100 bg-green-600">
              <tr>
                <th className="w-40 py-3 px-4">Item Image</th>
                <th className="w-40 py-3 px-4">Name</th>
                <th className="w-24 py-3 px-4">Price</th>
                <th className="w-60 py-3 px-4">Description</th>
                <th className="w-32 py-3 px-4">Discount</th>
                <th className="w-32 py-3 px-4">Status</th>
                <th className="w-24 py-3 px-4">Orders</th>
              </tr>
            </thead>
            <tbody>
              {currentRows?.map((item, index) => (
                <tr key={index} className="border-b bg-white hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <img
                        src={item.item_image}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                        alt={item.item_name || 'Item Image'}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={item.item_name}>
                      <Link
                        to={`/restaurants/${id}/${item.item_id}`}
                        className="font-medium text-green-600 hover:underline"
                      >
                        {item.item_name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-green-800 font-medium">${item.item_price}</td>
                  <td className="py-4 px-4">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={item.item_description}>
                      {item.item_description}
                    </div>
                  </td>
                  <td className="py-4 px-4" style={{ color: item.item_discount > 0 ? "red" : "green" }}>
                    {item.item_discount}%
                  </td>
                  <td className="py-4 px-4">
                    <div className={`py-1 px-2 rounded-lg text-xs font-semibold text-white ${item.available ? "bg-green-500" : "bg-red-500"
                      }`}>
                      {item.available ? "Available" : "Not Available"}
                    </div>
                  </td>
                  <td className="py-4 px-4">{item.orders_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="flex justify-center mt-6">
        <nav className="overflow-x-auto py-2">
          {(!isLoading && menu) && (
            <ul className="inline-flex flex-wrap gap-2 justify-center">
              {[...Array(totalPages).keys()].map((number) => (
                <li key={number}>
                  <button
                    onClick={() => goToPage(number + 1)}
                    className={`py-2 px-3 text-sm font-semibold rounded-md border ${currentPage === number + 1
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-green-500 hover:text-white"
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
