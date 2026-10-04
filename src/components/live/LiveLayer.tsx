import { Marker, Popup } from 'react-leaflet'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLive } from '../../context/LiveContext'
import { getJoinerIcon, getLiveIcon } from '../map/eventIcon'
import RatingBadge from '../RatingBadge'

function ago(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  return minutes < 1 ? 'przed chwilą' : `${minutes} min temu`
}

// Warstwa mapy „Pokaż się": osoby widoczne na żywo i — tylko dla mnie — osoby, które do mnie idą.
// Kliknięcie pinezki pokazuje notkę i przycisk „Dołączam".
export default function LiveLayer() {
  const { userId, people, incoming, joinedTargetId, join, leave } = useLive()

  return (
    <>
      {people.map((person) => {
        const isMe = person.user_id === userId
        const joined = person.user_id === joinedTargetId
        return (
          <Marker
            key={person.user_id}
            position={[person.lat, person.lng]}
            icon={getLiveIcon(isMe)}
            zIndexOffset={1000}
          >
            <Popup className="live-popup" closeButton={false}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    {isMe ? 'To Ty' : (person.profile?.name ?? 'Sąsiad')}
                  </Typography>
                  {!isMe && <RatingBadge avg={person.profile?.rating_avg} count={person.profile?.rating_count} />}
                </Stack>
                <Typography sx={{ fontSize: '1rem' }}>„{person.note}"</Typography>
                <Typography variant="body2" color="text.secondary">
                  Położenie: {ago(person.updated_at)}
                </Typography>
                {!isMe &&
                  (joined ? (
                    <Button variant="outlined" size="small" onClick={leave}>
                      Rezygnuję
                    </Button>
                  ) : (
                    <Button variant="contained" color="secondary" size="small" onClick={() => join(person.user_id)}>
                      Dołączam
                    </Button>
                  ))}
                {!isMe && (
                  <Typography variant="caption" color="text.secondary">
                    {joined
                      ? 'Ta osoba widzi, że do niej idziesz, i Twoje położenie.'
                      : 'Po kliknięciu ta osoba zobaczy Twoje imię i położenie.'}
                  </Typography>
                )}
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
