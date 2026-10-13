import { Box, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearTokens, getAccessToken, getCurrentUser } from '../api/auth'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export function RequireAuth() {
  const location = useLocation()
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAccessToken() ? 'checking' : 'unauthenticated',
  )

  useEffect(() => {
    if (!getAccessToken()) return

    let isActive = true
    getCurrentUser()
      .then(() => {
        if (isActive) setStatus('authenticated')
      })
      .catch(() => {
        clearTokens()
        if (isActive) setStatus('unauthenticated')
      })

    return () => {
      isActive = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <Box sx={{ display: 'grid', minHeight: 240, placeItems: 'center' }}>
        <CircularProgress aria-label="Checking your session" />
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return <Outlet />
}