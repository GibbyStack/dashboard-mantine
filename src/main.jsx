import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App';

// 1. Importar los CSS de Mantine y los gráficos
// ¡Estos son cruciales!
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolver la App con el Proveedor */}
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>
);