import React from 'react'
import { observer, inject } from 'mobx-react'
import CreateProjectForm from '../ui/CreateProjectForm'
import { CSSTransitionGroup, TransitionGroup } from 'react-transition-group'
import {
  Layout
} from 'antd'
import BookAppearAnimation from "../ui/BookAppearAnimation"
const _ = require('lodash')
@inject('auth', 'project')
@observer
export default class CreateProject extends React.Component {

  render() {
    const { auth, project } = this.props
    return (
      <Layout style={{ backgroundColor: '#fff', padding: 24 }}>
        { !project.creating && <h2>Создаем проект</h2>}
        { auth.error && <h4 style={{ color: 'red' }}>{auth.error}</h4> }
        <CSSTransitionGroup
          transitionName="example"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnter={false}
          transitionLeave={false}>
          <CreateProjectForm/>
        </CSSTransitionGroup>
      </Layout>
    )
  }
}
