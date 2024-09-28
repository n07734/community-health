import './app/globals.css'
import { ThemeProvider } from "@/components/ThemeProvider"

import Page from './components/home/Page'
import Loader from './components/Loader'
import ErrorBoundary from './components/ErrorBoundary'

import './fonts.css';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Loader />
                <Page />
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App
