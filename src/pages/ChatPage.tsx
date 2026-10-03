import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'

export default function ChatPage() {
  const { user } = useAuth()// Get the current user
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [activeEvent, setActiveEvent] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')

// 1. Load the events the user has signed up for
  useEffect(() => {
    if (!user) return

    async function loadMyEvents() {
      const { data } = await supabase
        .from('rsvps')
        .select('event_id, events(id, title)')
        .eq('user_id', user.id)
      
      if (data) {
        // Remove unnecessary nesting from the data
        const formattedEvents = data.map((item: any) => item.events)
        setMyEvents(formattedEvents)
      }
    }
    loadMyEvents()
  }, [user])

  // 2. Load message history and listen for new messages in real time
  useEffect(() => {
    if (!activeEvent) return

    // Loading old messages
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('event_id', activeEvent.id)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    loadMessages()

    // Subscription to new messages (Realtime)
    const channel = supabase
      .channel(`chat-${activeEvent.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${activeEvent.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeEvent])

  // 3. Sending the message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeEvent) return

    const { error } = await supabase
      .from('messages')
      .insert([{ event_id: activeEvent.id, user_id: user.id, content: newMessage }])

    if (!error) setNewMessage('')
  }

  if (!user) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5">Zaloguj się, aby korzystać z czatu.</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Czaty 💬</Typography>
      
      <Box sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}>
        {/* Left panel: List of chats (events) */}
        <Paper sx={{ width: '30%', overflowY: 'auto' }}>
          <List>
            {myEvents.length === 0 && (
              <Typography sx={{ p: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
                Nie jesteś zapisany na żadne wydarzenia.
              </Typography>
            )}
            {myEvents.map((ev) => (
              <ListItemButton 
                key={ev.id} 
                selected={activeEvent?.id === ev.id}
                onClick={() => setActiveEvent(ev)}
              >
                <ListItemText primary={ev.title} slotProps={{ primary: { noWrap: true } }} />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Right panel: Conversation window */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'grey.50' }}>
          {activeEvent ? (
            <>
              {/* Сообщения */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg) => {
                  const isMe = msg.user_id === user.id
                  return (
                    <Box key={msg.id} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <Paper sx={{ p: 1.5, bgcolor: isMe ? 'primary.light' : 'white', color: isMe ? 'white' : 'black', borderRadius: 2 }}>
                        <Typography variant="body2">{msg.content}</Typography>
                      </Paper>
                    </Box>
                  )
                })}
              </Box>
              
              {/* Input field */}
              <Box component="form" onSubmit={sendMessage} sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="Napisz wiadomość..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                />
                <Button type="submit" variant="contained">Wyślij</Button>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Wybierz czat z listy po lewej</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  )
}