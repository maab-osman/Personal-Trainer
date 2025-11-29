import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* Ensure routes work under GitHub Pages subpath */}
    <BrowserRouter basename="/Personal-Trainer">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
