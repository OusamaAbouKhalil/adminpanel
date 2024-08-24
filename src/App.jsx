import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { Navbar, Sidebar } from "./components"
import { Dashboard, Add, Calendar, Restaurants, Kanban, Test, AddItem, Menu, Orders, LoginPage } from "./pages"
import './App.css';
import { useStateContext } from './contexts/ContextProvider';
import Edit from './pages/Edit';
import { ProtectedRoute } from './contexts/ProtectedRoutes';
import PricesPage from './pages/PricesPage'; // price path



const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/prices" element={<PricesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ProtectedRoute ch><Restaurants /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="restaurants" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
            <Route path="restaurants/:id/additem" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
            <Route path="restaurants/:id" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="restaurants/:id/edit" element={<ProtectedRoute><Edit /></ProtectedRoute>} />
            <Route path="restaurants/:id/:item_id" element={<ProtectedRoute><Test /></ProtectedRoute>} />
            <Route path="kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
            <Route path="calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { activeMenu } = useStateContext();

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      {activeMenu && (
        <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
          <Sidebar />
        </div>
      )}
      <div className={activeMenu ? 'dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full' : 'bg-main-bg dark:bg-main-dark-bg w-full min-h-screen flex-2'}>
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full">
          <Navbar />
        </div>
        <Outlet />  {/* This is where nested routes will be rendered */}
      </div>
    </div>
  );
};

export default App;
