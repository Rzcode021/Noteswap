import { useState, useEffect } from 'react'
import { getNotes } from '../services/note.service'

export default function useNotes(params = {}) {
  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await getNotes(params)
        setNotes(res.data.data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { notes, loading, error }
}