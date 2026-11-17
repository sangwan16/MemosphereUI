import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import HomeIcon from '@mui/icons-material/Home'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import { AppBar, Badge, Box, Button, IconButton, Toolbar, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAccessToken } from '../api/auth'
import { getUnreadNotificationCount } from '../api/posts'
import { ExploreMenu } from './ExploreMenu'

export function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!getAccessToken()) {
      setUnreadCount(0)
      return
    }

    let isActive = true
    const refreshCount = () => {
      getUnreadNotificationCount()
        .then((count) => {
          if (isActive) setUnreadCount(count)
        })
        .catch(() => undefined)
    }
    const handleNotificationsUpdated = () => refreshCount()
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshCount()
    }

    refreshCount()
    const intervalId = window.setInterval(refreshCount, 30_000)
    window.addEventListener('notifications-updated', handleNotificationsUpdated)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
      window.removeEventListener('notifications-updated', handleNotificationsUpdated)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname])

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton aria-label="Home" color="inherit" onClick={() => navigate('/home')}>
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Search">
            <IconButton aria-label="Search users and posts" color="inherit" onClick={() => navigate('/search')}>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Button
            color="inherit"
            variant="outlined"
            startIcon={<AddBoxOutlinedIcon />}
            onClick={() => navigate('/create-post')}
            sx={{
              minWidth: 0,
              px: 1.75,
              py: 0.75,
              gap: 0.5,
              borderRadius: 1,
              borderColor: 'rgba(255, 255, 255, 0.42)',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              textTransform: 'none',
              '& .MuiButton-startIcon': { ml: 0, mr: 0.5 },
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
                bgcolor: 'rgba(255, 255, 255, 0.18)',
              },
            }}
          >
            Create post
          </Button>

          {pathname !== '/home' && <ExploreMenu />}
        </Box>

        <Box>
          <Tooltip title="Profile">
            <IconButton aria-label="Profile" color="inherit" onClick={() => navigate('/profile')}>
              <PersonIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="About">
            <IconButton aria-label="About" color="inherit" onClick={() => navigate('/about')}>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              color="inherit"
              onClick={() => navigate('/notifications')}
            >
              <Badge badgeContent={unreadCount} color="error" max={99} invisible={unreadCount === 0}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}