import React from 'react'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Layout, Icon
} from 'antd';
const {
  Header, Content,
} = Layout;
import { Route } from "react-router-dom";
import { withRouter } from "react-router-dom"
import DevTools from 'mobx-react-devtools'
import About from "./About"
import Profile from './Profile'
import Pusher from '../pusher_front'
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
import ProjectUpload from "./ProjectUpload"
import IndexPage from "./IndexPage"

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
    if (auth) {
      await Pusher.init(this.props.auth.user.login, this.props.app.PUSHER_KEY)
    }
    if (auth && !project.userProjects.length) {
      await this.props.project.loadUserProjects()
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
    console.log(`This props shistory`, this.props.history)
    const isOnMain = this.props.history.location.pathname === '/'
    return (
      <Layout style={{ height: '100vh' }}>
        {
          !isOnMain ?
            <Sider
              collapsible={!isOnMain}
              collapsed={isOnMain ? true : app.collapsed}
            /> : null
        }
        <Layout>
          {
            this.props.history.location.pathname !== '/' ?
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
              </Header> : null
          }
          <Content style={{ margin: isOnMain ? 0 : '16px 16px 0 16px' }}>
            <Route exact path="/" render={() => <IndexPage />} />
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
            <Route path={'/projects/:id/upload'} render={() => <CustomRedirecter><ProjectUpload/></CustomRedirecter>} />
            <Route path="/myarticles/create" render={() => <CustomRedirecter><CreateArticle/></CustomRedirecter>} />
            <Route path="/about" component={About} />
            <DevTools/>
          </Content>
        </Layout>
      </Layout>
    )
  }
}