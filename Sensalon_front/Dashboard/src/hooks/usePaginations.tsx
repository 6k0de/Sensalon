import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const { pageItems, totalPages, totalItems } = useMemo(() => {
    const totalItems = items?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    return { pageItems, totalPages, totalItems };
  }, [items, page, pageSize]);

  const goToPage = (p: number) => {
    setPage(() => {
      const total = Math.max(1, Math.ceil((items?.length ?? 0) / pageSize));
      if (p < 1) return 1;
      if (p > total) return total;
      return p;
    });
  };

  const next = () => goToPage(page + 1);
  const prev = () => goToPage(page - 1);

  const reset = () => {
    setPage(1);
  };

  return {
    page,
    pageSize,
    setPageSize,
    pageItems,
    totalPages,
    totalItems,
    next,
    prev,
    goToPage,
    reset,
  };
}
