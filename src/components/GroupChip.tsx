import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import AccessibleIcon from '@mui/icons-material/Accessible'
import BackpackIcon from '@mui/icons-material/Backpack'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import ElderlyIcon from '@mui/icons-material/Elderly'
import HeadphonesIcon from '@mui/icons-material/Headphones'
import PersonIcon from '@mui/icons-material/Person'
import type { TargetGroup } from '../data/targetGroups'

// Ikona każdej grupy docelowej — rozróżnia grupy nie tylko kolorem.
const ICONS: Record<string, ReactNode> = {
  'male-dzieci': <ChildCareIcon />,
  'starsze-dzieci': <BackpackIcon />,
  mlodziez: <HeadphonesIcon />,
  dorosli: <PersonIcon />,
  seniorzy: <ElderlyIcon />,
  niepelnosprawni: <AccessibleIcon />,
}

interface Props {
  group: TargetGroup
  active: boolean
  onClick: () => void
  // inny podpis niż nazwa grupy (np. pełne zdanie w filtrach mapy)
  label?: string
}

// Chip grupy docelowej: ikona w kółku w kolorze grupy; zaznaczony wypełnia się jej kolorem.
export default function GroupChip({ group, active, onClick, label }: Props) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={{
        flexShrink: 0,
        gap: 1,
        pl: 0.75,
        pr: 2,
        minHeight: 46,
        borderRadius: '999px',
        fontWeight: active ? 800 : 700,
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
        color: 'text.primary',
        border: '2px solid',
        borderColor: active ? group.color : 'transparent',
        // zaznaczony: jasny odcień koloru grupy (ciemny tekst zostaje czytelny)
        bgcolor: active ? `${group.color}33` : 'background.paper',
        boxShadow: active ? `0 4px 14px ${group.color}55` : '0 2px 10px rgba(17,17,17,0.14)',
        transition:
          'transform .15s ease, box-shadow .2s ease, background-color .2s ease, border-color .2s ease',
        '&:hover': { transform: 'translateY(-2px)', borderColor: group.color },
        '&:active': { transform: 'scale(0.96)' },
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: group.color,
          color: '#111111',
          transition: 'transform .25s cubic-bezier(.2,.8,.2,1)',
          transform: active ? 'scale(1.08)' : 'none',
          '& svg': { fontSize: 20 },
        }}
      >
        {ICONS[group.slug]}
      </Box>
      {label ?? group.name}
    </ButtonBase>
  )
}
