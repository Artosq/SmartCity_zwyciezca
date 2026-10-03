import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
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
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

// Helper: Get user name
const getSenderName = (profile: any) => {
  if (!profile) return 'Uczestnik'
  return profile.first_name || profile.name || profile.full_name || profile.username || 'Uczestnik'
}

// Helper: Get initials
const getInitials = (name: string) => {
  return name.substring(0, 2).toUpperCase()
}

// Helper: Consistent color for avatars
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

// Helper: Format time
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Helper: Format date for separators
const getDateLabel = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Dziś'
  if (date.toDateString() === yesterday.toDateString()) return 'Wczoraj'
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ChatPage() {
  const { user } = useAuth() 
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [activeEvent, setActiveEvent] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. Load user's events
  useEffect(() => {
    if (!user) return

    async function loadMyEvents() {
      const { data } = await supabase
        .from('rsvps')
        .select('event_id, events(id, title)')
        .eq('user_id', user.id)
      
      if (data) {
        const formattedEvents = data.map((item: any) => item.events)
        setMyEvents(formattedEvents)
        
        if (formattedEvents.length > 0 && !activeEvent && window.innerWidth > 900) {
            setActiveEvent(formattedEvents[0])
        }
      }
    }
    loadMyEvents()
  }, [user]) // Removed activeEvent from deps to prevent unnecessary re-fetches

  // 2. Global listener for unread badges
  useEffect(() => {
    if (!user || myEvents.length === 0) return

    const channel = supabase.channel('global-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `scope=eq.event` },
        (payload) => {
          const evId = payload.new.scope_id
          // If the message is for one of our events, and not the currently open chat
          if (myEvents.some(e => e.id === evId) && activeEvent?.id !== evId) {
            setUnreadCounts(prev => ({ ...prev, [evId]: (prev[evId] || 0) + 1 }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, myEvents, activeEvent])

  // Clear unread count when opening a chat
  useEffect(() => {
    if (activeEvent) {
      setUnreadCounts(prev => {
        const next = { ...prev }
        delete next[activeEvent.id]
        return next
      })
    }
  }, [activeEvent])

  // 3. Load active chat data (messages & participants)
  useEffect(() => {
    if (!activeEvent) return
    setMessages([]) 
    setParticipants([])

    async function loadChatData() {
      // Fetch messages
      const { data: msgData } = await supabase
        .from('messages')
        .select('*, profiles(*)') 
        .eq('scope', 'event') 
        .eq('scope_id', activeEvent.id) 
        .order('created_at', { ascending: true })
      if (msgData) setMessages(msgData)

      // Fetch participants
      const { data: rsvpData } = await supabase
        .from('rsvps')
        .select('profiles(*)')
        .eq('event_id', activeEvent.id)
      if (rsvpData) {
        const profs = rsvpData.map((r: any) => r.profiles).filter(Boolean)
        setParticipants(profs)
      }
    }
    loadChatData()

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

  // 4. Send message
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

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  // Tracking date for separators
  let previousDateLabel: string | null = null

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 0, md: 3 }, px: { xs: 0, md: 2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, gap: 3, overflow: 'hidden' }}>
        
        {/* Left panel: Chat list */}
        <Paper 
          elevation={0}
          sx={{ 
            width: { xs: '100%', md: '340px' }, 
            display: { xs: activeEvent ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            bgcolor: 'transparent'
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, px: 2, pt: 2, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
            Czaty 
            <Badge color="error" variant="dot" invisible={totalUnread === 0}>
              <ChatBubbleIcon />
            </Badge>
          </Typography>

          <List sx={{ overflowY: 'auto', px: 2 }}>
            {myEvents.length === 0 && (
              <Typography sx={{ p: 2, color: 'text.secondary' }}>
                Nie jesteś zapisany(-a) na żadne wydarzenia.
              </Typography>
            )}
            {myEvents.map((ev) => {
              const unread = unreadCounts[ev.id] || 0
              
              return (
                <ListItemButton 
                  key={ev.id} 
                  selected={activeEvent?.id === ev.id}
                  onClick={() => setActiveEvent(ev)}
                  sx={{
                    mb: 1.5,
                    py: 1.5,
                    px: 2,
                    borderRadius: '16px',
                    bgcolor: activeEvent?.id === ev.id ? 'primary.main' : 'white',
                    color: activeEvent?.id === ev.id ? 'white' : 'text.primary',
                    border: '1px solid',
                    borderColor: activeEvent?.id === ev.id ? 'primary.main' : 'grey.200',
                    boxShadow: activeEvent?.id === ev.id ? '0 4px 12px rgba(75,59,240,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    },
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Badge color="error" badgeContent={unread}>
                    <Avatar 
                      sx={{ 
                        width: 44, 
                        height: 44, 
                        bgcolor: activeEvent?.id === ev.id ? 'rgba(255,255,255,0.2)' : 'primary.50', 
                        color: activeEvent?.id === ev.id ? 'white' : 'primary.main' 
                      }}
                    >
                      <GroupIcon />
                    </Avatar>
                  </Badge>
                  <ListItemText 
                    primary={ev.title} 
                    slotProps={{ primary: { noWrap: true, fontWeight: unread > 0 ? 900 : 800, fontSize: '1rem' } }} 
                    sx={{ my: 0 }}
                  />
                  <ChevronRightIcon sx={{ color: activeEvent?.id === ev.id ? 'white' : 'grey.400' }} />
                </ListItemButton>
              )
            })}
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
            borderRadius: { xs: 0, md: '24px' },
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
                
                {/* Participants Row */}
                {participants.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, textDecoration: 'underline' }}>
                      Poznaj uczestników
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                      {participants.map(p => {
                        const name = getSenderName(p)
                        return (
                          <Box key={p.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                            <Avatar sx={{ width: 48, height: 48, bgcolor: stringToColor(name), mb: 0.5, border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                              {getInitials(name)}
                            </Avatar>
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', textAlign: 'center' }} noWrap>
                              {name.split(' ')[0]}
                            </Typography>
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                )}

                {messages.length === 0 && (
                  <Box sx={{ m: 'auto', textAlign: 'center', p: 3, bgcolor: 'primary.50', borderRadius: '24px' }}>
                    <Typography fontWeight="bold" color="primary.main">Nikt tu jeszcze nikogo nie zna, więc zacznij od „cześć”!</Typography>
                  </Box>
                )}
                
                {messages.map((msg, index) => {
                  const isMe = msg.user_id === user.id
                  const senderName = getSenderName(msg.profiles)
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].user_id !== msg.user_id)
                  
                  const currentDateLabel = getDateLabel(msg.created_at)
                  const showDateSeparator = currentDateLabel !== previousDateLabel
                  previousDateLabel = currentDateLabel

                  return (
                    <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                      
                      {/* Date Separator */}
                      {showDateSeparator && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                          <Box sx={{ bgcolor: 'grey.200', px: 2, py: 0.5, borderRadius: 4 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              {currentDateLabel}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1.5, alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                        
                        {/* Avatar for others */}
                        {!isMe && (
                          <Box sx={{ width: '40px', flexShrink: 0 }}>
                            {showAvatar && (
                              <Avatar sx={{ width: 40, height: 40, bgcolor: stringToColor(senderName), fontSize: '1rem', fontWeight: 'bold' }}>
                                {getInitials(senderName)}
                              </Avatar>
                            )}
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          {/* Name */}
                          {showAvatar && (
                            <Typography variant="caption" sx={{ ml: 1, mb: 0.5, color: 'text.secondary', fontWeight: 700 }}>
                              {senderName}
                            </Typography>
                          )}
                          
                          {/* Bubble */}
                          <Paper elevation={0} sx={{ 
                            py: 1, 
                            px: 1.75,
                            bgcolor: isMe ? 'primary.main' : 'white', 
                            color: isMe ? 'white' : 'text.primary', 
                            borderRadius: '16px',
                            borderTopLeftRadius: isMe ? '16px' : '4px',
                            borderTopRightRadius: isMe ? '4px' : '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            minWidth: '75px'
                          }}>
                            <Typography variant="body1" sx={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>{msg.content}</Typography>
                            
                            {/* Time */}
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.25, opacity: 0.7, fontSize: '0.7rem' }}>
                              {formatTime(msg.created_at)}
                            </Typography>
                          </Paper>
                        </Box>
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
                      borderRadius: '999px', 
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

function ChatBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  )
}