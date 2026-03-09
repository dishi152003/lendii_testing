"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("lendii-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("lendii-cart", JSON.stringify(cart));
  }, [cart]);

  const addToBag = (product, rentalDetails) => {
    setCart((prevCart) => {
      // Check if item with same ID and rental dates already exists
      const existingItemIndex = prevCart.findIndex(
        (item) => 
          item.id === product.id && 
          item.startDate === rentalDetails.startDate && 
          item.endDate === rentalDetails.endDate
      );

      if (existingItemIndex > -1) {
        // We could increment quantity if it was a normal sale, 
        // but for rentals it's usually one-off per period.
        return prevCart; 
      }

      return [...prevCart, { ...product, ...rentalDetails }];
    });
  };

  const removeFromBag = (id, startDate, endDate) => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.id === id && item.startDate === startDate && item.endDate === endDate)
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToBag, removeFromBag, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
