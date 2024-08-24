import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { IoLogOutOutline } from 'react-icons/io5';

import { links } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import { useAuth } from '../contexts/AuthProvider';

function Sidebar() {
  const { activeMenu, setActiveMenu, screenSize } = useStateContext();
  const { logOut } = useAuth();

  const [openSection, setOpenSection] = useState(null);

  const handleCloseSideBar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const handleLogout = () => {
    logOut();
    handleCloseSideBar();
  };

  const handleSectionToggle = (title) => {
    setOpenSection(openSection === title ? null : title);
  };

  const activeLink = 'flex items-center gap-4 pl-6 py-2 rounded-lg text-white text-md bg-blue-800 hover:bg-blue-900 transition-colors duration-200 ease-in-out';
  const normalLink = 'flex items-center gap-4 pl-6 py-2 rounded-lg text-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out';

  return (
    <div className='w-64 h-screen bg-white dark:bg-gray-800 shadow-lg overflow-auto'>
      {activeMenu && (
        <>
          <div className='flex items-center justify-between px-4 py-3 border-b dark:border-gray-600'>
            <Link to="/" onClick={handleCloseSideBar} className='flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white'>
              <SiShopware size={24} /><span>Swift Drive</span>
            </Link>
            <TooltipComponent content="Menu" position='BottomCenter'>
              <button type="button" onClick={() => setActiveMenu(prev => !prev)} className='text-xl rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden'>
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>
          <div className="mt-6 px-4">
            {links.map((item) => (
              <div key={item.title} className='mb-6'>
                <p 
                  className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3 cursor-pointer"
                  onClick={() => handleSectionToggle(item.title)}
                >
                  {item.title}
                </p>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${openSection === item.title ? 'max-h-screen' : 'max-h-0'}`}
                >
                  {item.links.map((link) => (
                    <NavLink
                      to={`/${link.name}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      className={({ isActive }) => isActive ? activeLink : normalLink}
                    >
                      {link.icon}
                      <span className='capitalize'>{link.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700">
            <button
              className="flex items-center justify-center w-full p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700 transition-colors duration-200 ease-in-out"
              onClick={handleLogout}
            >
              <IoLogOutOutline className="text-lg" />
              <span className="ml-2 text-sm font-medium">Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;
