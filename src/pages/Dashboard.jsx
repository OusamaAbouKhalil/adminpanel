import React from 'react';
import { BsCurrencyDollar } from 'react-icons/bs';
import { GoDotFill } from "react-icons/go";

import { Stacked, Button, SparkLine } from '../components';
import { SparklineAreaData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { FaTaxi, FaCodePullRequest, FaAngellist } from "react-icons/fa6";

import { MdOutlineSupervisorAccount } from 'react-icons/md';
export default function Dashboard() {
  const { ridesNum, driversNum, usersNum, financials, cards } = useStateContext();
  // const {complete, pending, cancel} = reqCount;
  const { expense, budget } = financials;
  return (
    <div className="mt-24">
      <div className="dashboard flex flex-col m-3">
        <div className='bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full p-8 pt-9 bg-hero-pattern bg-no-repeat bg-cover bg-center z-10'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='font-bold text-gray-400'>Users</p>
              <p className='text-2xl'>{usersNum}</p>
            </div>
            <button
              type="button"
              className="text-2xl opacity-0.9 text-white hover:drop-shadow-xl rounded-full p-4 bg-green-900"
            >
              <BsCurrencyDollar />
            </button>
          </div>
          <div className='mt-4'>
            <Button
              color="white"
              bgColor="green"
              text="Download"
              borderRadius="10px"
              size="md"
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-1 items-center w-full">
          {cards.map((item) => (
            <div key={item.title}
              {...item.title === 'Users' ? item.amount = usersNum :
                item.title === 'Drivers' ? item.amount = driversNum :
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
                  item.title === 'Drivers' ? <FaTaxi /> :
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
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        <div className=' bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-780'>
          <div className='flex justify-between'>
            <p className='font-semibold'>Revenue Updates</p>
            <div className='flex items-center gap-4'>
              <p className='flex items-center gap-2 text-gray-600 hover:drop-shadow-xl '>
                <span>
                  <GoDotFill />
                </span>
                <span>
                  Expense
                </span>
              </p>
              <p className='flex items-center gap-2 text-green-600 hover:drop-shadow-xl '>
                <span>
                  <GoDotFill />
                </span>
                <span>
                  Budget
                </span>
              </p>
            </div>
          </div>
          <div className='mt-10 flex flex-wrap gap-10 justify-center'>
            <div className=' border-r-1 border-color m-4 pr-10'>
              <div>
                <p>
                  <span className='text-3xl font-semibold'>{budget}</span>
                  <span className='p-1.5 hover:drop-shadow-xl cursor-pointer rounded-full bg-green-400 text-white ml-3 text-xs'>50%</span>
                </p>
                <p className='text-gray-500 mt-1'>Budget</p>
              </div>
              <div className='mt-10'>
                <p>
                  <span className='text-3xl font-semibold'>{expense}</span>
                </p>
                <p className='text-gray-500 mt-1'>Expense</p>
              </div>
              <div className="mt-5">
                <SparkLine currentColor="green" id="line-sparkLine" type="Line" height="80px" width="250px" data={SparklineAreaData} color="green" />
              </div>
              <div className='mt-10'>
                <Button
                  color="white"
                  bgColor="green"
                  text="Download Report"
                  borderRadius="10px"
                />
              </div>
            </div>
            <div>
              <Stacked
                width="320px"
                height="360px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
