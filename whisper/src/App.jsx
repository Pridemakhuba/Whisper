import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './hooks/useUser.jsx'
import MainApp from './pages/MainApp.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </UserProvider>
  )
}
