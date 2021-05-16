import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '@nokia-csf-uxr/csfWidgets/csfWidgets.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import history from './components/History';
import {Router} from 'react-router-dom';
//import 'bootstrap/dist/css/bootstrap.css';

{/* import {BrowserRouter as Router, Route, Link, NavLink, Switch} from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const routing=(
<Router>
<div>
  <h1>Welcome To My Project</h1>
  <Route path="/" component={Login} />
  <Route path="/d" component={Dashboard} />
</div>
</Router>
); */}

ReactDOM.render(
  <React.StrictMode>
    <Router history={history}>
    <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
