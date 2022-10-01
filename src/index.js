import React from 'react'
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'

import App from './App'
import reducers from './state/reducers'

const container = document.getElementById('root');
const root = createRoot(container);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(
    applyMiddleware(thunk)
))

root.render(
    <Provider store={store}>
        <App />
    </Provider>
)
