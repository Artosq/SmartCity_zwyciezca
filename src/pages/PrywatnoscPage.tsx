import LegalDocument from '../components/LegalDocument'
import { PRIVACY } from '../data/legal'

// Polityka prywatności — treść w src/data/legal.ts.
export default function PrywatnoscPage() {
  return <LegalDocument title="Polityka prywatności" sections={PRIVACY} />
}
