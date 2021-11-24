import * as React from 'react'
import { render } from 'react-dom'
import App from './App'

const element = document.createElement('div')
document.body.appendChild(element)

render(<App />, element)
