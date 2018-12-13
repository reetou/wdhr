import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Layout, Menu, Breadcrumb, Icon, Button
} from 'antd';
import { withRouter } from 'react-router-dom'

@inject('app', 'auth')
@withRouter
@observer
export default class Profile extends React.Component {

  async componentDidMount() {
    this.props.app.header = 'Профиль'
    if (!this.props.app.axios) await this.props.auth.initAxios()
    const result = await this.props.auth.initLoginFromStorage()
    if (result) await this.props.history.push('/profile')
  }

  render() {
    const app = this.props.app
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        Профиль
      </div>
    )
  }
}