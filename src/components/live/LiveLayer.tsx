import { useEffect, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLive } from '../../context/LiveContext'
import { getJoinerIcon, getLiveIcon } from '../map/eventIcon'
import RatingBadge from '../RatingBadge'

// Przybliżenie, przy którym po „Pokaż się" widać własną pinezkę i najbliższą okolicę.
const SELF_ZOOM = 16

function ago(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  return minutes < 1 ? 'przed chwilą' : `${minutes} min temu`
}

// Warstwa mapy „Pokaż się": ja (gdy jestem live), inne osoby live i — tylko dla mnie —
// osoby, które do mnie idą. Kliknięcie osoby pokazuje notkę i przycisk „Dołączam".
export default function LiveLayer() {
  const map = useMap()
  const { userId, people, mine, live, myPosition, incoming, joinedTargetId, join, leave } = useLive()

  // Własna pinezka idzie za odczytami GPS; zanim przyjdzie pierwszy, używamy położenia z bazy.
  const me = live ? (myPosition ?? (mine ? { lat: mine.lat, lng: mine.lng } : null)) : null

  // Po pokazaniu się mapa raz przesuwa się do mnie, żebym od razu widział siebie.
  const centered = useRef(false)
  useEffect(() => {
    if (!me) {
      centered.current = false
      return
    }
    if (centered.current) return
    centered.current = true
    map.setView([me.lat, me.lng], Math.max(map.getZoom(), SELF_ZOOM))
  }, [map, me])

  return (
    <>
      {me && (
        <Marker position={[me.lat, me.lng]} icon={getLiveIcon('', true)} zIndexOffset={1100}>
          <Popup className="live-popup" closeButton={false}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>To Ty, jesteś live</Typography>
            {mine && <Typography sx={{ fontSize: '1rem' }}>„{mine.note}"</Typography>}
            <Typography variant="body2" color="text.secondary">
              Tak widzą Cię inni dorośli na mapie.
            </Typography>
          </Popup>
        </Marker>
      )}

      {people
        .filter((person) => person.user_id !== userId)
        .map((person) => {
          const joined = person.user_id === joinedTargetId
          const name = person.profile?.name ?? 'Sąsiad'
          return (
            <Marker
              key={person.user_id}
              position={[person.lat, person.lng]}
              icon={getLiveIcon(name, false)}
              zIndexOffset={1000}
            >
              <Popup className="live-popup" closeButton={false}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{name}</Typography>
                    <RatingBadge avg={person.profile?.rating_avg} count={person.profile?.rating_count} />
                  </Stack>
                  <Typography sx={{ fontSize: '1rem' }}>„{person.note}"</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Położenie: {ago(person.updated_at)}
                  </Typography>
                  {joined ? (
                    <Button variant="outlined" size="small" onClick={leave}>
                      Rezygnuję
                    </Button>
                  ) : (
                    <Button variant="contained" color="secondary" size="small" onClick={() => join(person.user_id)}>
                      Dołączam
                    </Button>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {joined
                      ? 'Ta osoba widzi, że do niej idziesz, i Twoje położenie.'
                      : 'Po kliknięciu ta osoba zobaczy Twoje imię i położenie.'}
                  </Typography>
                </Stack>
              </Popup>
            </Marker>
          )
        })}

      {incoming
        .filter((row) => row.lat !== null && row.lng !== null)
        .map((row) => (
          <Marker
            key={row.joiner_id}
            position={[row.lat as number, row.lng as number]}
            icon={getJoinerIcon()}
            zIndexOffset={900}
          >
            <Popup className="live-popup" closeButton={false}>
              <Typography sx={{ fontWeight: 800 }}>{row.joiner?.name ?? 'Ktoś'} do Ciebie idzie</Typography>
              <Typography variant="body2" color="text.secondary">
                Położenie: {ago(row.updated_at)}
              </Typography>
            </Popup>
          </Marker>
        ))}
    </>
  )
}
