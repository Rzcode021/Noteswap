import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') 
  || 'http://localhost:5000'

// ✅ Single socket instance shared across app
let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export const connectSocket = (userId) => {
  const s = getSocket()
  if (!s.connected) {
    s.connect()
    s.emit('join', userId)
  }
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect()
  }
}

