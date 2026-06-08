import React, { createContext, useContext, useState, useEffect } from "react";
import { clampItemQuantity, getItemMaxQuantity } from "../utils/inventory";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("charmify_cart");
      if (!localData) return [];
      const items = JSON.parse(localData);
      // Ensure all items have the selected property
      return items.map((item) => ({
        ...item,
        selected: item.selected ?? true,
      }));
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      localStorage.removeItem("charmify_cart");
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("charmify_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 🛠️ FIX: Extract type from item object if it exists, otherwise use fallback
  const addToCart = (item, typeFallback = "charm") => {
    const type = item.type || typeFallback;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i._id === item._id && i.type === type,
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        const existingItem = newItems[existingItemIndex];
        const maxQuantity = getItemMaxQuantity(existingItem);
        if (
          Number.isFinite(maxQuantity) &&
          existingItem.quantity >= maxQuantity
        ) {
          return prevItems;
        }

        existingItem.quantity = clampItemQuantity(
          existingItem,
          existingItem.quantity + 1,
        );
        // Move to top
        newItems.splice(existingItemIndex, 1);
        return [existingItem, ...newItems];
      }

      const nextItem = {
        ...item,
        type,
        quantity: clampItemQuantity({ ...item, type }, 1),
        selected: true,
      };
      if (getItemMaxQuantity(nextItem) === 0) {
        return prevItems;
      }

      // Prepend new item to top
      return [nextItem, ...prevItems];
    });
  };

  // 🛠️ FIX: Apply the same logic to updateCartItem
  const updateCartItem = (item, typeFallback = "charm") => {
    const type = item.type || typeFallback;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i._id === item._id && i.type === type,
      );

      if (existingItemIndex > -1) {
        return prevItems.map((currentItem) =>
          currentItem._id === item._id && currentItem.type === type
            ? {
                ...currentItem,
                ...item,
                type,
                selected: currentItem.selected ?? true,
              }
            : currentItem,
        );
      }

      const nextItem = {
        ...item,
        type,
        quantity: clampItemQuantity({ ...item, type }, 1),
        selected: true,
      };
      if (getItemMaxQuantity(nextItem) === 0) {
        return prevItems;
      }

      return [nextItem, ...prevItems];
    });
  };

  const toggleSelection = (id, type) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id && item.type === type
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  const removeFromCart = (id, type) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item._id === id && item.type === type)),
    );
  };

  const updateQuantity = (id, type, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id && item.type === type
          ? { ...item, quantity: clampItemQuantity(item, quantity) }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    return item.selected ? sum + item.price * item.quantity : sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItem,
        toggleSelection,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
