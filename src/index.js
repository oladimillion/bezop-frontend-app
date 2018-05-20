import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import thunk from "redux-thunk";
import { createStore, applyMiddleware, compose} from "redux";
import rootReducer from "./reducers/index";
import SetAuthToken from "./auth-token";
import jwtDecode from "jwt-decode";
import { SetCurrentUser } from "./actions/actions";
import registerServiceWorker from './registerServiceWorker';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

if(localStorage.token){
  SetAuthToken(localStorage.token);
  store.dispatch(SetCurrentUser(jwtDecode(localStorage.token)));
}

// ()=>{},
ReactDOM.render(
  <App  store={store} />, 
  document.getElementById('root')
);
registerServiceWorker();
