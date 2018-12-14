import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Form, Icon, Input, Button, Checkbox,
} from 'antd';
const _ = require('lodash')

const FormItem = Form.Item;

@inject('app', 'auth')
@withRouter
@observer
export default class Login extends React.Component {

  validate = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          resolve(values)
        }
        reject(err)
      });
    })
  }

  submit = async e => {
    e.preventDefault()
    try {
      const data = await this.validate()
      await this.props.auth.authorize(data)
      await this.props.history.push('/profile')
    } catch (e) {
      console.log('Err', e)
      const validationErr = _.at(e, 'response.data.err')[0]
      if (validationErr) {
        this.props.auth.error = validationErr
        this.timeout = setTimeout(() => this.props.auth.error = '', 2500)
      }
      // noop
    }
  }

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