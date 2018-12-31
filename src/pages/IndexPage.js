import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import { withRouter, Link } from 'react-router-dom'
import { Link as ScrollLink, Element as ScrollElement } from 'react-scroll'
import RiderAnimation from "../ui/RiderAnimation"
import { Button } from "antd"

@inject('app', 'auth', 'article', 'project')
@withRouter
@observer
export default class IndexPage extends React.Component {

  render() {
    const headStyle = {
      color: 'white'
    }
    const { auth, app, project, article } = this.props
    return (
      <div style={{ background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ height: '100vh', width: '100%', padding: '0 10px' }}>
          <p style={{ color: 'gray', marginBottom: 0 }}>WDH презентс</p>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <h1 style={{ ...headStyle, textAlign: 'center', fontSize: 44 }}>KOKORO.CODES</h1>
            <h2 style={headStyle}>Вкатываемся в JS вместе</h2>
            <h2 style={headStyle}>Выкладываем поделки</h2>
            <h2 style={headStyle}>Помогаем не потеряться</h2>
            <Button style={{ width: 340 }}><ScrollLink to={'start'} smooth={true} duration={600}>Начать</ScrollLink></Button>
          </div>
        </div>
        <div style={{ minHeight: '100vh' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <ScrollElement name={'start'}>
              <h2 style={headStyle}>Начни с регистрации на <a href={'https://github.com/join'} target={'_blank'}>гитхабе</a></h2>
              <h2 style={headStyle}>Или <Link to={'/login'}>залогинись</Link>, если ты уже.</h2>
              <Button style={{ width: 340 }}><ScrollLink to={'rules'} smooth={true} duration={600}>Заповеди бывалых</ScrollLink></Button>
            </ScrollElement>
          </div>
          <RiderAnimation />
        </div>
        <div style={{ minHeight: '100vh', paddingTop: 50, paddingLeft: 30 }}>
          <ScrollElement name={'rules'}>
            {
              app.rules.map((r, i) => <h3 style={headStyle}>{i + 1}. {r}</h3>)
            }
          </ScrollElement>
        </div>
      </div>
    )
  }
}