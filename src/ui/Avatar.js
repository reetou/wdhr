import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import {
  Badge, Avatar
} from 'antd';

@inject('auth')
@observer
export default class UIAvatar extends Component {

  render() {
    const auth = this.props.auth
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Avatar shape={'square'} src={auth.user.avatar_url} size={150} />
      </div>
    )
  }
}