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
class Register extends React.Component {

  timeout

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
      await this.props.auth.register(data)
      await this.props.history.push('/profile')
    } catch (e) {
      const validationErr = _.at(e, 'response.data.err')[0]
      console.log('validation err', validationErr)
      if (validationErr) {
        this.props.auth.error = validationErr
        this.timeout = setTimeout(() => this.props.auth.error = '', 2500)
      }
      console.log('Error', e, e.response)
      // noop
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  async componentDidMount() {
    const result = await this.props.auth.initLogin()
    if (result) await this.props.history.push('/profile')
  }

  render() {
    const app = this.props.app
    const auth = this.props.auth
    const { getFieldDecorator } = this.props.form
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 460 }}>
        <h2>{auth.loading ? 'Гружу' : 'Позже будет регистрация через гитхаб, а пока терпите'}</h2>
        { auth.error ? <h4 style={{ color: 'red' }}>{auth.error}</h4> : null }
        <div style={{ height: 40 }}>
          <Form onSubmit={this.submit} className="login-form" layout={'vertical'}>
            <FormItem>
              {getFieldDecorator('nickname', {
                rules: [
                  { required: true, message: 'Поле пароля пустое' },
                  { max: 15, message: 'Не больше 40 символов' },
                  { whitespace: true, message: 'Без пробелов' }
                ],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Никнейм (будет виден другим)" />
              )}
            </FormItem>
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
                Зарегаться
              </Button>
              Или <Link to={'/'} onClick={() => app.header = 'Вход'}>войти</Link>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

const WrappedNormalLoginForm = Form.create()(Register);
export default WrappedNormalLoginForm
