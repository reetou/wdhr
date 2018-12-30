import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import RiderAnimation from "../ui/RiderAnimation"

@inject('app', 'auth', 'article', 'project')
@withRouter
@observer
export default class IndexPage extends React.Component {

  render() {
    const { auth, app, project, article } = this.props
    return (
      <div style={{ background: '#fff', height: '100%' }}>
        <h1>MainPage</h1>
        <RiderAnimation/>
      </div>
    )
  }
}