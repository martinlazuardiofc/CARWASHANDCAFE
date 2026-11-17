'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  price: number; // base unit price
  imageUrl: string;
  category: string;
  variant?: string; // 'Hot' | 'Cold' | null
  variantPriceDiff?: number;
  addons: CartAddon[];
  notes?: string;
  quantity: number;
  discountValue?: number;
  discountType?: 'percentage' | 'nominal' | null;
}

interface CartContextType {
  items: CartItem[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  tableName: string;
  setTableName: (name: string) => void;
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateItem: (cartItemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxRate: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<string>('');
  const [tableName, setTableNameState] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const taxRate = 0.11; // 11%

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('asia_cart_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedTable = localStorage.getItem('asia_table_number');
      if (savedTable) {
        setTableNumberState(savedTable);
      }
      const savedTableName = localStorage.getItem('asia_table_name');
      if (savedTableName) {
        setTableNameState(savedTableName);
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('asia_cart_items', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  const setTableNumber = (num: string) => {
    setTableNumberState(num);
    try {
      localStorage.setItem('asia_table_number', num);
    } catch {}
  };

  const setTableName = (name: string) => {
    setTableNameState(name);
    try {
      localStorage.setItem('asia_table_name', name);
    } catch {}
  };

  const addItem = (item: Omit<CartItem, 'cartItemId'>) => {
    // Generate unique identifier based on product, variant, addons, notes
    const addonKey = item.addons.map((a) => a.id).sort().join('-');
    const cartItemId = `${item.productId}_${item.variant || 'none'}_${addonKey}_${encodeURIComponent(item.notes || '')}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += item.quantity;
        return next;
      } else {
        return [...prev, { ...item, cartItemId }];
      }
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateItem = (cartItemId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, ...updates } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('asia_cart_items');
    } catch {}
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let subtotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const addonsTotal = item.addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + (item.variantPriceDiff || 0) + addonsTotal;
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    if (item.discountType && item.discountValue) {
      if (item.discountType === 'percentage') {
        discountTotal += (itemSubtotal * item.discountValue) / 100;
      } else if (item.discountType === 'nominal') {
        discountTotal += item.discountValue * item.quantity;
      }
    }
  }

  discountTotal = Math.min(discountTotal, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxTotal = Math.round(taxableAmount * taxRate);
  const finalTotal = taxableAmount + taxTotal;

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        setTableNumber,
        tableName,
        setTableName,
        addItem,
        updateQuantity,
        removeItem,
        updateItem,
        clearCart,
        itemCount,
        subtotal,
        discountTotal,
        taxTotal,
        taxRate,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
