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
import ProjectRequests from "./ProjectRequests"
import ProjectMembers from "./ProjectMembers"

@inject('app', 'auth', 'project', 'article')
@withRouter
@observer
class CustomRedirecter extends React.Component {


  async componentDidMount() {
    this.props.app.history = this.props.history
    const project = this.props.project
    let auth = true
    if (!this.props.auth.loggedIn) {
      auth = false
      auth = await this.props.auth.initLogin('/myprojects')
    }
    console.log(`MATCH DATA ROUTER`, this.props.match)
    console.log(`LOCATION DATA ROUTER`, this.props.location)
    if (auth && !project.userProjects.length) {
      await this.props.project.loadUserProjects()
      await this.props.article.loadUserArticles()
    }
  }

  render() {
    if (this.props.auth.loading || this.props.auth.loggingIn) {
      return <h1>Loading...</h1>
    }
    return <div>
      {this.props.children}
    </div>
  }

}

@inject('app', 'auth', 'project', 'article')
@withRouter
@observer
export default class MainPage extends React.Component {

  componentWillMount() {
    this.props.app.history = this.props.history
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
            <Route exact path="/" render={() => <CustomRedirecter><Profile /></CustomRedirecter>} />
            <Route path="/profile" render={() => <CustomRedirecter><Profile/></CustomRedirecter>} />
            <Route path={'/login'} component={Login} />
            <Route exact path="/myprojects" render={() => <CustomRedirecter><MyProjects/></CustomRedirecter>} />
            <Route exact path="/projects" render={() => <CustomRedirecter><AllProjects/></CustomRedirecter>} />
            <Route exact path="/myarticles" render={() => <CustomRedirecter><MyArticles/></CustomRedirecter>} />
            <Route exact path="/articles" render={() => <CustomRedirecter><AllArticles/></CustomRedirecter>} />
            <Route path="/myprojects/create" render={() => <CustomRedirecter><CreateProject/></CustomRedirecter>} />
            <Route exact path={'/projects/:id'} render={() => <CustomRedirecter><Project/></CustomRedirecter>} />
            <Route path={'/projects/:id/requests'} render={() => <CustomRedirecter><ProjectRequests/></CustomRedirecter>} />
            <Route path={'/projects/:id/members'} render={() => <CustomRedirecter><ProjectMembers/></CustomRedirecter>} />
            <Route path="/myarticles/create" render={() => <CustomRedirecter><CreateArticle/></CustomRedirecter>} />
            <Route path="/about" component={About} />
            <DevTools/>
          </Content>
        </Layout>
      </Layout>
    )
  }
}