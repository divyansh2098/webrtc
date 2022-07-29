import React from 'react'
import ReactDOM from 'react-dom'
import Room from './components/room.jsx'

if(window.mountRoom) {
    ReactDOM.render(
        <Room roomId={window.ROOMID} />,
        window.mountRoom
    )
}