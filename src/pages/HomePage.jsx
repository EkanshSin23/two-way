import { useState } from "react"
import { useNavigate } from "react-router-dom"

const HomePage = () => {
    const [roomName, setRoomName] = useState()
    const navigate = useNavigate()
    console.log(roomName)
    return (
        <>
            <h1>Enter Room Name</h1>
            <input onChange={(e) => { setRoomName(e.target.value) }} placeholder="Enter Room Name....." />
            <button onClick={() => navigate(`/two-way/${roomName}`)}>Join</button>
        </>
    )
}
export default HomePage;