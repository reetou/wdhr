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
import { withRouter } from "react-router-dom"

@inject('app', 'auth', 'project', 'article')
@withRouter
@observer
export default class MainPage extends React.Component {

  async componentDidMount() {
    this.props.app.history = this.props.history
    await this.props.auth.initAxios()
    console.log('PROJECT PROP', this.props.project)
    await this.props.project.loadUserProjects()
    await this.props.article.loadUserArticles()
  }

  render() {
    const app = this.props.app
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
              className="trigger"
              type={app.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={() => app.collapsed = !app.collapsed}
            />
            <span style={{ marginLeft: 10 }}>{app.header}</span>
          </Header>
          <Content style={{ margin: '16px 16px 0 16px' }}>
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    )
  }
}