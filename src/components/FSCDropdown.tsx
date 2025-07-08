// src/components/FSCDropdown.tsx
import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { KeyboardArrowDown } from '@mui/icons-material';
import Link from 'next/link';

export default function FSCDropdown() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
        color="inherit" // Inherit color from AppBar
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
        <MenuItem onClick={handleClose} component={Link} href="/product-group/fsg-16">Aircraft Propulsions & Components</MenuItem>
        <MenuItem onClick={handleClose} component={Link} href="/product-group/fsg-61">Electrical Wire & Power</MenuItem>
        <MenuItem onClick={handleClose} component={Link} href="/product-group/fsg-27">Hardware & Abrasives</MenuItem>
        {/* Add more product groups here */}
      </Menu>
    </div>
  );
}