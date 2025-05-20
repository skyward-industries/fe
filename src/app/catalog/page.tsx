"use client";

import { useEffect, useState } from "react";
import { fetchGroups, Group } from "@/services/fetchGroups";
import { slugify } from "@/utils/slugify";
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import Link from "next/link";

export default function CatalogPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchGroups().then(setGroups);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Product Groups
      </Typography>
      <Typography
        variant="subtitle1"
        color="textSecondary"
        textAlign="center"
        gutterBottom
      >
        Explore our diverse range of industry-leading product groups.
      </Typography>

      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 3,
            height: "100vh",
            overflowY: "scroll",
          }}
        >
          {groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id} variant="outlined" sx={{ borderRadius: 2, minHeight: "240px" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {group.fsg_title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ my: 1 }}
                  >
                    {group.fsc_inclusions || "No description available"}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    component={Link}
                    href={`/catalog/${group.fsg}/${slugify(group.fsg_title)}`}
                  >
                    View Subgroups
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography
              variant="h6"
              color="error"
              textAlign="center"
              sx={{ mt: 4 }}
            >
              No groups found.
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ height: "100vh", overflowY: "scroll", borderRadius: 2, mt: 3 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.dark" }}>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Group Name
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                  Description
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length > 0 ? (
                groups.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell>{group.fsg_title}</TableCell>
                    <TableCell>
                      {group.fsc_inclusions || "No description available"}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                        component={Link}
                        href={`/catalog/${group.fsg}/${slugify(
                          group.fsg_title
                        )}`}
                      >
                        View Subgroups
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography variant="h6" color="error">
                      No groups found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
