import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Row, Card, Col
} from 'antd'
import { withRouter } from 'react-router-dom'
const _ = require('lodash')

export default class ProjectRequestCard extends React.Component {

  render() {
    const { request } = this.props
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>От {request.login}</h1>
        <h2>Должность: {request.position}</h2>
        <p>{request.comment}</p>
      </div>
    )
  }
}