// ── Common Primitive Types ─────────────────────────────────────────
// Shared aliases used across every feature module.
// Import from here instead of using plain `string` for identifiers.

/**
 * UUID — universally unique identifier string.
 *
 * All entity IDs returned by the BetaMoni backend are v7 UUIDs.
 * Use this type instead of `string` for every `id`, `*_id` field,
 * and any endpoint path parameter that represents an entity ID.
 */
export type UUID = string;

// ── Pagination Wrapper ─────────────────────────────────────────────
// Mirrors the Laravel paginator shape returned by list endpoints.

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  last_page: number;
  last_page_url: string | null;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  per_page: number;
  from: number;
  to: number;
  total: number;
}
