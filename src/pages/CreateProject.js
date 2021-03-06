import React from 'react'
import { observer, inject } from 'mobx-react'
import CreateProjectForm from '../ui/CreateProjectForm'
import { Link, withRouter } from 'react-router-dom'
import {
  Layout, Button, Icon
} from 'antd'
import BookAppearAnimation from "../ui/BookAppearAnimation"
import * as _ from 'lodash'
@inject('auth', 'project')
@withRouter
@observer
export default class CreateProject extends React.Component {

  render() {
    const { auth, project, history } = this.props
    return (
      <Layout style={{ backgroundColor: '#fff', padding: 24 }}>
        { !project.creating ? <div style={{ display: 'flex', marginBottom: 15, alignItems: 'center' }}>
          <Icon onClick={() => history.push('/myprojects')} type="left-square" theme="twoTone" style={{ fontSize: 24, width: 25, marginRight: 10, cursor: 'pointer' }} />
          <h2 style={{ marginBottom: 0 }}>Создаем проект</h2>
        </div> : null}
        { auth.error && <h4 style={{ color: 'red' }}>{auth.error}</h4> }
        <CreateProjectForm/>
      </Layout>
    )
  }
}
