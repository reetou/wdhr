import React from 'react'
import { observable, toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar, Row, Col
} from 'antd';
import RequestParticipationFormDrawer from "../ui/RequestParticipationFormDrawer"
import ProjectRequestCard from "../ui/ProjectRequestCard"
const _ = require('lodash')

@inject('app', 'auth', 'project')
@withRouter
@observer
export default class ProjectRequests extends React.Component {

  componentDidMount() {
    const project = this.props.project
    const projectId = _.at(this.props, 'match.params.id')[0]
    if (_.isNaN(Number(projectId)) || Number(projectId) === 0) {
      return this.props.history.push('/myprojects')
    }
    if (_.isEmpty(toJS(project.currentProject))) project.loadProject(projectId, updatedProject => {
      if (!updatedProject.owner) {
        console.log(`Not owner??`, updatedProject.owner)
        this.props.history.push(`/projects/${projectId}`)
      }
    })
  }

  render() {
    const { app, auth, project } = this.props
    const proj = project.currentProject
    if (project.loading) return <h1>Loading</h1>
    console.log(`has requests and no length`, toJS(proj.participation_requests), `has: ${_.has(toJS(proj.participation_requests))}`)
    if (proj.participation_requests && !proj.participation_requests.length) {
      console.log(`No requests`)
      return (
        <div
          style={{
            padding: 24,
            background: '#fff',
          }}
        >
          <Row>
            <Col xs={24} md={4}>
              <Button style={{ marginRight: 10 }} onClick={() => this.props.history.push(`/projects/${proj.id}`)}>
                Назад
              </Button>
            </Col>
            <Col xs={24} md={20}><h1 style={{ margin: 0 }}>Заявки на участие в проекте {proj.name}</h1></Col>
          </Row>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 320,
            }}
          >
            <h1>Заявок пока нет :C</h1>
          </div>
        </div>
      )
    }
    console.log(`Has requests`, toJS(proj))
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>Заявки проекта {proj.name}</h1>
        {
          proj.participation_requests && proj.participation_requests.map(req => (
            <ProjectRequestCard request={req} />
          ))
        }
      </div>
    )
  }
}