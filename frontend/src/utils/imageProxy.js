const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return baseUrl.replace(/\/$/, '');
};

export const createInstanceId = () =>
  `instance-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const stripCharmMeta = (charm) => {
  if (!charm) return charm;
  const cleanCharm = { ...charm };
  delete cleanCharm.instanceId;
  delete cleanCharm.isDefault;
  return cleanCharm;
};

export const normalizeText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const getCategoryName = (charm, categories = []) => {
  if (typeof charm?.category === "object" && charm?.category?.name) {
    return charm.category.name;
  }

  const categoryId = charm?.category?._id || charm?.category;
  return categories.find((category) => category._id === categoryId)?.name || "";
};

export const isBaseCharm = (charm, categories = []) => {
  const BASE_CHARM_KEYWORDS = [
    "cơ bản",
    "co ban",
    "basic",
    "base",
    "mặc định",
    "mac dinh",
    "default",
  ];
  const charmName = normalizeText(charm?.name);
  const categoryName = normalizeText(getCategoryName(charm, categories));

  return BASE_CHARM_KEYWORDS.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return (
      charmName.includes(normalizedKeyword) ||
      categoryName.includes(normalizedKeyword)
    );
  });
};

export const isPendantCharm = (charm) => {
  return Boolean(charm?.isPendant);
};

export const getProxyImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  if (/^https?:\/\//i.test(imageUrl)) {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) return imageUrl;

    const proxyBase = apiBaseUrl.endsWith('/api')
      ? apiBaseUrl
      : `${apiBaseUrl}/api`;

    return `${proxyBase}/proxy/image?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
};
