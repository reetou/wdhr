import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Row, Card, Col
} from 'antd'
import { withRouter } from 'react-router-dom'
import UIAvatar from "../ui/Avatar"
import ProfileStats from "../ui/ProfileStats"

@inject('app', 'auth', 'article', 'project')
@withRouter
@observer
export default class Profile extends React.Component {

  async componentDidMount() {
    this.props.app.header = 'Профиль'
   const result = await this.props.auth.initLogin()
    if (result) await this.props.history.push('/profile')
  }

  render() {
    const { auth, app, project, article } = this.props
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        <Row>
          <Col xs={24} sm={16} style={{ fontSize: 22, paddingLeft: 30 }}>
            <p>Юзернейм: {auth.user.login}</p>
            <p>На гитхабе с {new Date(auth.user.github_register_date).toLocaleDateString()}</p>
          </Col>
          <Col xs={{ span: 24, textAlign: 'center' }} sm={8}><UIAvatar /></Col>
        </Row>
        <ProfileStats/>
      </div>
    )
  }
}