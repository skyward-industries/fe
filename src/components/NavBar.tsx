"use client";

import Link from "next/link";
import { AppBar, Toolbar, Button } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} href="/">
          Home
        </Button>
        <Button color="inherit" component={Link} href="/about">
          About
        </Button>
        <Button color="inherit" component={Link} href="/catalog">
          Catalog
        </Button>
      </Toolbar>
    </AppBar>
  );
}