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
class Login extends React.Component {

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
    if (!this.props.app.axios) await this.props.auth.initAxios()
    const result = await this.props.auth.initLoginFromStorage()
    if (result) await this.props.history.push('/profile')
  }

  render() {
    const app = this.props.app
    const auth = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 240 }}>
        <div style={{ height: 40 }}>
          <h2>{auth.loading ? 'Гружу...' : 'Ты не вошел!'}</h2>
          { this.props.auth.error ? <h4 style={{ color: 'red' }}>{this.props.auth.error}</h4> : null }
          <Form onSubmit={this.submit} className="login-form" layout={'inline'}>
            <FormItem>
              {getFieldDecorator('login', {
                rules: [
                  { required: true, message: 'Юзернейм должен быть введен' },
                  { max: 15, message: 'Не больше 15 символов' },
                  { whitespace: true, message: 'Без пробелов' }
                ],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Логин" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Поле пароля пустое' },
                  { max: 40, message: 'Не больше 40 символов' },
                  { whitespace: true, message: 'Без пробелов' }
                ],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Пароль" />
              )}
            </FormItem>
            <FormItem>
              <Button disabled={this.props.auth.loading} type="primary" htmlType="submit" className="login-form-button" style={{ marginRight: 10 }}>
                Войти
              </Button>
              Или <Link to={'/register'} onClick={() => app.header = 'Регистрация'}>зарегаться</Link>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(Login);
export default WrappedNormalLoginForm
