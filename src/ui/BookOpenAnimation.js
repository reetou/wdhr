import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import {
  Form, Icon, Input, Button, Checkbox, Select, InputNumber, Layout
} from 'antd'
import * as Rx from "rxjs/Rx"
const _ = require('lodash')
const animation = {
  sequence_1: require('../img/animations/book_open/1.png'),
  sequence_2: require('../img/animations/book_open/2.png'),
  sequence_3: require('../img/animations/book_open/3.png'),
  sequence_4: require('../img/animations/book_open/4.png'),
  sequence_5: require('../img/animations/book_open/5.png'),
  sequence_6: require('../img/animations/book_open/6.png'),
  sequence_7: require('../img/animations/book_open/7.png'),
  sequence_8: require('../img/animations/book_open/8.png'),
  sequence_9: require('../img/animations/book_open/9.png'),
  sequence_10: require('../img/animations/book_open/10.png'),
  sequence_11: require('../img/animations/book_open/11.png'),
  sequence_12: require('../img/animations/book_open/12.png'),
  sequence_13: require('../img/animations/book_open/13.png'),
  sequence_14: require('../img/animations/book_open/14.png'),
  sequence_15: require('../img/animations/book_open/15.png'),
  sequence_16: require('../img/animations/book_open/16.png'),
  sequence_17: require('../img/animations/book_open/17.png'),
  sequence_18: require('../img/animations/book_open/18.png'),
  sequence_19: require('../img/animations/book_open/19.png')
}

@inject('app', 'auth')
@observer
export default class BookOpenAnimation extends React.Component {

  @observable x = 0

  componentDidMount() {
    const signal = new Rx.Subject()
    const requestAnimationFrame$ = Rx.Observable
      .defer(() => Rx.Observable
        .timer(0, 90)
        .takeUntil(signal)
        .repeat()
      );

    const reset = () => signal.next()

    requestAnimationFrame$
      .subscribe((i) => {
        const item = i + 1
        if (item >= 20) return reset()
        console.log(`I AT SUBSCRIBE RAVNO ${item}`)
        this.x = item
      });
  }

  render() {
    return (
      <div>
        <img src={animation[`sequence_${this.x}`]} />
      </div>
    )
  }
}