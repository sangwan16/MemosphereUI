import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import HomeIcon from '@mui/icons-material/Home'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import PersonIcon from '@mui/icons-material/Person'
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExploreMenu } from './ExploreMenu'

export function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton aria-label="Home" color="inherit" onClick={() => navigate('/home')}>
              <HomeIcon />
            </IconButton>
          </Tooltip>

          <Button
            color="inherit"
            startIcon={<AddBoxOutlinedIcon />}
            onClick={() => navigate('/create-post')}
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
            <IconButton aria-label="Notifications" color="inherit" onClick={() => navigate('/notifications')}>
              <NotificationsNoneIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}