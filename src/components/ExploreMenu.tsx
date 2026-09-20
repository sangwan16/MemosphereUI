import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button, Menu, MenuItem } from '@mui/material'
import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const categories = [
  { label: 'Poetry', slug: 'poetry' },
  { label: 'Movies', slug: 'movies' },
  { label: 'Legends', slug: 'legends' },
  { label: 'Books', slug: 'books' },
  { label: 'Miscellaneous', slug: 'miscellaneous' },
]

export function ExploreMenu() {
  const navigate = useNavigate()
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null)

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
        endIcon={<ExpandMoreIcon />}
        onClick={openMenu}
        aria-haspopup="menu"
        aria-expanded={anchorElement ? 'true' : undefined}
      >
        Explore
      </Button>
      <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={closeMenu}>
        {categories.map((category) => (
          <MenuItem
            key={category.slug}
            onClick={() => {
              closeMenu()
              navigate(`/feed/${category.slug}`)
            }}
          >
            {category.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}