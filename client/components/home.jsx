import React from 'react'

import '../styles/home.css'
const Home = () => {

    const createRoom = () => {
        window.location.href = '/room'
    }

    return(
        <div className="homePage">
            <div className="container">
                <h1>WebRTC Demo</h1>
                <img src="../images/Logo.svg" alt="" className="logo" />
                <div className="ctaContainer">
                    <button className="createRoom" onClick={createRoom}>
                        Create New Room
                    </button>
                    <button className="joinRoom">
                        Join a Room
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home