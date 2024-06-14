
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'

import { ShowNumbersProvider } from './state/ShowNumbersProvider'
import { ShowNamesProvider } from './state/ShowNamesProvider'
import App from './App'
import reducers from './state/reducers'


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(
    applyMiddleware(thunk),
))

ReactDOM.render(
    <Provider store={store}>
        <ShowNumbersProvider>
            <ShowNamesProvider>
                <App />
            </ShowNamesProvider>
        </ShowNumbersProvider>
    </Provider>,
    document.getElementById('root'),
)
