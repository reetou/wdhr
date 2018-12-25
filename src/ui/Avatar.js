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
    const fallback = this.props.fallback || ''
    const url = typeof this.props.url === 'string' ? this.props.url || fallback : auth.user.avatar_url
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, ...this.props.style }}>
        <Avatar shape={'square'} src={url} size={this.props.size || 150} />
      </div>
    )
  }
}