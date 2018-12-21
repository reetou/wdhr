import React from 'react'
import { observable, toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar, Row, Col, Modal, Radio
} from 'antd';
const _ = require('lodash')

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class ProjectMembers extends React.Component {
  componentDidMount() {
    const project = this.props.project
    const projectId = _.at(this.props, 'match.params.id')[0]
    if (_.isNaN(Number(projectId)) || Number(projectId) === 0) {
      return this.props.history.push('/myprojects')
    }
    console.log(`Empty?`, _.isEmpty(toJS(project.currentProject)), project.currentProject)
    if (_.isEmpty(toJS(project.currentProject))) project.loadProject(projectId)
  }

  render() {
    const { app, auth, project } = this.props
    const currentProject = project.currentProject
    console.log(`current project`, toJS(currentProject))
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>Участники проекта {currentProject.name}</h1>
        <List.Item.Meta
          avatar={<Avatar shape={'square'} size={'large'} src={project.projectOwner.avatar_url} />}
          title={project.projectOwner.login}
          description={'Owner'}
          style={{ marginBottom: 30 }}
        />
        <List
          itemLayout="vertical"
          size="large"
          dataSource={project.projectMembers}
          renderItem={item => (
            <List.Item
              key={item.title}
              actions={[<p>{`Присоединился ${new Date(item.joined).toLocaleDateString()}`}</p>]}
            >
              <List.Item.Meta
                avatar={<Avatar shape={'square'} size={'large'} src={item.avatar_url} />}
                title={item.login}
                description={item.position}
              />
            </List.Item>
          )}
        />

      </div>
    )
  }
}