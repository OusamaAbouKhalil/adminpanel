import React, { useMemo, useState } from "react";
import { Header } from "../components";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetRestaurantMenu } from "../lib/query/queries";
import BulkItemEntryForm from "../components/BulkItemEntryForm";
import RestaurantAddonsForm from "../components/RestaurantAddonsForm";

export default function Menu() {
  const { id } = useParams();
  const Navigate = useNavigate();

  const { data: menu, isLoading } = useGetRestaurantMenu(id);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isAddonsFormOpen, setIsAddonsFormOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <Header category="restaurant" title={" "} />

        {/* Search and Actions Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={additem}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Add Item
              </button>
              <button
                onClick={() => setIsBulkAddOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Bulk Add
              </button>
              <button
                onClick={() => setIsAddonsFormOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Manage Addons
              </button>
            </div>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white shadow-sm transition-all duration-200"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                <tr>
                  <th className="w-40 py-4 px-6 font-semibold">Item Image</th>
                  <th className="w-40 py-4 px-6 font-semibold">Name</th>
                  <th className="w-24 py-4 px-6 font-semibold">Price</th>
                  <th className="w-60 py-4 px-6 font-semibold">Description</th>
                  <th className="w-32 py-4 px-6 font-semibold">Discount</th>
                  <th className="w-32 py-4 px-6 font-semibold">Status</th>
                  <th className="w-24 py-4 px-6 font-semibold">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRows?.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <img
                          src={item.item_image}
                          className="w-20 h-20 object-cover rounded-md shadow-sm hover:scale-105 transition-transform duration-200"
                          alt={item.item_name || "Item Image"}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="truncate">
                        <Link
                          to={`/restaurants/${id}/${item.item_id}`}
                          className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors duration-200"
                        >
                          {item.item_name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-emerald-700 font-medium">
                      ${item.item_price}
                    </td>
                    <td className="py-4 px-6">
                      <div className="truncate" title={item.item_description}>
                        {item.item_description}
                      </div>
                    </td>
                    <td
                      className="py-4 px-6 font-medium"
                      style={{
                        color: item.item_discount > 0 ? "#ef4444" : "#10b981",
                      }}
                    >
                      {item.item_discount}%
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block py-1 px-3 rounded-full text-xs font-medium ${
                          item.available
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.available ? "Available" : "Not Available"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {item.orders_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="mt-8 flex justify-center">
          <nav className="flex flex-wrap gap-2">
            {(!isLoading && menu) && (
              <>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number}
                    onClick={() => goToPage(number + 1)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 ${
                      currentPage === number + 1
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-gray-600 hover:bg-emerald-500 hover:text-white border border-gray-200"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Modals */}
        <BulkItemEntryForm
          isOpen={isBulkAddOpen}
          onClose={() => setIsBulkAddOpen(false)}
          restaurantId={id}
        />
        <RestaurantAddonsForm
          isOpen={isAddonsFormOpen}
          onClose={() => setIsAddonsFormOpen(false)}
          restaurantId={id}
        />
      </div>
    </div>
  );
}
