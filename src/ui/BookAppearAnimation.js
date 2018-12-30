import React from 'react'
import { observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import * as Rx from "rxjs/Rx"
const animation = {
  sequence_1: require('../img/animations/book_appear/1.png'),
  sequence_2: require('../img/animations/book_appear/2.png'),
  sequence_3: require('../img/animations/book_appear/3.png'),
  sequence_4: require('../img/animations/book_appear/4.png'),
  sequence_5: require('../img/animations/book_appear/5.png'),
  sequence_6: require('../img/animations/book_appear/6.png'),
  sequence_7: require('../img/animations/book_appear/7.png'),
  sequence_8: require('../img/animations/book_appear/8.png'),
  sequence_9: require('../img/animations/book_appear/9.png')
}

@inject('app', 'auth')
@observer
export default class BookAppearAnimation extends React.Component {

  @observable x = 0
  requestAnimationFrame$

  componentDidMount() {
    const signal = new Rx.Subject()
    this.requestAnimationFrame$ = Rx.Observable
      .defer(() => Rx.Observable
        .timer(0, 90)
        .takeUntil(signal)
        .repeat()
      );

    const reset = () => signal.next()

    this.requestAnimationFrame$ = this.requestAnimationFrame$
      .subscribe((i) => {
        const item = i + 1
        if (item >= 10) return reset()
        console.log(`I AT SUBSCRIBE RAVNO ${item}`)
        this.x = item
      });
  }


  componentWillUnmount() {
    if (this.requestAnimationFrame$) this.requestAnimationFrame$.unsubscribe()
  }

  render() {
    return (
      <div>
        <img src={animation[`sequence_${this.x}`]} />
      </div>
    )
  }
}