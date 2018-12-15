import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Layout, Menu, Breadcrumb, Icon, Button
} from 'antd';
const {
  Header, Content, Footer,
} = Layout;
const SubMenu = Menu.SubMenu;
import 'antd/dist/antd.css'
import { BrowserRouter as Router, Route, Link, Redirect, Switch } from "react-router-dom";
import { withRouter } from "react-router-dom"
import DevTools from 'mobx-react-devtools'
import About from "./About"
import Profile from './Profile'
import Register from './Register'
import Login from './Login'
import MyProjects from "./MyProjects"
import AllProjects from "./AllProjects"
import MyArticles from "./MyArticles"
import AllArticles from "./AllArticles"
import CreateProject from "./CreateProject"
import CreateArticle from "./CreateArticle"
import Project from "./Project"

@inject('app', 'auth', 'project', 'article')
@withRouter
@observer
export default class MainPage extends React.Component {

  async componentDidMount() {
    this.props.app.history = this.props.history
    await this.props.auth.initLogin('/myprojects')
    console.log(`MAINPAGE LOGGED IN?`, this.props.auth.loggedIn)
    console.log(`MATCH DATA ROUTER`, this.props.location)
    await this.props.project.loadUserProjects()
    await this.props.article.loadUserArticles()
  }

  render() {
    const app = this.props.app
    const auth = this.props.auth
    return (
      <Layout style={{ height: '100vh' }}>
        <Sider/>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              style={{
                fontSize: 20,
                marginTop: 10,
                marginLeft: 10,
                cursor: 'pointer'
              }}
              id={'collapse-custom-button'}
              className="trigger"
              type={app.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={() => app.collapsed = !app.collapsed}
            />
            <span style={{ marginLeft: 10 }}>{app.header}</span>
          </Header>
          <Content style={{ margin: '16px 16px 0 16px' }}>
            <Route exact path="/" render={() => auth.loggedIn ? <Redirect to={'/profile'}/> : <Login />} />
            <Route path="/profile" render={() => auth.loggedIn ? <Profile/> : <Redirect to={'/login'}/>} />
            <Route path="/register" render={() => auth.loggedIn ? <Redirect to={'/profile'}/> : <Register />} />
            <Route path="/login" render={() => auth.loggedIn ? <Redirect to={'/profile'}/> : <Login />} />
            <Route exact path="/myprojects" render={() => true ? <MyProjects/> : <Redirect to={'/login'}/>} />
            <Route exact path="/projects" render={() => auth.loggedIn ? <AllProjects/> : <Redirect to={'/login'}/>} />
            <Route exact path="/myarticles" render={() => auth.loggedIn ? <MyArticles/> : <Redirect to={'/login'}/>} />
            <Route exact path="/articles" render={() => auth.loggedIn ? <AllArticles/> : <Redirect to={'/login'}/>} />
            <Route path="/myprojects/create" render={() => auth.loggedIn ? <CreateProject/> : <Redirect to={'/login'}/>} />
            <Route path={'/projects/:id'} render={() => <Project/>} />
            <Route path="/myarticles/create" render={() => auth.loggedIn ? <CreateArticle/> : <Redirect to={'/login'}/>} />
            <Route path="/about" component={About} />
            <DevTools/>
          </Content>
        </Layout>
      </Layout>
    )
  }
}