import React from 'react'
import ReactDOM from 'react-dom'

import HomePage from './components/home.jsx'



if(window.mountHome) {
    ReactDOM.render(
        <HomePage />,
        window.mountHome
    )
}