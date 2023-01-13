import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as JotaiProvider } from 'jotai';
import theme from '../theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <JotaiProvider>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </JotaiProvider>
    </React.StrictMode>
);
