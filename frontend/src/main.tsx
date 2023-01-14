import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as JotaiProvider } from 'jotai';
import customTheme from './styles/customTheme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <JotaiProvider>
            <ChakraProvider theme={customTheme}>
                <App />
            </ChakraProvider>
        </JotaiProvider>
    </React.StrictMode>
);
