"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      router.push(`/search?nsn=${searchQuery.trim()}`);
    }
  };

  return (
    <AppBar position="static" sx={{ padding: "0.5rem" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/" passHref>
            <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
              <Image src="/logo.png" alt="Logo" width={200} height={50} priority />
            </Box>
          </Link>
          <Button color="inherit" component={Link} href="/" sx={{ fontWeight: "bold" }}>
            Home
          </Button>
          <Button color="inherit" component={Link} href="/about" sx={{ fontWeight: "bold" }}>
            About
          </Button>
          <Button color="inherit" component={Link} href="/catalog" sx={{ fontWeight: "bold" }}>
            Catalog
          </Button>
        </Box>

        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by NSN"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{borderRadius: 1 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
          <Button color="inherit" component={Link} href="/cart">
            <Badge badgeContent={selectedCount} color="error">
              <ShoppingCart />
            </Badge>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
