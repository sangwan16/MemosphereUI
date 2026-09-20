import { Box, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom';

type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
    const location = useLocation();
    // extract the last part of the path after the last slash
    console.log('location:', location);
    const feed = location.pathname.split('/').pop();
    console.log('feed:', feed);
  return (
    
    <Box component="main" sx={{ p: 3 }}>
      <Typography component="h1" variant="h4">{feed}</Typography>
    </Box>
  )
}