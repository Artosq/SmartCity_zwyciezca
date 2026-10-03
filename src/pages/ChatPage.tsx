import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import GroupIcon from '@mui/icons-material/Group'

// Helper: Get user name
const getSenderName = (profile: any) => {
  if (!profile) return 'Uczestnik'
  return profile.first_name || profile.name || profile.full_name || profile.username || 'Uczestnik'
}

// Helper: Get initials for avatar (e.g., "Kasia" -> "KA")
const getInitials = (name: string) => {
  return name.substring(0, 2).toUpperCase()
}

// Helper: Generate a consistent color based on a string (for avatars)
const stringToColor = (string: string) => {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

// Helper: Format timestamp to HH:MM
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const { user } = useAuth() 
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [activeEvent, setActiveEvent] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. Load user's events
  useEffect(() => {
    if (!user) return
    const userId = user.id

    async function loadMyEvents() {
      const { data } = await supabase
        .from('rsvps')
        .select('event_id, events(id, title)')
        .eq('user_id', userId)
      
      if (data) {
        const formattedEvents = data.map((item: any) => item.events)
        setMyEvents(formattedEvents)
        
        if (formattedEvents.length > 0 && !activeEvent && window.innerWidth > 900) {
            setActiveEvent(formattedEvents[0])
        }
      }
    }
    loadMyEvents()
  }, [user, activeEvent])

  // 2. Load messages and listen for new ones
  useEffect(() => {
    if (!activeEvent) return
    setMessages([]) 

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(*)') 
        .eq('scope', 'event') 
        .eq('scope_id', activeEvent.id) 
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    loadMessages()

    const channel = supabase
      .channel(`chat-${activeEvent.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `scope_id=eq.${activeEvent.id}` },
        async (payload) => {
          const { data: fullMsg } = await supabase
            .from('messages')
            .select('*, profiles(*)')
            .eq('id', payload.new.id)
            .single()

          if (fullMsg) {
            setMessages((prev) => {
              if (prev.find(m => m.id === fullMsg.id)) return prev
              return [...prev, fullMsg]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeEvent])

  // 3. Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeEvent) return

    const { data, error } = await supabase
      .from('messages')
      .insert([{ 
        scope: 'event', 
        scope_id: activeEvent.id, 
        user_id: user.id, 
        content: newMessage 
      }])
      .select('*, profiles(*)') 

    if (!error && data) {
      setMessages((prev) => {
        if (prev.find(m => m.id === data[0].id)) return prev
        return [...prev, data[0]]
      })
      setNewMessage('')
    }
  }

  if (!user) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5">Zaloguj się, aby korzystać z czatu.</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 0, md: 3 }, px: { xs: 0, md: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, gap: 3, overflow: 'hidden' }}>
        
        {/* Left panel: Chat list */}
        <Paper 
          elevation={0}
          sx={{ 
            width: { xs: '100%', md: '320px' }, 
            display: { xs: activeEvent ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            bgcolor: 'transparent'
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, px: 2, pt: 2, fontWeight: 900 }}>Czaty <ChatBubbleIcon /></Typography>
          <List sx={{ overflowY: 'auto', px: 1 }}>
            {myEvents.length === 0 && (
              <Typography sx={{ p: 2, color: 'text.secondary' }}>
                Nie jesteś zapisany(-a) na żadne wydarzenia.
              </Typography>
            )}
            {myEvents.map((ev) => (
              <ListItemButton 
                key={ev.id} 
                selected={activeEvent?.id === ev.id}
                onClick={() => setActiveEvent(ev)}
                sx={{
                  mb: 1,
                  borderRadius: 4,
                  bgcolor: activeEvent?.id === ev.id ? 'primary.main' : 'white',
                  color: activeEvent?.id === ev.id ? 'white' : 'text.primary',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  },
                  '&:hover': {
                    bgcolor: activeEvent?.id === ev.id ? 'primary.main' : 'grey.50',
                  }
                }}
              >
                <Avatar sx={{ width: 40, height: 40, mr: 1.5, bgcolor: activeEvent?.id === ev.id ? 'white' : 'primary.light', color: activeEvent?.id === ev.id ? 'primary.main' : 'white' }}>
                  <GroupIcon />
                </Avatar>
                <ListItemText 
                  primary={ev.title} 
                  slotProps={{ primary: { noWrap: true, sx: { fontWeight: 700 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Right panel: Chat window */}
        <Paper 
          elevation={0}
          sx={{ 
            flex: 1, 
            display: { xs: activeEvent ? 'flex' : 'none', md: 'flex' }, 
            flexDirection: 'column', 
            bgcolor: 'white',
            borderRadius: { xs: 0, md: 6 },
            overflow: 'hidden',
            boxShadow: { xs: 'none', md: '0 8px 32px rgba(0,0,0,0.08)' }
          }}
        >
          {activeEvent ? (
            <>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'grey.100', bgcolor: 'white', zIndex: 10 }}>
                <IconButton onClick={() => setActiveEvent(null)} sx={{ display: { md: 'none' }, mr: 1, color: 'text.primary' }}>
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    {activeEvent.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                    ● Czat uczestników
                  </Typography>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f9fafb' }}>
                {messages.length === 0 && (
                  <Box sx={{ m: 'auto', textAlign: 'center', p: 3, bgcolor: 'primary.50', borderRadius: 4 }}>
                    <Typography sx={{ fontWeight: 'bold' }} color="primary.main">Nikt tu jeszcze nikogo nie zna, więc zacznij od „cześć”!</Typography>
                  </Box>
                )}
                
                {messages.map((msg, index) => {
                  const isMe = msg.user_id === user.id
                  const senderName = getSenderName(msg.profiles)
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].user_id !== msg.user_id)

                  return (
                    <Box key={msg.id} sx={{ display: 'flex', gap: 1.5, alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      
                      {/* Avatar for others */}
                      {!isMe && (
                        <Box sx={{ width: 40, flexShrink: 0 }}>
                          {showAvatar && (
                            <Avatar sx={{ width: 40, height: 40, bgcolor: stringToColor(senderName), fontSize: '1rem', fontWeight: 'bold' }}>
                              {getInitials(senderName)}
                            </Avatar>
                          )}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {/* Name (only show for others if it's the first in a cluster) */}
                        {showAvatar && (
                          <Typography variant="caption" sx={{ ml: 1, mb: 0.5, color: 'text.secondary', fontWeight: 700 }}>
                            {senderName}
                          </Typography>
                        )}
                        
                        {/* Bubble */}
                        <Paper elevation={0} sx={{ 
                          p: 1.5, 
                          px: 2,
                          bgcolor: isMe ? 'primary.main' : 'white', 
                          color: isMe ? 'white' : 'text.primary', 
                          borderRadius: 4,
                          borderTopLeftRadius: isMe ? 16 : 4,
                          borderTopRightRadius: isMe ? 4 : 16,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          <Typography variant="body1" sx={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>{msg.content}</Typography>
                          
                          {/* Time inside bubble */}
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7, fontSize: '0.7rem' }}>
                            {formatTime(msg.created_at)}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  )
                })}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Input Area */}
              <Box component="form" onSubmit={sendMessage} sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'grey.100', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="Napisz coś do wszystkich..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 999, 
                      bgcolor: '#f3f4f6',
                      '& fieldset': { border: 'none' } 
                    } 
                  }}
                />
                <IconButton 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 44, 
                    height: 44,
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': { bgcolor: 'grey.300', color: 'white' }
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f9fafb' }}>
              <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>Wybierz wydarzenie, aby dołączyć do rozmowy</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  )
}

// Simple Chat Icon for the header
function ChatBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  )
}