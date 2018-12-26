import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import createStores from './stores'
import MainPage from './pages/MainPage'
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from "react-router-dom";
import './main.css'

const stores = createStores()


console.log('Stores APP', stores.app)
ReactDOM.render(
  <Provider {...stores}>
    <Router>
      <MainPage />
    </Router>
  </Provider>,
  document.getElementById('app')
)