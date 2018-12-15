import React from 'react'
import { observer, inject } from 'mobx-react'
import {
  Layout, Menu, Breadcrumb, Icon, Button
} from 'antd';
import { Link } from "react-router-dom"
import BookAppearAnimation from "./BookAppearAnimation"
import BookOpenAnimation from "./BookOpenAnimation"
const {
  Sider,
} = Layout;


@inject('app', 'auth')
@observer
export default class UISider extends React.Component {
  render() {
    const app = this.props.app
    const auth = this.props.auth
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={app.collapsed}
        breakpoint="sm"
        collapsedWidth="50"
        onBreakpoint={(broken) => { console.log(broken); }}
        onCollapse={(collapsed, type) => app.collapsed = collapsed}
      >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key={'1'} className={'menu-item-collapsed'}>
            <Link to={'/profile'} onClick={() => this.props.app.header = 'Профиль'}>
              <Icon type="user" /><span>Профиль</span>
            </Link>
          </Menu.Item>
          {
            auth.loggedIn ?
              <Menu.Item key="2" className={'menu-item-collapsed'}>
                <Link to={'/myprojects'} onClick={() => this.props.app.header = 'Мои проекты'}>
                  <Icon type="desktop" />
                  <span>Мои проекты</span>
                </Link>
              </Menu.Item> : null
          }
          {
            auth.loggedIn ?
              <Menu.Item key="3" className={'menu-item-collapsed'}>
                <Link to={'/projects'} onClick={() => this.props.app.header = 'Все проекты'}>
                  <Icon type="pie-chart" />
                  <span>Проекты</span>
                </Link>
              </Menu.Item> : null
          }
          {
            auth.loggedIn ?
              <Menu.Item key="4" className={'menu-item-collapsed'}>
                <Link to={'/myarticles'} onClick={() => this.props.app.header = 'Мои статьи'}>
                  <Icon type="desktop" />
                  <span>Мои статьи</span>
                </Link>
              </Menu.Item> : null
          }
          {
            auth.loggedIn ?
              <Menu.Item key="5" className={'menu-item-collapsed'}>
                <Link to={'/articles'} onClick={() => this.props.app.header = 'Все статьи'}>
                  <Icon type="pie-chart" />
                  <span>Статьи</span>
                </Link>
              </Menu.Item> : null
          }
          <Menu.Item key="6" className={'menu-item-collapsed'}>
            <Link to={'/about'} onClick={() => this.props.app.header = 'Эбаут'}>
              <Icon type="file" />
              <span>Про WDH</span>
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
    )
  }
}