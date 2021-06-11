import React, { useEffect, useRef, useState } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import RTConnection from '../webRTCSocket/socket'

import '../styles/room.css'
const Room = () => {
    useEffect( async () => {
        const Connection = new RTConnection()
        await Connection.init(window.ROOM_ID, videoElemRef)
        setConnection(Connection)
    }, [])

    const videoElemRef = useRef()

    const [open, setOpen] = useState(false)
    const [showCallRoom, setShowCallRoom] = useState(true)
    const [connection, setConnection] = useState(null)

    const copyCode = () => {
        navigator.clipboard.writeText(window.ROOM_ID)
        .then(() => {
            setOpen(true)
        })
    }

    const cutCall = () => {
        connection.leaveCall()
        setShowCallRoom(false)
    }

    return (
        <div className="roomContainer">
            {
                ( showCallRoom ?
                    <>
                        <div className="info">
                            Copy and share this code to invite other people
                        </div>
                        <div className="copyRoomId" onClick={copyCode}>
                            {window.ROOM_ID}
                            <img src="../images/copy.svg" alt="" className="copyIcon" />
                        </div>
                        <div ref={videoElemRef} className="videoContainer"></div>
                        <div className="ctaContainer">
                            <img src="../images/end_call.svg" alt="" className="endCall" onClick={cutCall} />
                        </div>
                        <Snackbar
                            message={"Room Code Copied to clipboard"}
                            autoHideDuration={4000}
                            open={open}
                            onClose={() => setOpen(false)}
                        />
                    </>
                    :
                    <div className="thankYou">
                        You left the call.
                    </div>
                )
            }
        </div>
    )
}

export default Room