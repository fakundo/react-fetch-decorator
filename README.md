# react-fetch-decorator

[![npm](https://img.shields.io/npm/v/react-fetch-decorator.svg)](https://www.npmjs.com/package/react-fetch-decorator)

React Higher-Order Component (HOC) for observing and invoking `fetch` requests.

Features:
- can rerender component when request status changes
- can abort requests when unmounting component
- can abort request on second call

### Installation

```
npm i react-fetch-decorator
```

### Demo

[Demo](https://fakundo.github.io/react-fetch-decorator/) 
/ 
[Source](https://github.com/fakundo/react-fetch-decorator/tree/master/examples)

### Usage

```js
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import withActions from 'react-fetch-decorator'

class Dog extends Component {
  static propTypes = {
    fetchDogAction: PropTypes.object.isRequired,
  }

  handleClick = () => {
    const { fetchDogAction } = this.props
    fetchDogAction.run()
  }

  render() {
    const { fetchDogAction } = this.props
    const { isPending, isFailed, isSucceded, error, result } = fetchDogAction
    return (
      <>
        <button onClick={this.handleClick}>
          Random Dog
        </button>

        {isPending && (
          <div>
            Loading...
          </div>
        )}

        {isFailed && (
          <div>
            {error.message}
          </div>
        )}

        {isSucceded && (
          <img src={result.message} />
        )}
      </>
    )
  }
}

const mapActionsToProps = {
  fetchDogAction: async (signal) => {
    const url = 'https://dog.ceo/api/breeds/image/random'
    const response =  await fetch(url, { signal })
    return response.json()
  }
}

export default withActions(mapActionsToProps)(Dog)
```

#### Action `run` method returns a Promise

```js
...

handleClick = async () => {
  const { fetchDogAction } = this.props
  try {
    const dog = await fetchDogAction.run()
    console.log('Fetched dog: ', dog)
  }
  catch (error) {
    console.log('Error occured while fetching a dog: ', error.message)
  }
}

...
```

#### Invoking action with parameters

```js
...

const mapActionsToProps = {
  fetchUserAction: (signal) => async (userId) => {
    const url = `/users/${userId}`
    const response = await fetch(url, { signal })
    return response.json()
  }
}

...

fetchUserAction.run({
  args: [userId]
})

...
```

## API

#### HOC creator params

- `mapActionsToProps = { ... }` - function or object that defines actions. If it's a function then component props will be passed to it.
- `options = { abortPendingOnUnmount: true }`

#### Structure of action object

- `isDefault` - `true` if action never ran
- `isPending` - `true` if action is pending
- `isSucceded` - `true` if action has succeded
- `isFailed` - `true` if action has failed
- `result` - result of action
- `error` - error occured while performing action
- `run(runOptions)` - starts action
- `reset(resetOptions)` - resets action

#### `runOptions`

- `args = []` - arguments will be passed to action
- `silent = false` - disables throwing errors
- `abortPending = true` - aborts previous action if it still running
- `updateComponent = true` - allows to rerender component on status change
- `updateComponentOnPending = undefined`
- `updateComponentOnSuccess = undefined`
- `updateComponentOnFailure = undefined`

#### `resetOptions`

- `abortPending = true` - aborts pending action
- `updateComponent = true` - invokes component rerender
