import React, { useState, useEffect } from 'react';
import { BsDownload } from 'react-icons/bs';
import { MdOutlineSupervisorAccount } from 'react-icons/md';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useStateContext } from '../contexts/ContextProvider';
import { getDatabase, ref, onValue } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import 'chart.js/auto';
import { fsdb } from '../utils/firebaseconfig';

const getStartOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getEndOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export default function Dashboard() {
  const [usersNum, setUsersNum] = useState(0);
  const [revenueData, setRevenueData] = useState({ deliveryCharge: { labels: [], data: [] }, profit: { labels: [], data: [] } });
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getEndOfMonth());
  const { ridesNum, driversNum, financials, cards, createdDate } = useStateContext();
  const { expense, budget } = financials;

  useEffect(() => {
    // Fetch user count from Realtime Database
    const db = getDatabase();
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const userCount = usersData ? Object.keys(usersData).length : 0;
      setUsersNum(userCount);
    });

    // Fetch revenue data from Firestore
    const fetchRevenueData = async () => {
      try {
        const revenueRef = collection(fsdb, 'revenue');
        const snapshot = await getDocs(revenueRef);

        const revenueEntries = snapshot.docs.map(doc => doc.data());
        console.log('Revenue Entries:', revenueEntries); // Log fetched data

        // Filter data based on selected date range
        const filteredEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });

        console.log('Filtered Entries:', filteredEntries); // Log filtered data

        // Organize data by type
        const deliveryChargeData = {
          labels: [],
          data: [],
        };
        const profitData = {
          labels: [],
          data: [],
        };

        filteredEntries.forEach(entry => {
          const entryDate = new Date(entry.date).toLocaleDateString();
          if (entry.type === 'deliveryCharge') {
            deliveryChargeData.labels.push(entryDate);
            deliveryChargeData.data.push(parseFloat(entry.amount) || 0);
          } else if (entry.type === 'profit') {
            profitData.labels.push(entryDate);
            profitData.data.push(parseFloat(entry.amount) || 0);
          }
        });

        setRevenueData({ deliveryCharge: deliveryChargeData, profit: profitData });
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    fetchRevenueData();
  }, [startDate, endDate]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(new Date(value));
    } else if (name === 'endDate') {
      setEndDate(new Date(value));
    }
  };

  const currentDate = new Date();

  const userStats = {
    labels: ['Users'],
    datasets: [{
      label: 'Count',
      data: [usersNum],
      backgroundColor: ['#4CAF50'],
    }],
  };

  const financialStats = {
    labels: ['Rest Profit', 'Delivery Charge'],
    datasets: [{
      label: 'Financials',
      data: [budget, expense],
      backgroundColor: ['#4CAF50', '#FF9800'],
    }],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Updates',
      },
    },
  };

  const lineChartDataDeliveryCharge = {
    labels: revenueData.deliveryCharge.labels,
    datasets: [{
      label: 'Delivery Charges',
      data: revenueData.deliveryCharge.data,
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.2)',
      fill: true,
    }],
  };

  const lineChartDataProfit = {
    labels: revenueData.profit.labels,
    datasets: [{
      label: 'Profit',
      data: revenueData.profit.data,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      fill: true,
    }],
  };

  // Function to handle file download
  const handleDownload = () => {
    if (!revenueData.deliveryCharge.labels || !revenueData.deliveryCharge.data || !revenueData.profit.labels || !revenueData.profit.data) {
      console.error('Revenue data is missing');
      return;
    }

    const csvData = [
      ['Date', 'Type', 'Amount'],
      ...revenueData.deliveryCharge.labels.map((label, index) => [label, 'Delivery Charge', revenueData.deliveryCharge.data[index] || '0']),
      ...revenueData.profit.labels.map((label, index) => [label, 'Profit', revenueData.profit.data[index] || '0']),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', 'report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-10 p-5">
      <div className="flex flex-wrap justify-between items-center mb-10">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold text-gray-700">Dashboard</h2>
          <p className="text-gray-500">Created: {currentDate.toString()}</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}  // Attach the download function
          className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center hover:bg-green-700"
        >
          <BsDownload className="mr-2" />
          Download Report
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="startDate" className="mr-4">Start Date:</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={startDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
          className="border border-gray-300 rounded-lg p-2"
        />
        <label htmlFor="endDate" className="ml-4 mr-4">End Date:</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={endDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
          className="border border-gray-300 rounded-lg p-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((item) => (
          <div
            key={item.title}
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-5 rounded-lg shadow-md flex items-center justify-between"
          >
            <div>
              <p className="text-gray-400 font-medium">{item.title}</p>
              <p className="text-2xl font-semibold text-gray-700">{item.amount}</p>
            </div>
            <div
              className={`text-3xl p-4 rounded-full ${item.iconBg} text-white`}
              style={{ backgroundColor: item.iconBg }}
            >
              {item.title === 'Users' && <MdOutlineSupervisorAccount />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">User Statistics</h3>
          <Bar data={userStats} />
        </div>
        
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Trend - Profit</h3>
          <Line options={lineChartOptions} data={lineChartDataProfit} />
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Trend - Delivery Charges</h3>
          <Line options={lineChartOptions} data={lineChartDataDeliveryCharge} />
        </div>

      </div>
    </div>
  );
}
