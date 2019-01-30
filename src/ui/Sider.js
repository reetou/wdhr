import React from 'react'
import { observer, inject } from 'mobx-react'
import {
  Layout, Menu, Icon
} from 'antd';
import { Link } from "react-router-dom"
const {
  Sider,
} = Layout;


@inject('app', 'auth')
@observer
export default class UISider extends React.Component {
  render() {
    const app = this.props.app
    const auth = this.props.auth
    const itemClassname = app.collapsed ? 'menu-item-collapsed' : ''
    return (
      <Sider
        trigger={null}
        collapsible={this.props.collapsible}
        collapsed={this.props.collapsed}
        breakpoint="sm"
        onBreakpoint={(broken) => { console.log(broken); }}
        onCollapse={(collapsed, type) => app.collapsed = collapsed}
      >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key={'1'} className={itemClassname}>
            <Link to={'/profile'} onClick={() => this.props.app.header = 'Профиль'}>
              <Icon type="user" /><span>Профиль</span>
            </Link>
          </Menu.Item>
          {
            auth.loggedIn ?
              <Menu.Item key="2" className={itemClassname}>
                <Link to={'/myprojects'} onClick={() => this.props.app.header = 'Мои проекты'}>
                  <Icon type="desktop" />
                  <span>Мои проекты</span>
                </Link>
              </Menu.Item> : null
          }
          {
            auth.loggedIn ?
              <Menu.Item key="3" className={itemClassname}>
                <Link to={'/projects'} onClick={() => this.props.app.header = 'Все проекты'}>
                  <Icon type="pie-chart" />
                  <span>Проекты</span>
                </Link>
              </Menu.Item> : null
          }
          <Menu.Item key="6" className={itemClassname}>
            <Link to={'/about'} onClick={() => this.props.app.header = 'Эбаут'}>
              <Icon type="file" />
              <span>Про WDH</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="7" className={itemClassname}>
            <a href={'https://github.com/reetou/wdhr'} target={'_blank'}>
              <Icon type="github" />
              <span>Исходники</span>
            </a>
          </Menu.Item>
        </Menu>
      </Sider>
    )
  }
}