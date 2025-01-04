import React from 'react'
import ReactDOM from 'react-dom/client'

import { ShowNumbersProvider } from './state/ShowNumbersProvider'
import { ShowNamesProvider } from './state/ShowNamesProvider'
import { SubPageProvider } from './state/SubPageProvider'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ShowNumbersProvider>
            <ShowNamesProvider>
                <SubPageProvider>
                    <App />
                </SubPageProvider>
            </ShowNamesProvider>
        </ShowNumbersProvider>
    </React.StrictMode>,
)
