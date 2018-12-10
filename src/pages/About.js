import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import Sider from '../ui/Sider'
import {
  Layout, Menu, Breadcrumb, Icon, Button
} from 'antd';

@inject('app')
@observer
export default class About extends React.Component {

  render() {
    const app = this.props.app
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        Что такое WDH?
      </div>
    )
  }
}