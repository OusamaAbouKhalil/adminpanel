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
  // Counters of users by type client driver SwiftBites driver
  const [usersNum, setUsersNum] = useState({ normal: 0, drivers: 0, SwiftBitesDrivers: 0 });
  const [revenueData, setRevenueData] = useState({ deliveryCharge: { labels: [], data: [] }, profit: { labels: [], data: [] } });
  const [driversData, setDriversData] = useState({ drivers: [], swiftBitesDrivers: [] });
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
      const userCount = {
        normal: usersData ? Object.keys(usersData).length : 0,
        drivers: 0,
        SwiftBitesDrivers: 0
      };
      setUsersNum(userCount);
    });

    // Fetch drivers data from Realtime Database
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

    // Fetch revenue data from Firestore
    const fetchRevenueData = async () => {
      try {
        const revenueRef = collection(fsdb, 'revenue');
        const snapshot = await getDocs(revenueRef);

        const revenueEntries = snapshot.docs.map(doc => doc.data());
        console.log('Revenue Entries:', revenueEntries);

        const filteredEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });

        console.log('Filtered Entries:', filteredEntries);

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
    labels: ['Normal Users', 'Drivers', 'SwiftBitesDrivers'],
    datasets: [{
      label: 'User Types',
      data: [usersNum.normal, usersNum.drivers, driversData.swiftBitesDrivers.length],
      backgroundColor: ['#4CAF50', '#2196F3', '#FF5722'],
    }],
  };

  const financialStats = {
    labels: ['Rest Profit', 'Delivery Charge'],
    datasets: [{
      label: 'Financials',
      data: [revenueData.profit.data, revenueData.deliveryCharge.data],
      backgroundColor: ['#4CAF50', '#FF9800'],
    }],
  };

  const driversChartData = {
    labels: ['Drivers', 'SwiftBitesDrivers'],
    datasets: [
      {
        label: 'Drivers',
        data: [driversData.drivers.length, driversData.swiftBitesDrivers.length],
        backgroundColor: ['#2196F3', '#FF5722'],
      },
    ],
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
          onClick={handleDownload}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">User Types</h3>
          <Pie data={userStats} />
        </div>
        <div className="flex flex-wrap justify-center gap-1 items-center w-full">
          {cards.map((item) => (
            <div key={item.title}
              {...item.title === 'Users' ? item.amount = usersNum :
                item.title === 'biteDrivers' ? item.amount = driversNum :
                  item.title === 'Requests' ? item.amount = ridesNum :
                    item.title === 'Guests' ? null :
                      null
              }
              className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                {item.title === 'Users' ? <MdOutlineSupervisorAccount /> :
                  item.title === 'biteDrivers' ? <FaTaxi /> :
                    item.title === 'Requests' ? <FaCodePullRequest /> :
                      item.title === 'Guests' ? <FaAngellist /> :
                        null
                }
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">{item.amount}</span>
                <span className={`text-sm text-${item.pcColor} ml-2`}>
                  {item.percentage}
                </span>
              </p>
              <p className="text-sm text-gray-400  mt-1">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Revenue (Profit)</h3>
          <Line data={lineChartDataProfit} options={lineChartOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Drivers</h3>
          <Pie data={driversChartData} />
        </div>
      </div>
    </div>
  );
}
