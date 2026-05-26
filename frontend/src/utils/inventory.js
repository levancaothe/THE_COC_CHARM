const getCharmId = (charm) => String(charm?._id ?? charm?.id ?? '');

export const getItemMaxQuantity = (item = {}) => {
  if (item.type === 'design' && Array.isArray(item.charms) && item.charms.length > 0) {
    const counts = new Map();
    const stockByCharmId = new Map();

    item.charms.forEach((charm) => {
      const charmId = getCharmId(charm);
      if (!charmId) return;

      counts.set(charmId, (counts.get(charmId) || 0) + 1);

      if (!stockByCharmId.has(charmId)) {
        stockByCharmId.set(charmId, Number(charm?.stock) || 0);
      }
    });

    let maxQuantity = Infinity;

    for (const [charmId, count] of counts.entries()) {
      const stock = Number(stockByCharmId.get(charmId)) || 0;
      maxQuantity = Math.min(maxQuantity, Math.floor(stock / count));
    }

    return Number.isFinite(maxQuantity) ? maxQuantity : 0;
  }

  const stock = Number(item.stock);
  if (Number.isFinite(stock)) {
    return Math.max(0, stock);
  }

  return Infinity;
};

export const clampItemQuantity = (item, quantity) => {
  const desiredQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const maxQuantity = getItemMaxQuantity(item);

  if (Number.isFinite(maxQuantity)) {
    return Math.min(desiredQuantity, maxQuantity);
  }

  return desiredQuantity;
};
