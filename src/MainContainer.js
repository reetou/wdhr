import React from 'react'
import { observer, inject } from 'mobx-react'

@inject('app')
@observer
export default class MainContainer extends React.Component {


  render() {
    const app = this.props.app
    return (
      <div>
        <h1>Enroll.Code</h1>
      </div>
    )
  }
}