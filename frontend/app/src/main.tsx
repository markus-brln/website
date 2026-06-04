import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import App from './components/App/App';
import './main.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <MantineProvider withGlobalStyles withNormalizeCSS>
                <App />
            </MantineProvider>
        </BrowserRouter>
    </React.StrictMode>
);
