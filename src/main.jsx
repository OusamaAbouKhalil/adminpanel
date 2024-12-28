import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';
import { ContextProvider } from './contexts/ContextProvider';
import { QueryProvider } from './lib/query/QueryProvider';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <QueryProvider>
      <ContextProvider>
        <App />
      </ContextProvider>
    </QueryProvider>
  </React.StrictMode>,
);
