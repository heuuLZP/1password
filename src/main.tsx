import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StyleRegistry from './components/StyleRegistry';
import 'antd/dist/antd.variable.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyleRegistry>
      <App />
    </StyleRegistry>
  </React.StrictMode>,
); 
