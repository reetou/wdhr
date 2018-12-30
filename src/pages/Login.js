import React from 'react'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import {
  Button,
} from 'antd';

@inject('app', 'auth')
@withRouter
@observer
export default class Login extends React.Component {

  async componentDidMount() {
    const result = await this.props.auth.initLogin()
    if (result) await this.props.history.push('/profile')
  }

  render() {
    const app = this.props.app
    const auth = this.props
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 240 }}>
        <div style={{ height: 40 }}>
          <h2>{auth.loading ? 'Гружу...' : 'Ты не вошел!'}</h2>
          { this.props.auth.error ? <h4 style={{ color: 'red' }}>{this.props.auth.error}</h4> : null }
          <Button onClick={() => window.location.href = `${app.API_HOST}/api/auth/github`}>Войти через github</Button>
        </div>
      </div>
    )
  }
}