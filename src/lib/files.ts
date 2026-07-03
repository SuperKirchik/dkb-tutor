export function fileNameFromPath(path: string) {
  return decodeURIComponent(path.split("/").pop() ?? path);
}

export function materialList(value?: string | null) {
  if (!value?.trim()) return [];

  const trimmed = value.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Old records store a single path; newer records can store newline-separated paths.
  }

  return trimmed
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function appendMaterialFiles(current: string | null | undefined, files: string[]) {
  const next = [...materialList(current), ...files.filter(Boolean)];
  return Array.from(new Set(next)).join("\n");
}

export function materialHref(path: string) {
  if (path.startsWith("/uploads/materials/")) {
    return `/api/uploads/materials/${encodeURIComponent(fileNameFromPath(path))}`;
  }
  if (path.startsWith("/")) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `/api/uploads/materials/${encodeURIComponent(path)}`;
}
