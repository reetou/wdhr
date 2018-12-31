import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import createStores from './stores'
import MainPage from './pages/MainPage'
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from "react-router-dom";
// import './theme.less'
import './style.scss'

const stores = createStores()

ReactDOM.render(
  <Provider {...stores}>
    <Router>
      <MainPage />
    </Router>
  </Provider>,
  document.getElementById('app')
)