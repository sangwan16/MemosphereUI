import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from './components/AuthPage'
import { Allposts } from './components/Allposts'
import { AboutPage } from './components/AboutPage'
import { CategoryFeed } from './components/CategoryFeed'
import { CreatePost } from './components/CreatePost'
import { DraftsPage } from './components/DraftsPage'
import './App.css'
import { Home } from './components/Home'
import { NotificationsPage } from './components/NotificationsPage'
import { PlaceholderPage } from './components/PlaceholderPage'
import { PostDetailPage } from './components/PostDetailPage'
import { ProfilePage } from './components/ProfilePage'
import { RequireAuth } from './components/RequireAuth'
import { SearchPage } from './components/SearchPage'
import { TopBar } from './components/TopBar'
import { UserProfilePage } from './components/UserProfilePage'

function App() {
  return (
    <>
    <TopBar />
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
        <Route path="/feed" element={<PlaceholderPage title="Your feed" />} />
        <Route path="/all_posts" element={<Allposts />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/edit-draft/:draftId" element={<CreatePost />} />
        <Route path="/profile/drafts" element={<DraftsPage />} />
        <Route path="/feed/:category" element={<CategoryFeed />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:section" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
    </>
    
  )
}

export default App
