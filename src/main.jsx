import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'

import { ThemeModeProvider } from './state/ThemeModeProvider'
import { ShowNumbersProvider } from './state/ShowNumbersProvider'
import { ShowNamesProvider } from './state/ShowNamesProvider'
import App from './App.jsx'
import reducers from './state/reducers'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(
    applyMiddleware(thunk),
))
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
        <ThemeModeProvider>
        <ShowNumbersProvider>
            <ShowNamesProvider>
                <App />
            </ShowNamesProvider>
        </ShowNumbersProvider>
        </ThemeModeProvider>
    </Provider>
  </React.StrictMode>,
)
