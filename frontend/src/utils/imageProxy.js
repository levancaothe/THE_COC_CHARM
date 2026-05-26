const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return baseUrl.replace(/\/$/, '');
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
