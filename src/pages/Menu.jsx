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
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="restaurant" title={" "} />
      <div className="flex justify-between mb-4">
        <button
          onClick={additem}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
              {tableMenuDsiplay.map((item, index) => (
                <th key={index} scope="col" className="py-3 px-6">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows?.map((item, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-left"
              >
                <td className="py-4 px-6">
                  <img src={item.item_image} className="min-w-20 w-32" alt="" />
                </td>
                <td className="py-4 px-6">
                  <Link
                    to={`/restaurants/${id}/${item.item_id || item.item_id // Solved By Ousama
                      }`}
                    className="font-medium text-gray-900 dark:text-white hover:underline"
                  >
                    {item.item_name}
                  </Link>
                </td>
                <td className="py-4 px-6">{item.item_price}</td>
                <td className="py-4 px-6">{item.item_description}</td>

                <td className="py-4 px-6">{item.orders_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <nav aria-label="Page navigation">
          {(!isLoading && menu) &&
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
            </ul>}
        </nav>
      </div>
    </div>
  );
}
