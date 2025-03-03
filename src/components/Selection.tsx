"use client";

import { Button } from "@mui/material";
import { useSelection } from "@/context/SelectionContext";

type SelectionButtonProps = {
  item: { id: string; name: string; nsn?: string; partNumber?: string };
};

export default function SelectionButton({ item }: SelectionButtonProps) {
  const { addItem, removeItem, selectedItems } = useSelection();
  const isSelected = selectedItems.some((selected) => selected.id === item.id);

  return (
    <Button
      variant="contained"
      color={isSelected ? "error" : "primary"}
      onClick={() => (isSelected ? removeItem(item.id) : addItem(item))}
      sx={{ fontWeight: "bold" }}
    >
      {isSelected ? "Remove from Cart" : "Add to Cart"}
    </Button>
  );
}
