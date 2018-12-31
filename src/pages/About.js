import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'

@inject('app')
@observer
export default class About extends React.Component {

  render() {
    const app = this.props.app
    return (
      <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
        Что такое WDH?
        <ul style={{
          marginTop: 20,
        }}>
          {
            app.rules.map((r, i) => <li key={i}>{r}</li>)
          }
        </ul>
      </div>
    )
  }
}