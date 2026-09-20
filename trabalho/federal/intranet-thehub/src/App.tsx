import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { HomePage } from '@/pages/HomePage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<PlaceholderPage title="Onboarding" />} />
        <Route path="/beneficios" element={<PlaceholderPage title="Benefícios e RH" />} />
        <Route path="/treinamentos" element={<PlaceholderPage title="Hub de Treinamento" />} />
        <Route path="/pessoas" element={<PlaceholderPage title="Diretório de Pessoas" />} />
        <Route path="/recursos" element={<PlaceholderPage title="Diretório de Recursos" />} />
        <Route path="/noticias" element={<PlaceholderPage title="Notícias" />} />
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Routes>
    </AppShell>
  )
}
