import React, { useEffect, useRef, useState } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import RTConnection from '../webRTCSocket/socket'

import '../styles/room.css'
const Room = () => {
    useEffect(() => {
        const Connection = new RTConnection()
        Connection.init(window.ROOM_ID,videoElemRef)
    }, [])

    const videoElemRef = useRef()

    const [open, setOpen] = useState(false)

    const copyCode = () => {
        navigator.clipboard.writeText(window.ROOM_ID)
        .then(() => {
            setOpen(true)
        })
    }

    return (
        <div className="roomContainer">
            <div className="info">
                Copy and share this code to invite other people
            </div>
            <div className="copyRoomId" onClick={copyCode}>
                {window.ROOM_ID}
                <img src="../images/copy.svg" alt="" className="copyIcon" />
            </div>
            <div ref={videoElemRef} className="videoContainer">
        
            </div>
            <Snackbar
                message={"Room Code Copied to clipboard"}
                autoHideDuration={4000}
                open={open}
                onClose={() => setOpen(false)}
            />
        </div>
    )
}

export default Room