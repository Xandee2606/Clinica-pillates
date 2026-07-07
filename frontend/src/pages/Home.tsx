import { PublicLayout } from '../components/public/PublicLayout'
import { Hero } from '../components/public/Hero'
import { Modalidades } from '../components/public/Modalidades'
import { ComoFunciona } from '../components/public/ComoFunciona'
import { Sobre } from '../components/public/Sobre'

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <Modalidades />
      <ComoFunciona />
      <Sobre />
    </PublicLayout>
  )
}
