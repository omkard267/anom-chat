import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  
  const createRoom = () => {
    const roomId = Math.random().toString(36).substr(2, 9)
    navigate(`/chat/${roomId}`)
  }

  return (
    <div className="home">
      <h1>Anonymous Chat</h1>
      <button onClick={createRoom}>Create New Room</button>
      <div className="join">
        <input placeholder="Enter Room ID" id="roomId" />
        <button onClick={() => navigate(`/chat/${document.getElementById('roomId').value}`)}>
          Join Room
        </button>
      </div>
    </div>
  )
}