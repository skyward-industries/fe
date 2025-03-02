"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppBar, Toolbar, Button, TextField, Box, Badge } from "@mui/material";
import { useSelection } from "@/context/SelectionContext";
import { ShoppingCart } from "@mui/icons-material";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { selectedItems } = useSelection();
  const selectedCount = selectedItems.length;
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery.trim()}`);
    }
  };

  return (
    <AppBar position="static" sx={{ padding: "0.5rem" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/about">
            About
          </Button>
          <Button color="inherit" component={Link} href="/catalog">
            Catalog
          </Button>
        </Box>
        <Button color="inherit" component={Link} href="/cart">
          <Badge badgeContent={selectedCount} color="error">
            <ShoppingCart />
          </Badge>
        </Button>
        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by Product ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 200 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
