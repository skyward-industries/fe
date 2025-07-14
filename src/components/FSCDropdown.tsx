// src/components/FSCDropdown.tsx
'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { KeyboardArrowDown } from '@mui/icons-material';
import Link from 'next/link';
import { slugify } from '@/utils/slugify';

interface Group {
  fsg: string;
  fsg_title: string;
  description: string | null;
}

export default function FSCDropdown() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load product groups');
        setLoading(false);
      });
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="fsc-dropdown-button"
        aria-controls={open ? 'fsc-dropdown-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color="inherit"
        sx={{ fontWeight: 'bold' }}
        endIcon={<KeyboardArrowDown />}
      >
        Product Groups
      </Button>
      <Menu
        id="fsc-dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'fsc-dropdown-button',
        }}
      >
        {loading && <MenuItem disabled>Loading...</MenuItem>}
        {error && <MenuItem disabled>{error}</MenuItem>}
        {!loading && !error && groups.map((group) => (
          <MenuItem
            key={group.fsg}
            onClick={handleClose}
            component={Link}
            href={`/catalog/${group.fsg}/${slugify(group.fsg_title || '')}`}
          >
            {group.fsg_title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}