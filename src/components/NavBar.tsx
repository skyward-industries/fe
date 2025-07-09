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
    { label: "Services", href: "/services" },
    { label: "Industries", href: "/industries" },
    { label: "Resources", href: "/resources" },
    { label: "Contact", href: "/contact" },
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
      <AppBar position="static">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
            paddingX: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {/* Left Side: Logo and Desktop Navigation */}
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Link href="/" passHref>
              <Box sx={{ display: "flex", alignItems: "center", mr: 2, cursor: 'pointer' }}>
                <Image
                  src="/logo.png"
                  alt="Skyward Industries Logo"
                  width={160}
                  height={40}
                  priority
                />
              </Box>
            </Link>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.href}
                    color={item.color || "inherit"}
                    variant={item.variant}
                    sx={{ fontWeight: "bold", whiteSpace: 'nowrap' }}
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
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search NSN or Part Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: { xs: '150px', sm: '200px', md: '300px' },
                  '.MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '.MuiInputBase-input': {
                    color: 'black',
                  },
                }}
              />
              <Button type="submit" variant="contained" color="primary" aria-label="Search" sx={{ minWidth: 'auto', p: 1 }}>
                <SearchIcon />
              </Button>
            </Box>

            <IconButton color="inherit" component={Link} href="/cart" aria-label="View Cart">
              <Badge badgeContent={selectedCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
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