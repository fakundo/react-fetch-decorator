import { Component, createElement, forwardRef } from 'react'
import { Action } from './Action'

export * from './Action'

export default <RefType = any, PropsType = any>
  (mapActionsToProps, { abortPendingOnUnmount = true } = {}) => (WrappedComponent) => {
    class ReactFetchHoc extends Component<{ fetchHocRef: any }> {
      actionKeys: string[]
      actions: { [key: string]: Action }

      constructor(props) {
        super(props)

        const actions = typeof mapActionsToProps === 'function'
          ? mapActionsToProps(props)
          : mapActionsToProps

        this.actionKeys = Object.keys(actions)

        this.actions = this.actionKeys.reduce((acc, key) => {
          acc[key] = new Action(actions[key], this.handleStatusUpdate)
          return acc
        }, {})

        this.state = this.calculateState()
      }

      componentWillUnmount() {
        this.actionKeys.forEach((key) => {
          this.actions[key].updateKey()
          if (abortPendingOnUnmount) {
            this.actions[key].abort()
          }
        })
      }

      calculateState = () => (
        this.actionKeys.reduce((acc, key) => {
          acc[key] = this.actions[key].getState()
          return acc
        }, {})
      )

      handleStatusUpdate = (updateComponent) => {
        const nextState = this.calculateState()
        if (updateComponent) {
          this.setState(nextState)
        } else {
          this.state = { ...nextState }
        }
      }

      render() {
        const { fetchHocRef, ...rest } = this.props
        return createElement(WrappedComponent, {
          ...rest,
          ...this.state,
          ref: fetchHocRef,
        })
      }
    }

    return forwardRef<RefType, PropsType>((props, ref) => (
      createElement(ReactFetchHoc, { ...props, fetchHocRef: ref })
    ))
  }
