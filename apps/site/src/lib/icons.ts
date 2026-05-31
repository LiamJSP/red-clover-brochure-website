// apps/site/src/lib/icons.ts
export function getIconName(name?: string) {
  if (!name) return null;
  // Iconify expects "ph:icon-name" format. Phosphor uses kebab-case.
  return `ph:${name.toLowerCase()}`;
}
