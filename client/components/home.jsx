import React, { useState } from 'react'

import '../styles/home.css'
const Home = () => {

    const [openRoomInput, setOpenRoomInput] = useState(false)

    const createRoom = () => {
        window.location.href = '/room'
    }

    return(
        <div className="homePage">
            <div className="container">
                <h1>Meet Up</h1>
                <div className="ctaContainer">
                    <button className="createRoom" onClick={createRoom}>
                        Create New Room
                    </button>
                    { !openRoomInput ?
                        <button className="joinRoom" onClick={() => setOpenRoomInput(true)}>
                            Join a Room
                        </button>
                        :
                        <>
                            <div className="inputContainer">
                                <input type="text" placeholder="Enter Link Here" className="input" />
                            </div>
                            <img src="../images/close.svg" alt="" className="closeIcon" onClick={() => setOpenRoomInput(false)}/>
                        </>
                    }
                </div>
                <div className="descriptionHolder">
                    Create rooms and <span className="highlight">Meet Up</span> with your friends
                </div>
            </div>
            <img src="../images/Logo.svg" alt="" className="homeLogo" />
        </div>
    )
}

export default Home