import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost, listCategories, uploadPostImage, type Category, type CreatePostPayload } from '../api/posts'

type Visibility = CreatePostPayload['visibility']
const MAX_IMAGE_COUNT = 10
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export function CreatePost() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setError('Could not load categories.'))
  }, [])

  function removeImageUrl(index: number) {
    setImageUrls(imageUrls.filter((_, urlIndex) => urlIndex !== index))
  }

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    const availableSlots = MAX_IMAGE_COUNT - imageUrls.length
    const selectedFiles = files.slice(0, availableSlots)
    const rejectedCount = files.length - selectedFiles.length
    const validFiles = selectedFiles.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE_BYTES,
    )
    const invalidCount = selectedFiles.length - validFiles.length

    if (validFiles.length === 0) {
      setError(
        availableSlots <= 0
          ? `A post can have up to ${MAX_IMAGE_COUNT} images.`
          : 'Choose image files that are 10 MB or smaller.',
      )
      return
    }

    setError('')
    setIsUploadingImages(true)
    try {
      const results = await Promise.allSettled(validFiles.map(uploadPostImage))
      const uploadedUrls = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      )
      setImageUrls((currentUrls) => [...currentUrls, ...uploadedUrls].slice(0, MAX_IMAGE_COUNT))

      const failedCount = results.length - uploadedUrls.length
      const messages = [
        failedCount > 0 ? `${failedCount} image upload(s) failed.` : '',
        invalidCount > 0 ? `${invalidCount} file(s) were not valid images under 10 MB.` : '',
        rejectedCount > 0 ? `Only ${MAX_IMAGE_COUNT} images can be added to a post.` : '',
      ].filter(Boolean)
      if (messages.length > 0) setError(messages.join(' '))
    } finally {
      setIsUploadingImages(false)
    }
  }

  async function submitPost(asDraft: boolean) {
    setError('')
    setIsSubmitting(true)

    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        image_urls: imageUrls.map((url) => url.trim()).filter(Boolean),
        ...(excerpt.trim() ? { excerpt: excerpt.trim() } : {}),
        ...(categoryId ? { category_id: Number(categoryId) } : {}),
        visibility,
        is_draft: asDraft,
      })
      navigate('/home')
    } catch {
      setError('Could not create the post. Check your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitPost(isDraft)
  }

  function handleSaveDraft() {
    if (formRef.current?.reportValidity()) void submitPost(true)
  }

  return (
    <Box component="main" sx={{ maxWidth: 760, mx: 'auto', p: { xs: 2, sm: 4 } }}>
      <Stack spacing={3} component="form" ref={formRef} onSubmit={handleSubmit}>
        <Box>
          <Typography component="h1" variant="h4">Create a post</Typography>
          <Typography color="text.secondary">Share something worth remembering.</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />
        <TextField label="Content" value={content} onChange={(event) => setContent(event.target.value)} required fullWidth multiline minRows={8} />
        <TextField label="Excerpt (optional)" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} fullWidth multiline minRows={2} slotProps={{ htmlInput: { maxLength: 250 } }} />

        <FormControl fullWidth>
          <InputLabel id="post-category-label">Category</InputLabel>
          <Select labelId="post-category-label" label="Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <MenuItem value="">No category</MenuItem>
            {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="post-visibility-label">Visibility</InputLabel>
          <Select labelId="post-visibility-label" label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}>
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="followers">Followers</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>

        <Stack spacing={2}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Images (optional)</Typography>
            <Button component="label" startIcon={<AddPhotoAlternateOutlinedIcon />} disabled={isUploadingImages || imageUrls.length >= MAX_IMAGE_COUNT}>
              {isUploadingImages ? 'Uploading images...' : `Upload images (${imageUrls.length}/${MAX_IMAGE_COUNT})`}
              <input hidden type="file" accept="image/*" multiple onChange={handleImageSelection} />
            </Button>
          </Stack>
          {imageUrls.map((url, index) => (
            <Stack direction="row" spacing={1} key={url} sx={{ alignItems: 'center' }}>
              <Box component="img" src={url} alt={`Post image ${index + 1}`} sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1 }} />
              <Typography color="text.secondary" sx={{ flex: 1 }}>Image {index + 1}</Typography>
              <Button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => removeImageUrl(index)} color="error"><ClearIcon /></Button>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button type="button" startIcon={<SaveOutlinedIcon />} onClick={handleSaveDraft} disabled={isSubmitting || isUploadingImages}>
            Save draft
          </Button>
          <Button type="submit" variant="contained" startIcon={<PublishOutlinedIcon />} disabled={isSubmitting || isUploadingImages}>
            {isSubmitting ? 'Saving...' : isDraft ? 'Save draft' : 'Publish post'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}