import './app/globals.css'
import { ThemeProvider as  ThemeProvider } from "@/components/ThemeProvider"

import Page from './components/home/Page'
import Loader from './components/Loader'

import './fonts.css';

const App: React.FC = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Loader />
            <Page />
        </ThemeProvider>
    );
};

export default App
