import React, { Component } from 'react';
import { 
  BrowserRouter as Router, Route, Switch
} from 'react-router-dom'
import { Provider } from "react-redux";
import './App.css';

import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/dashboard";

class App extends Component {

  render() {
    return (
      <Provider store={this.props.store}>
        <Router>
          <div className="wrapper">
            <Switch>
              <Route exact path="/" component={Login}/>
              <Route path="/register" component={Register}/>
              <Route path="/dashboard" component={Dashboard}/>
            </Switch>
          </div>
          {/* end of wrapper */}
        </Router>
      </Provider>
    );
  }
}

export default App;
