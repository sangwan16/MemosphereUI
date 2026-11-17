import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyDrafts, type Post } from '../api/posts'

export function DraftsPage() {
  const [drafts, setDrafts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true
    listMyDrafts()
      .then((loadedDrafts) => {
        if (isActive) setDrafts(loadedDrafts)
      })
      .catch(() => {
        if (isActive) setError('Your drafts could not be loaded. Please try again.')
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return (
    <Box component="main" sx={{ maxWidth: 760, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography component="h1" variant="h4">Your drafts</Typography>
          <Button component={Link} to="/create-post" variant="contained">New post</Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {isLoading && <CircularProgress aria-label="Loading drafts" />}
        {!isLoading && !error && drafts.length === 0 && (
          <Typography color="text.secondary">
            No drafts yet. Posts you save as drafts will appear here.
          </Typography>
        )}

        {!isLoading && !error && drafts.map((draft) => (
          <Card key={draft.id} variant="outlined">
            <CardContent>
              <Typography component="h2" variant="h6">
                {draft.title || 'Untitled draft'}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflowWrap: 'anywhere',
                }}
              >
                {draft.content}
              </Typography>
              <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 1 }}>
                Last saved {new Date(draft.updated_at ?? draft.created_at).toLocaleString()}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to={`/edit-draft/${draft.id}`}
                startIcon={<EditOutlinedIcon />}
              >
                Continue editing
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
