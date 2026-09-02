export function assetUrl(path: string, basePath = '/') {
  const normalizedBase = `/${basePath.split('/').filter(Boolean).join('/')}`;
  const normalizedPath = path.split('/').filter(Boolean).join('/');

  return normalizedBase === '/'
    ? `/${normalizedPath}`
    : `${normalizedBase}/${normalizedPath}`;
}
