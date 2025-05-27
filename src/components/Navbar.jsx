import React, { useEffect, useRef } from 'react';
import { AiOutlineMenuFold } from 'react-icons/ai';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useStateContext } from '../contexts/ContextProvider';

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-full p-2 hover:bg-gray-100 transition-colors duration-200"
    >
      <span
        style={{ background: dotColor }}
        className="absolute inline-flex rounded-full h-2 w-2 right-1 top-1"
      />
      {icon}
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  const { currentColor, activeMenu, setActiveMenu, handleClick, isClicked, setScreenSize, screenSize } = useStateContext();
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const handleClickOutside = (event) => {
    if (navbarRef.current && !navbarRef.current.contains(event.target)) {
      handleClick(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav
      ref={navbarRef}
      className="flex items-center justify-between px-4 py-3 bg-white shadow-md md:px-6 sticky top-0 z-50"
    >
      {/* Left Side: Menu Button */}
      <NavButton
        title="Menu"
        customFunc={handleActiveMenu}
        color={currentColor}
        icon={<AiOutlineMenuFold />}
      />

      {/* Right Side: Navigation Items */}
      {/* Uncomment and style this section if you want to include the additional nav items */}
      {/* <div className="flex items-center space-x-4">
        <NavButton
          title="Chat"
          dotColor="#03C9D7"
          customFunc={() => handleClick('chat')}
          color={currentColor}
          icon={<BsChatLeft />}
        />
        <NavButton
          title="Notification"
          dotColor="rgb(254, 201, 15)"
          customFunc={() => handleClick('notification')}
          color={currentColor}
          icon={<RiNotification3Line />}
        />
        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            onClick={() => handleClick('userProfile')}
          >
            <img
              className="rounded-full w-9 h-9 object-cover"
              src={avatar}
              alt="user-profile"
            />
            <div className="flex items-center">
              <p className="text-gray-600 text-sm">
                <span className="text-gray-500">Hi, </span>
                <span className="font-semibold">Ali</span>
              </p>
              <MdKeyboardArrowDown className="text-gray-500 ml-1" />
            </div>
          </div>
        </TooltipComponent>

        {isClicked.cart && <Cart />}
        {isClicked.chat && <Chat />}
        {isClicked.notification && <Notification />}
        {isClicked.userProfile && <UserProfile />}
      </div> */}
    </nav>
  );
};

export default Navbar;