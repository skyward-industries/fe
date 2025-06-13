"use client";

import { useSelection } from "@/context/SelectionContext";
import { Menu, ShoppingCart } from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Button,
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
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FSCDropdown from "./FSCDropdown";

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
    if (searchQuery.trim()) {
      router.push(`/search?nsn=${searchQuery.trim()}`);
    }
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Catalog", href: "/catalog" },
    { label: "Create RFQ", href: "/cart", variant: "outlined", color: "error" },
  ];

  return (
    <>
      <AppBar position="static" sx={{ padding: "0.5rem", maxHeight: "64px" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/" passHref>
              <Box sx={{ display: "flex", alignItems: "center", mr: 2, maxHeight: "64px" }}>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={160}
                  height={40}
                  priority
                />
              </Box>
            </Link>

            {!isMobile && (
              <>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component={Link}
                    href={item.href}
                    color={item.color || "inherit"}
                    variant={item.variant as any}
                    sx={{ fontWeight: "bold" }}
                  >
                    {item.label}
                  </Button>
                ))}
                <FSCDropdown />
              </>
            )}
          </Box>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: "flex",
              gap: 1,
              mt: { xs: 1, md: 0 },
              width: { xs: "100%", md: "auto" },
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="NSN or Part Number Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ borderRadius: 1, width: { xs: "100%", sm: 250, md: 300 } }}
            />
            <Button type="submit" variant="contained" color="primary">
              Search
            </Button>
            <Button color="inherit" component={Link} href="/cart">
              <Badge badgeContent={selectedCount} color="error">
                <ShoppingCart />
              </Badge>
            </Button>
            {isMobile && (
              <IconButton color="inherit" onClick={toggleDrawer(true)}>
                <Menu />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
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
            <ListItem>
              <FSCDropdown />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
