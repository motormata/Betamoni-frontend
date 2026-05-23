export type SearchParamValue = string | number | null | undefined;

export function parsePageSearchParam(
  value: string | null | undefined,
  fallback = 1,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function getSearchParamValue(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const value = searchParams.get(key)?.trim();
  return value ? value : undefined;
}

export function updateSearchParams(
  currentSearchParams: URLSearchParams,
  updates: Record<string, SearchParamValue>,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") {
      nextSearchParams.delete(key);
      continue;
    }

    if (key === "page" && Number(value) <= 1) {
      nextSearchParams.delete(key);
      continue;
    }

    nextSearchParams.set(key, String(value));
  }

  return nextSearchParams;
}

export function hasTrackedSearchParams(
  searchParams: URLSearchParams,
  trackedKeys: string[],
): boolean {
  return trackedKeys.some((key) => {
    const value = searchParams.get(key);
    return value != null && value !== "";
  });
}
