import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, observer } from 'mobx-react'
import { observable } from 'mobx'
import createStores from './stores'
import './style.scss'
import { Button, Input, message, Radio, Select } from "antd"
const RadioGroup = Radio.Group;
const Option = Select.Option;

const stores = createStores()

@observer
class ThemeDisplayer extends React.Component {
  @observable value = 1

  componentDidMount() {
    [
      t => message.success(<span>`Success message`</span>, t),
      t => message.error(<span>`Error message`</span>, t),
      t => message.info(<span>`info message`</span>, t),
      t => message.loading(<span>`loading message`</span>, t),
      t => message.warning(<span>`warning message`</span>, t),
    ].forEach((f, i) => {
      // setTimeout(() => f(i + 1), i * 2000)
    })
  }

  render() {
    const children = [];
    for (let i = 10; i < 36; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: 'white' }}>Configure wdhr ant.design theme</h1>
        <div style={{ display: 'flex', flexDirection: 'column', width: 800, alignItems: 'center' }}>
          <Button type={'primary'}>Primary button</Button>
          <Button type={'secondary'}>Secondary button</Button>
          <a href={'/someshit'}>Link</a>
          <p>Text</p>
          <Input value={'TextValue'} id={'inputVal'} defaultValue={''} disabled={false} type={'text'}/>
          <Input value={'Disabled text value'} id={'inputVal'} defaultValue={''} disabled={true} type={'text'}/>
          <RadioGroup onChange={e => this.value = e.target.value} value={this.value}>
            <Radio value={1}>A</Radio>
            <Radio value={2}>B</Radio>
            <Radio value={3}>C</Radio>
            <Radio value={4}>D</Radio>
          </RadioGroup>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select"
            defaultValue={['a10', 'c12']}
            onChange={v => console.log(`Select value`, v)}
          >
            {children}
          </Select>
          <Select defaultValue="lucy" style={{ width: 120 }} onChange={v => console.log(`Select value`, v)}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="disabled" disabled>Disabled</Option>
            <Option value="Yiminghe">yiminghe</Option>
          </Select>
          <Select defaultValue="lucy" style={{ width: 120 }} disabled>
            <Option value="lucy">Lucy</Option>
          </Select>
          <Select defaultValue="lucy" style={{ width: 120 }} loading>
            <Option value="lucy">Lucy</Option>
          </Select>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <Provider {...stores}>
    <ThemeDisplayer/>
  </Provider>,
  document.getElementById('app')
)