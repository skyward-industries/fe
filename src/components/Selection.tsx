"use client";

import { Button } from "@mui/material";
import { useSelection } from "@/context/SelectionContext";
// @ts-ignore
import { PartInfo } from "@/services/fetchPartInfo";

export default function SelectionButton({ item }: { item: PartInfo }) {
  const { addItem, removeItem, selectedItems } = useSelection();
  const isSelected = selectedItems.some((selected) => selected.part_number === item.part_number);

  return (
    <Button
      variant="contained"
      color={isSelected ? "error" : "primary"}
      onClick={() => (isSelected ? removeItem(item.part_number) : addItem(item))}
      sx={{ fontWeight: "bold" }}
    >
      {isSelected ? "Remove from Cart" : "Add to Cart"}
    </Button>
  );
}
