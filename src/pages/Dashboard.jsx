import React, { useState, useEffect } from 'react';
import { BsDownload } from 'react-icons/bs';
import { MdOutlineSupervisorAccount } from 'react-icons/md';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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
  const [usersNum, setUsersNum] = useState({ normal: 0, drivers: 0, SwiftBitesDrivers: 0 });
  const [revenueData, setRevenueData] = useState({ deliveryCharge: { labels: [], data: [] }, profit: { labels: [], data: [] } });
  const [driversData, setDriversData] = useState({ drivers: [], swiftBitesDrivers: [] });
  const [startDate, setStartDate] = useState(getStartOfMonth());
  const [endDate, setEndDate] = useState(getEndOfMonth());
  const { ridesNum, driversNum, financials, cards, createdDate } = useStateContext();
  const { expense, budget } = financials;

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const userCount = {
        normal: usersData ? Object.keys(usersData).length : 0,
        drivers: 0,
        SwiftBitesDrivers: 0
      };
      setUsersNum(userCount);
    });

    const fetchDriversData = () => {
      const driversRef = ref(db, 'drivers');
      const swiftBitesDriversRef = ref(db, 'swiftBitesDrivers');

      onValue(driversRef, (snapshot) => {
        const driversData = snapshot.val();
        setDriversData(prevData => ({
          ...prevData,
          drivers: driversData ? Object.keys(driversData) : []
        }));
        setUsersNum(prevNum => ({
          ...prevNum,
          drivers: driversData ? Object.keys(driversData).length : 0
        }));
      });

      onValue(swiftBitesDriversRef, (snapshot) => {
        const swiftBitesDriversData = snapshot.val();
        setDriversData(prevData => ({
          ...prevData,
          swiftBitesDrivers: swiftBitesDriversData ? Object.keys(swiftBitesDriversData) : []
        }));
        setUsersNum(prevNum => ({
          ...prevNum,
          SwiftBitesDrivers: swiftBitesDriversData ? Object.keys(swiftBitesDriversData).length : 0
        }));
      });
    };

    fetchDriversData();

    const fetchRevenueData = async () => {
      try {
        const revenueRef = collection(fsdb, 'revenue');
        const snapshot = await getDocs(revenueRef);
        const revenueEntries = snapshot.docs.map(doc => doc.data());

        const filteredEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });

        const deliveryChargeData = { labels: [], data: [] };
        const profitData = { labels: [], data: [] };

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
    labels: ['Normal Users', 'Drivers', 'SwiftBites Drivers'],
    datasets: [{
      data: [usersNum.normal, usersNum.drivers, usersNum.SwiftBitesDrivers],
      backgroundColor: ['#4F46E5', '#3B82F6', '#F97316'],
      hoverBackgroundColor: ['#4338CA', '#2563EB', '#EA580C'],
      borderWidth: 0,
    }],
  };

  const financialStats = {
    labels: ['Profit', 'Delivery Charge'],
    datasets: [{
      label: 'Financials',
      data: [
        revenueData.profit.data.reduce((a, b) => a + b, 0),
        revenueData.deliveryCharge.data.reduce((a, b) => a + b, 0)
      ],
      backgroundColor: ['#10B981', '#F59E0B'],
      borderColor: ['#059669', '#D97706'],
      borderWidth: 1,
    }],
  };

  const driversChartData = {
    labels: ['Drivers', 'SwiftBites Drivers'],
    datasets: [{
      data: [driversData.drivers.length, driversData.swiftBitesDrivers.length],
      backgroundColor: ['#3B82F6', '#F97316'],
      hoverBackgroundColor: ['#2563EB', '#EA580C'],
    }],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 } } },
      title: { display: true, text: '', font: { size: 16, weight: 'bold' } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const lineChartDataDeliveryCharge = {
    labels: revenueData.deliveryCharge.labels,
    datasets: [{
      label: 'Delivery Charges',
      data: revenueData.deliveryCharge.data,
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const lineChartDataProfit = {
    labels: revenueData.profit.labels,
    datasets: [{
      label: 'Profit',
      data: revenueData.profit.data,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const expenseBudgetChart = {
    labels: ['Expense', 'Budget'],
    datasets: [{
      data: [expense, budget],
      backgroundColor: ['#EF4444', '#6B7280'],
      hoverBackgroundColor: ['#DC2626', '#4B5563'],
    }],
  };

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
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Created: {currentDate.toLocaleString()}</p>
          </div>
          <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <BsDownload className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wide">Download Report</span>
          </button>
        </div>

        {/* Date Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate.toISOString().substr(0, 10)}
              onChange={handleDateChange}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate.toISOString().substr(0, 10)}
              onChange={handleDateChange}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Types */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            <Pie
              data={userStats}
              options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } } }}
            />
          </div>

          {/* Financials */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
            <Bar
              data={financialStats}
              options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
            />
          </div>

          {/* Delivery Charges */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Charges Trend</h3>
            <Line
              data={lineChartDataDeliveryCharge}
              options={{ ...lineChartOptions, plugins: { ...lineChartOptions.plugins, title: { ...lineChartOptions.plugins.title, text: 'Delivery Charges' } } }}
            />
          </div>

          {/* Profit */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Trend</h3>
            <Line
              data={lineChartDataProfit}
              options={{ ...lineChartOptions, plugins: { ...lineChartOptions.plugins, title: { ...lineChartOptions.plugins.title, text: 'Profit' } } }}
            />
          </div>

          {/* Drivers */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Distribution</h3>
            <Doughnut
              data={driversChartData}
              options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } } }}
            />
          </div>

          {/* Expense vs Budget */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense vs Budget</h3>
            <Doughnut
              data={expenseBudgetChart}
              options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
