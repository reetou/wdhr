import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Button, Checkbox, List, Avatar, Spin,
} from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
const _ = require('lodash')

const IconText = ({ type, text, rated, onClick }) => (
  <span style={rated ? { color: 'green' } : {}} onClick={onClick}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class ProjectItem extends React.Component {

  goToProject = project => {
    this.props.project.currentProject = project
    this.props.history.push(`/projects/${project.id}`)
  }

  render() {
    const { app, auth, project, actions, item } = this.props

    const stackItems = item.techs ? item.techs.map(i => app.TECHS[i].name).join(', ') : ''
    const stack = stackItems.length > 59 ? `${stackItems.substring(0, 59)}...` : stackItems

    return (
      <List.Item
        key={item.id}
        actions={actions}
      >
        <List.Item.Meta
          avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
          title={<a onClick={() => this.goToProject(item)}>{item.name}</a>}
          description={stack}
        />
        <div>{item.title.substring(0, 100)}...</div>
      </List.Item>
    )
  }
}