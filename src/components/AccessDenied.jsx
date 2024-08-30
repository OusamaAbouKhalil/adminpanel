// AccessDeniedPage.js
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa'; // Import warning and lock icons from react-icons
import './AccessDeniedPage.css'; // Import updated CSS

const AccessDeniedPage = () => {
  return (
    <div className="access-denied-page">
      <div className="warning-icon">
        <FaExclamationTriangle size={80} />
      </div>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <a href="/restaurants">Go to Restaurants</a>
    </div>
  );
};

export default AccessDeniedPage;
