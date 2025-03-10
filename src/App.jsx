import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { Navbar, Sidebar } from "./components";
import { Toaster } from 'react-hot-toast';
import {
  Dashboard,
  Add,
  Calendar,
  Restaurants,
  Kanban,
  RestaurantItem,
  AddItem,
  Menu,
  Orders,
  LoginPage,
  SendNotificationPage,
  EditNotificationPage,
  PromoCodesPage,
  OffersPage,
  Titles,
  DealsPage,
  AddAdmin,
  EditAdmin,
  Drivers,
  Rides,
  RevenuePage,
  PaymentMethod,
  Users, Calculator,
  UpdateVersion,
  AddRestaurantOwner,
  DriversMap
} from "./pages";
import "./App.css";
import { useStateContext } from "./contexts/ContextProvider";
import Edit from "./pages/Edit";
import { ProtectedRoute } from "./contexts/ProtectedRoutes";
import PricesPage from "./pages/PricesPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<MainLayout />}>
      <Route
        index
        element={
          <ProtectedRoute>
            <Restaurants />
          </ProtectedRoute>
        }
      />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="map"
        element={
          <ProtectedRoute>
            <DriversMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="addowner"
        element={
          <ProtectedRoute>
            <AddRestaurantOwner />
          </ProtectedRoute>
        }
      />
      <Route
        path="restaurants"
        element={
          <ProtectedRoute>
            <Restaurants />
          </ProtectedRoute>
        }
      />
      <Route
        path="orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="add"
        element={
          <ProtectedRoute>
            <Add />
          </ProtectedRoute>
        }
      />
      <Route
        path="restaurants/:id/additem"
        element={
          <ProtectedRoute>
            <AddItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="restaurants/:id"
        element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        }
      />
      <Route
        path="restaurants/:id/edit"
        element={
          <ProtectedRoute>
            <Edit />
          </ProtectedRoute>
        }
      />
      <Route
        path="restaurants/:id/:item_id"
        element={
          <ProtectedRoute>
            <RestaurantItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="kanban"
        element={
          <ProtectedRoute>
            <Kanban />
          </ProtectedRoute>
        }
      />
      <Route
        path="calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="prices"
        element={
          <ProtectedRoute>
            <PricesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="notification"
        element={
          <ProtectedRoute>
            <SendNotificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="editnotification"
        element={
          <ProtectedRoute>
            <EditNotificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="offers"
        element={
          <ProtectedRoute>
            <OffersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="promo"
        element={
          <ProtectedRoute>
            <PromoCodesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="titles"
        element={
          <ProtectedRoute>
            <Titles />
          </ProtectedRoute>
        }
      />
      <Route
        path="banners"
        element={
          <ProtectedRoute>
            <DealsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="addadmin"
        element={
          <ProtectedRoute>
            <AddAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="editadmin"
        element={
          <ProtectedRoute>
            <EditAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="drivers"
        element={
          <ProtectedRoute>
            <Drivers />
          </ProtectedRoute>
        }
      />
      <Route
        path="rides"
        element={
          <ProtectedRoute>
            <Rides />
          </ProtectedRoute>
        }
      />
      <Route
        path="revenue"
        element={
          <ProtectedRoute>
            <RevenuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="methods"
        element={
          <ProtectedRoute>
            <PaymentMethod />
          </ProtectedRoute>
        }
      />
      <Route
        path="calculator"
        element={
          <ProtectedRoute>
            <Calculator />
          </ProtectedRoute>
        }
      />
      <Route
        path="version"
        element={
          <ProtectedRoute>
            <UpdateVersion />
          </ProtectedRoute>
        }
      />
    </Route>


  </Routes>
);

const MainLayout = () => {
  const { activeMenu } = useStateContext();

  // Sidebar width class based on active state
  const sidebarClass = activeMenu
    ? "w-64 fixed sidebar dark:bg-secondary-dark-bg bg-white"
    : "w-20 fixed sidebar dark:bg-secondary-dark-bg bg-white";

  // Content area class that adjusts based on the sidebar's state
  const contentClass = activeMenu
    ? "dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-64 w-full transition-all duration-300"
    : "bg-main-bg dark:bg-main-dark-bg w-full min-h-screen md:ml-20 flex-2 transition-all duration-300";

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <div className={sidebarClass}>
        <Sidebar />
      </div>
      <div className={contentClass}>
        <Navbar />
        <Outlet /> {/* This is where nested routes will be rendered */}
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: 'green',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'red',
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
