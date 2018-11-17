import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, browserHistory } from 'react-router'

import App from './components/App';
import Home from './components/Home';
import Product from './components/Product';
import Profile from './components/Profile';
import NoMatch from './components/NoMatch';

const routes = (
  <Route path="/" component={App} >
    <IndexRedirect to="home" />
    {/* <IndexRoute component={Home} /> */}
    <Route path="home" component={Home} />
    <Route path="product" component={Product} />
    <Route path="profile" component={Profile} />
    <Route path="*" component={NoMatch} />
  </Route>
);

ReactDOM.render(
  <Router routes={routes} history={browserHistory} />,
  document.getElementById('root')
)
