import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Chat() {
  const { roomId } = useParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const userId = useRef(Math.random().toString(36).substr(2, 6)).current

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) setError('Error loading messages: ' + error.message)
      if (data) setMessages(data)
    }

    fetchMessages()

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    setError('')
    if (!newMessage && !file) return

    let fileUrl = ''
    if (file) {
      try {
        setUploading(true)
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
        const { data, error: uploadError } = await supabase.storage
          .from('files')
          .upload(`${roomId}/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(data.path)

        fileUrl = urlData.publicUrl
      } catch (err) {
        setError('File upload failed: ' + err.message)
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    }

    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert([{
          room_id: roomId,
          text: newMessage,
          file: fileUrl,
          user_id: userId,
          created_at: new Date().toISOString()
        }])

      if (insertError) throw insertError
      
      setNewMessage('')
      setFile(null)
    } catch (err) {
      setError('Message send failed: ' + err.message)
    }
  }

  return (
    <div className="chat">
      <div className="header">
        <h2>Room: {roomId}</h2>
        <p>Your ID: {userId}</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="meta">
              <span className="user">{msg.user_id}</span>
              <span className="time">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
            {msg.text && <p>{msg.text}</p>}
            {msg.file && (
              <a
                href={msg.file}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
              >
                📎 {msg.file.split('/').pop()}
              </a>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-area">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message..."
          disabled={uploading}
        />
        <label className="file-input">
          {uploading ? '⏳' : '📎'}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
          />
        </label>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Send'}
        </button>
      </form>
    </div>
  )
}