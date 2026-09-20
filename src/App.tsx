import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/AuthPage'
import './App.css'
import { Home } from './components/Home'
import { PlaceholderPage } from './components/PlaceholderPage'
import { TopBar } from './components/TopBar'

function App() {
  return (
    <>
    <TopBar />
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/feed" element={<PlaceholderPage title="Your feed" />} />
      <Route path="/create-post" element={<PlaceholderPage title="Create post" />} />
      <Route path="/feed/:category" element={<PlaceholderPage title="Category feed" />} />
      <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
      <Route path="/about" element={<PlaceholderPage title="About" />} />
      <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
    </>
    
  )
}

export default App
