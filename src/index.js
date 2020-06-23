import 'bootstrap/dist/css/bootstrap.css';
import 'core-js/features/array';
import 'core-js/features/object/values';
import 'core-js/features/string/includes';
import React from 'react';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import 'sw-rpg-icons/css/sw-rpg-colors.min.css';
import 'sw-rpg-icons/css/sw-rpg-icons.min.css';
import { App } from './components/index';
import allReducers from './redux/reducers';
import './styles/index.css';

export const store = createStore(allReducers, {}, applyMiddleware(thunk));

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
