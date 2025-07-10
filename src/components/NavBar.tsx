// src/components/NavBar.tsx
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

import { useSelection } from "@/context/SelectionContext";
import FSCDropdown from "./FSCDropdown";

import {
  AppBar,
  Box,
  Button,
  Badge,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";


export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const { selectedItems } = useSelection();
  const selectedCount = selectedItems.length;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // This is the correct way to navigate to your App Router search page.
      router.push(`/search?nsn=${query}`);
    }
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Catalog", href: "/catalog" },
    { label: "Create RFQ", href: "/cart", variant: "outlined" as const, color: "error" as const },
  ];

  const mobileNavDrawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem>
          <FSCDropdown />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{
        background: '#6b7280',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #4b5563',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
      }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
            paddingX: { xs: 1, sm: 2, md: 3 },
            minHeight: { xs: 56, md: 64 },
          }}
        >
          {/* Left Side: Logo and Desktop Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Link href="/" passHref>
              <Box sx={{ display: "flex", alignItems: "center", mr: 2, cursor: 'pointer' }}>
                <Image
                  src="/logo.png"
                  alt="Skyward Industries Logo"
                  width={140}
                  height={32}
                  priority
                  style={{ filter: 'brightness(1.2)', borderRadius: 8 }}
                />
              </Box>
            </Link>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.href}
                    color={item.color || (item.label === 'Create RFQ' ? 'error' : 'inherit')}
                    variant={item.variant || (item.label === 'Create RFQ' ? 'contained' : 'text')}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 999,
                      px: 2.5,
                      py: 1,
                      fontSize: '1rem',
                      boxShadow: 'none',
                      textTransform: 'none',
                      color: item.label === 'Create RFQ' ? 'white' : 'rgba(255,255,255,0.92)',
                      background: item.label === 'Create RFQ' ? theme => theme.palette.error.main : 'transparent',
                      '&:hover': {
                        backgroundColor: item.label === 'Create RFQ' ? theme => theme.palette.error.dark : 'rgba(255,255,255,0.08)',
                        color: 'white',
                      },
                      transition: 'background 0.2s',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <FSCDropdown />
              </Box>
            )}
          </Box>

          {/* Right Side: Search, Cart, and Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 999,
                px: 1,
                boxShadow: 'none',
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search NSN or Part Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: { xs: '120px', sm: '180px', md: '240px' },
                  '.MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    borderRadius: 999,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '.MuiInputBase-input': {
                    color: 'white',
                    fontSize: '0.98rem',
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
                InputProps={{
                  style: { color: 'white' },
                }}
                inputProps={{
                  style: { color: 'white' },
                }}
              />
              <Button type="submit" variant="contained" color="primary" aria-label="Search" sx={{ minWidth: 'auto', p: 1, borderRadius: 999, boxShadow: 1 }}>
                <SearchIcon />
              </Button>
            </Box>

            <IconButton color="inherit" component={Link} href="/cart" aria-label="View Cart" sx={{ borderRadius: 999, boxShadow: 1, ml: 1 }}>
              <Badge badgeContent={selectedCount} color="error">
                <ShoppingCartIcon sx={{ color: 'white' }} />
              </Badge>
            </IconButton>

            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={toggleDrawer(true)}
                sx={{ borderRadius: 999, boxShadow: 1 }}
              >
                <MenuIcon sx={{ color: 'white' }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {mobileNavDrawer}
      </Drawer>
    </>
  );
}