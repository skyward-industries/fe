"use client";

import { PartInfo } from "@/services/fetchPartInfo";
import { createContext, useContext, useState, ReactNode } from "react";


type SelectionContextType = {
  selectedItems: PartInfo[];
  addItem: (item: PartInfo) => void;
  removeItem: (id: string) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedItems, setSelectedItems] = useState<PartInfo[]>([]);

  const addItem = (item: PartInfo) => {
    setSelectedItems((prev) => {
      if (!prev.find((i) => i.part_number === item.part_number)) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const removeItem = (part_number: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.part_number !== part_number));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return (
    <SelectionContext.Provider value={{ selectedItems, addItem, removeItem, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection must be used within a SelectionProvider");
  return context;
};
