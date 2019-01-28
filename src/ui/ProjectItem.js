import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Button, Checkbox, List, Avatar, Spin,
} from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import * as _ from 'lodash'

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
    this.props.history.push(`/projects/${project.project_id}`)
  }

  render() {
    const { app, auth, project, actions, item } = this.props

    const stackItems = item.techs && app.TECHS.length ? item.techs.map(i => app.TECHS[i].name).join(', ') : ''
    const stack = stackItems.length > 59 ? `${stackItems.substring(0, 59)}...` : stackItems

    return (
      <List.Item
        key={item.id}
        actions={actions}
      >
        <List.Item.Meta
          avatar={<Avatar src={item.avatar_url || 'https://i.imgur.com/1J24uLB.png'} />}
          title={<React.Fragment>
            { item.repository_id && <Icon onClick={() => this.goToProject(item)} style={{ marginRight: 5, cursor: 'pointer' }} type={'github'} /> }
            <a onClick={() => this.goToProject(item)}>{item.project_name}</a>
          </React.Fragment>}
          description={stack}
        />
        <div>{item.title.substring(0, 100)}...</div>
      </List.Item>
    )
  }
}