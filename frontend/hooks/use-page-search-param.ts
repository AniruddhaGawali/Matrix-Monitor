"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MIN_PAGE = 1;
const MAX_PAGE = 10;

function clampPage(page: number) {
  return Math.min(Math.max(page, MIN_PAGE), MAX_PAGE);
}

export function usePageSearchParam() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = useMemo(() => {
    const value = searchParams.get("page");
    if (!value) return MIN_PAGE;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return MIN_PAGE;

    return clampPage(parsed);
  }, [searchParams]);

  const setCurrentPage = useCallback(
    (page: number) => {
      const nextPage = clampPage(page);
      const params = new URLSearchParams(searchParams.toString());

      if (params.get("page") === String(nextPage)) return;

      params.set("page", String(nextPage));
      replace(`${pathname}?${params.toString()}`);
    },
    [pathname, replace, searchParams],
  );

  const incrementPage = useCallback(() => {
    setCurrentPage(currentPage + 1);
  }, [currentPage, setCurrentPage]);

  const decrementPage = useCallback(() => {
    setCurrentPage(currentPage - 1);
  }, [currentPage, setCurrentPage]);

  return {
    currentPage,
    decrementPage,
    incrementPage,
    setCurrentPage,
  };
}
