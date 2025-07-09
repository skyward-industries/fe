// src/context/SelectionContext.tsx
"use client"; // This context is client-side only

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your selected item (adjust as needed)
interface SelectedItem {
  id: string;
  name: string;
  part_number: string;
  // Add other properties like quantity, price, etc.
}

interface SelectionContextType {
  selectedItems: SelectedItem[];
  addItem: (item: SelectedItem) => void;
  removeItem: (id: string) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

interface SelectionProviderProps {
  children: ReactNode;
}

export const SelectionProvider: React.FC<SelectionProviderProps> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const addItem = (item: SelectedItem) => {
    setSelectedItems((prevItems) => {
      // Prevent duplicates, or update quantity if item already exists
      const exists = prevItems.some(i => i.id === item.id);
      if (!exists) {
        return [...prevItems, item];
      }
      return prevItems; // Item already exists, do nothing or update logic
    });
  };

  const removeItem = (id: string) => {
    setSelectedItems((prevItems) => prevItems.filter(item => item.id !== id));
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
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};