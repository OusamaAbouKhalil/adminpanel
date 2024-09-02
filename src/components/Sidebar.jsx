import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel, MdMenu } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { IoLogOutOutline } from 'react-icons/io5';
import { AiOutlineLink } from 'react-icons/ai';
import { FaRegBuilding, FaComments } from 'react-icons/fa';

import { links } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuth } from '../contexts/AuthProvider';

function Sidebar() {
  const { activeMenu, setActiveMenu, screenSize } = useStateContext();
  const { logOut } = useAuth();
  
  const [openSection, setOpenSection] = useState(null);
  const [openCompanySites, setOpenCompanySites] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleCloseSideBar = () => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const handleLogout = () => {
    logOut();
    handleCloseSideBar();
  };

  const handleSectionToggle = (title) => {
    if (!collapsed) {
      setOpenSection(openSection === title ? null : title);
    }
  };

  const toggleCompanySites = () => {
    setOpenCompanySites(prev => !prev);
  };

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const activeLink = 'flex items-center gap-4 px-4 py-2 rounded-lg text-white text-md bg-green-800 hover:bg-green-900 transition-colors duration-200 ease-in-out';
  const normalLink = 'flex items-center gap-4 px-4 py-2 rounded-lg text-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out';

  return (
    <div className={`sidebar h-screen bg-white dark:bg-gray-800 shadow-lg fixed top-0 left-0 z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ${activeMenu ? '' : 'hidden'}`}>
      {activeMenu && (
        <div className="h-full flex flex-col">
          <div className='flex items-center justify-between px-4 py-3 border-b dark:border-gray-600'>
            <Link to="/" onClick={handleCloseSideBar} className='flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white'>
              <SiShopware size={28} className={`${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && <span>Swift Go</span>}
            </Link>
            <TooltipComponent content={collapsed ? "Expand" : "Collapse"} position='BottomCenter'>
              <button type="button" onClick={toggleSidebar} className='text-xl rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700'>
                {collapsed ? <MdMenu size={28} /> : <MdOutlineCancel size={28} />}
              </button>
            </TooltipComponent>
          </div>
          <div className="flex-1 overflow-auto px-4 py-6">
            {links.map((item) => (
              <div key={item.title} className='mb-6'>
                {!collapsed && (
                  <p 
                    className={`text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 cursor-pointer`}
                    onClick={() => handleSectionToggle(item.title)}
                  >
                    {item.title}
                  </p>
                )}
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openSection === item.title || collapsed ? 'max-h-screen' : 'max-h-0'}`}
                >
                  {item.links.map((link) => (
                    <NavLink
                      to={`/${link.name}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      className={({ isActive }) => isActive ? activeLink : normalLink}
                    >
                      <span className="text-xl">{link.icon}</span>
                      {!collapsed && <span className='capitalize'>{link.name}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
            {/* Company Sites Section */}
            <div className="mt-6">
              {!collapsed && (
                <p 
                  className={`text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 cursor-pointer`}
                  onClick={toggleCompanySites}
                >
                  Company Sites
                </p>
              )}
              <div 
                className={`overflow-hidden transition-all duration-300 ${openCompanySites || collapsed ? 'max-h-screen' : 'max-h-0'}`}
              >
                <a
                  href="https://infiniterealm.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700 transition-colors duration-200 ease-in-out"
                  onClick={handleCloseSideBar}
                >
                  <FaRegBuilding size={28} className={`${collapsed ? 'mx-auto' : ''}`} />
                  {!collapsed && <span className="text-md font-medium">Company Website</span>}
                </a>
                <a
                  href="https://swiftgo-ems.wuaze.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-700 transition-colors duration-200 ease-in-out mt-2"
                  onClick={handleCloseSideBar}
                >
                  <AiOutlineLink size={28} className={`${collapsed ? 'mx-auto' : ''}`} />
                  {!collapsed && <span className="text-md font-medium">EMS</span>}
                </a>
                <a
                  href="https://tawk.to"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-700 transition-colors duration-200 ease-in-out mt-2"
                  onClick={handleCloseSideBar}
                >
                  <FaComments size={28} className={`${collapsed ? 'mx-auto' : ''}`} />
                  {!collapsed && <span className="text-md font-medium">Chat support</span>}
                </a>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700">
            <button
              className="flex  w-full p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700 transition-colors duration-200 ease-in-out"
              onClick={handleLogout}
            >
              <IoLogOutOutline size={28} className="mx-auto" />
              {!collapsed && <span className="ml-2 text-sm font-medium text-left">Logout</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
