"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Item = {
  id: string;
  name: string;
  nsn?: string;
  partNumber?: string;
};

type SelectionContextType = {
  selectedItems: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  clearSelection: () => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const addItem = (item: Item) => {
    setSelectedItems((prev) => {
      if (!prev.find((i) => i.id === item.id)) {
        return [...prev, item];
      }
      return prev; // Avoid duplicates
    });
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
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
