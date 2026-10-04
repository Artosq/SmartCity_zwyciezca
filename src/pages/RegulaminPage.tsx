import LegalDocument from '../components/LegalDocument'
import { TERMS } from '../data/legal'

// Regulamin serwisu — treść w src/data/legal.ts.
export default function RegulaminPage() {
  return <LegalDocument title="Regulamin" sections={TERMS} />
}
