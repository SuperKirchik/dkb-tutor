export function fileNameFromPath(path: string) {
  return decodeURIComponent(path.split("/").pop() ?? path);
}

export function materialHref(path: string) {
  if (path.startsWith("/uploads/materials/")) {
    return `/api/uploads/materials/${encodeURIComponent(fileNameFromPath(path))}`;
  }
  if (path.startsWith("/")) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `/api/uploads/materials/${encodeURIComponent(path)}`;
}
