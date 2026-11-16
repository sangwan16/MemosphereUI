import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Menu, MenuItem } from '@mui/material'
import { useEffect, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCategories, type Category } from '../api/posts'

export function ExploreMenu() {
  const navigate = useNavigate()
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryLoadFailed, setCategoryLoadFailed] = useState(false)

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategoryLoadFailed(true))
      .finally(() => setIsLoadingCategories(false))
  }, [])

  function openMenu(event: MouseEvent<HTMLElement>) {
    setAnchorElement(event.currentTarget)
  }

  function closeMenu() {
    setAnchorElement(null)
  }

  return (
    <>
      <Button
        color="inherit"
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={openMenu}
        aria-haspopup="menu"
        aria-expanded={anchorElement ? 'true' : undefined}
        sx={{
          minWidth: 0,
          px: 1.75,
          py: 0.75,
          gap: 0.5,
          borderRadius: 1,
          borderColor: 'rgba(255, 255, 255, 0.42)',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          textTransform: 'none',
          '& .MuiButton-endIcon': { ml: 0.5, mr: 0 },
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.7)',
            bgcolor: 'rgba(255, 255, 255, 0.18)',
          },
        }}
      >
        Explore
      </Button>
      <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={closeMenu}>
        {isLoadingCategories && <MenuItem disabled>Loading categories...</MenuItem>}
        {categoryLoadFailed && <MenuItem disabled>Could not load categories</MenuItem>}
        {!isLoadingCategories && !categoryLoadFailed && categories.length === 0 && (
          <MenuItem disabled>No categories available</MenuItem>
        )}
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            onClick={() => {
              closeMenu()
              navigate(`/feed/${category.slug}`)
            }}
          >
            {category.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}