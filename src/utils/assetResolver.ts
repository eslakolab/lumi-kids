// Resolves static /src/assets/images/* paths into Vite-bundled hashed /assets/* URLs in production
const bundledAssets = import.meta.glob<string>(
  '/src/assets/images/*.{jpg,jpeg,png,webp,svg}',
  { eager: true, import: 'default' }
);

export function resolveAssetUrl(path?: string): string {
  if (!path) return '';
  if (bundledAssets[path]) {
    return bundledAssets[path];
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (bundledAssets[normalized]) {
    return bundledAssets[normalized];
  }
  return path;
}
