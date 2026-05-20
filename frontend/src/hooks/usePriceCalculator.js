import { useState, useEffect } from 'react';

export const usePriceCalculator = (selectedCharms) => {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const total = selectedCharms.reduce((sum, charm) => sum + (charm.price || 0), 0);
    setTotalPrice(total);
  }, [selectedCharms]);

  return totalPrice;
};
