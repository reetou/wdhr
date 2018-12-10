import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import createStores from './stores'
import MainPage from './pages/MainPage'
import Profile from './pages/Profile'
import About from './pages/About'
import Register from './pages/Register'
import DevTools from 'mobx-react-devtools'
import MainContainer from './MainContainer'
import Login from './pages/Login'
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from "react-router-dom";
import MyProjects from "./pages/MyProjects"
import AllProjects from "./pages/AllProjects"
import CreateProject from "./pages/CreateProject"

const stores = createStores()

window['STORES'] = stores

console.log('Stores APP', stores.app)
ReactDOM.render(
  <Provider {...stores}>
    <Router>
      <MainPage>
        <Route exact path="/" render={() => stores.auth.loggedIn ? <Redirect to={'/profile'}/> : <Login />} />
        <Route path="/profile" render={() => stores.auth.loggedIn ? <Profile/> : <Redirect to={'/login'}/>} />
        <Route path="/register" render={() => stores.auth.loggedIn ? <Redirect to={'/profile'}/> : <Register />} />
        <Route path="/login" render={() => stores.auth.loggedIn ? <Redirect to={'/profile'}/> : <Login />} />
        <Route exact path="/myprojects" render={() => stores.auth.loggedIn ? <MyProjects/> : <Redirect to={'/login'}/>} />
        <Route exact path="/projects" render={() => stores.auth.loggedIn ? <AllProjects/> : <Redirect to={'/login'}/>} />
        <Route path="/myprojects/create" render={() => stores.auth.loggedIn ? <CreateProject/> : <Redirect to={'/login'}/>} />
        <Route path="/about" component={About} />
        <DevTools/>
      </MainPage>
    </Router>
  </Provider>,
  document.getElementById('app')
)