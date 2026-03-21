import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Pagination Controls ────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  totalItems?: number;
  fromItem?: number;
  toItem?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  totalItems,
  fromItem,
  toItem,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1 && !totalItems) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
      <div className="text-xs text-muted-foreground">
        {totalItems ? (
          <span>
            Showing <span className="font-semibold">{fromItem ?? 0}</span> to{" "}
            <span className="font-semibold">{toItem ?? 0}</span> of{" "}
            <span className="font-semibold">{totalItems}</span> entries
          </span>
        ) : (
          <span>
            Page {currentPage} of {lastPage}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 -ml-1" />
          Prev
        </button>

        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="h-8 rounded-lg border border-border bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 -mr-1" />
        </button>
      </div>
    </div>
  );
}
