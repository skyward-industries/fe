"use client";

import { fetchGroups } from "@/services/fetchGroups";
import { fetchSubgroups } from "@/services/fetchSubgroups";
import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function FSCDropdown() {
  const [groups, setGroups] = useState<any[]>([]);
  const [subgroups, setSubgroups] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchGroups().then(setGroups);
  }, []);

  const handleFSCClick = (e: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
      setSelectedGroupId(null);
      setSubgroups([]);
    } else {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleGroupClick = async (groupId: string) => {
    if (groupId === selectedGroupId) {
      setSelectedGroupId(null);
      setSubgroups([]);
      return;
    }

    setSelectedGroupId(groupId);
    setLoadingSubs(true);
    const subs = await fetchSubgroups(groupId);
    setSubgroups(subs);
    setLoadingSubs(false);
  };

  return (
    <Box sx={{ position: "relative", p: 2 }}>
      <Button onClick={handleFSCClick} sx={{ cursor: "pointer" }}>
        <Typography
          sx={{
            px: 2,
            py: 1,
            fontWeight: "bold",
            color: "white",
          }}
        >
          FSC
        </Typography>
        <KeyboardArrowDown sx={{ color: "white" }} />
      </Button>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        disablePortal
        sx={{ zIndex: 9999 }}
      >
        <Paper elevation={3} sx={{ display: "flex" }}>
          <List
            dense
            sx={{ width: 500, maxHeight: "70vh", overflowY: "scroll", p: 2 }}
          >
            {groups.map((group) => (
              <>
                <ListItem
                  key={group.id}
                  onClick={() => handleGroupClick(group.fsg)}
                  selected={selectedGroupId === group.fsg}
                  sx={{
                    cursor: "pointer",
                    whiteSpace: "normal",
                    "&.Mui-selected": {
                      bgcolor: "grey.900",
                      color: "white",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "grey.800",
                    },
                    "&:hover": { bgcolor: "grey.800" },
                  }}
                >
                  <Typography>{group.fsg_title}</Typography>
                </ListItem>
                <Divider />
              </>
            ))}
          </List>

          {selectedGroupId && (
            <Box sx={{ width: 350, p: 2 }}>
              {loadingSubs ? (
                <Box p={2} display="flex" justifyContent="center">
                  <CircularProgress size={24} />
                </Box>
              ) : subgroups.length > 0 ? (
                <List dense sx={{ maxHeight: "70vh", overflowY: "scroll" }}>
                  {subgroups.map((sub) => (
                    <>
                    <ListItem
                      key={sub.id}
                      sx={{
                        cursor: "pointer",
                        whiteSpace: "normal",
                        "&:hover": { bgcolor: "grey.800" },
                      }}
                    >
                      <Link
                        href={`/catalog/${selectedGroupId}/${encodeURIComponent(
                          sub.fsc_title.replace(/\s+/g, "-").toLowerCase()
                        )}`}
                        onClick={() => {
                          setAnchorEl(null);
                          setSelectedGroupId(null);
                        }}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Typography variant="body2">{sub.fsc_title}</Typography>
                      </Link>
                    </ListItem>
                    <Divider/>
                    </>
                  ))}
                </List>
              ) : (
                <Box p={2}>
                  <Typography variant="body2">
                    No subgroups available.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}
