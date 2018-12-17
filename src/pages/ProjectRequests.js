import React from 'react'
import { observable, toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Input, Checkbox, Button, List, Spin, Avatar, Row, Col, Modal, Radio
} from 'antd';
const _ = require('lodash')
const RadioGroup = Radio.Group;


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
    if (proj.participation_requests && !proj.participation_requests.length) {
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
    const requestDecisionResult = item => {
      switch (project.requestDecision[item.login]) {
        case 'ACCEPTED': return [<div>Одобрено</div>]
        case 'DENIED': return [<div>Отклонено</div>]
        default: return [
          <Button onClick={() => project.acceptParticipationRequest(proj.id, item.login, () => this.forceUpdate())}>Принять</Button>,
          <Button onClick={() => project.initDenyReason(item.login)}>Отклонить</Button>,
          <div>{new Date(item.date).toLocaleDateString()}</div>
        ]
      }
    }
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h1>Заявки проекта {proj.name}</h1>
        <List
          itemLayout="vertical"
          size="large"
          dataSource={proj.participation_requests}
          renderItem={item => (
            <List.Item
              key={item.title}
              actions={requestDecisionResult(item)}
            >
              <List.Item.Meta
                avatar={<Avatar shape={'square'} size={'large'} src={item.avatar_url} />}
                title={`${item.login} претендует на позицию ${item.position}`}
                description={item.comment}
              />
              <p>Связаться со мной: @{item.contacts.telegram}</p>
            </List.Item>
          )}
        />
        <Modal
          title="Отказать в реквесте на участие"
          visible={project.showDenyReasonForm}
          onOk={() => project.denyParticipationRequest(project.currentProject.id)}
          confirmLoading={project.requestLoading}
          onCancel={project.resetDenyReason}
        >
          <p>
            Хочешь указать причину отказа? Это необязательно, но если укажешь, реквестеру будет понятно, почему ты принял такое решение.
          </p>
          <RadioGroup value={project.denyReason} onChange={e => project.denyReason = e.target.value} >
            {
              project.DENY_REASONS.map((v, i) => (
                <Radio style={radioStyle} key={i} value={i}>{v}</Radio>
              ))
            }
          </RadioGroup>
        </Modal>
      </div>
    )
  }
}