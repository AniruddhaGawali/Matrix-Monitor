"use client";

import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useDateSearchParam() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedDate = useMemo(() => {
    const value = searchParams.get("date");
    if (!value) {
      return dayjs().startOf("day").toDate();
    }

    const parsed = dayjs(value);
    return parsed.isValid()
      ? parsed.startOf("day").toDate()
      : dayjs().startOf("day").toDate();
  }, [searchParams]);

  const setSelectedDate = useCallback(
    (date: Date) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextDate = dayjs(date).format("YYYY-MM-DD");

      if (params.get("date") === nextDate) return;

      params.set("date", nextDate);
      replace(`${pathname}?${params.toString()}`);
    },
    [pathname, replace, searchParams],
  );

  return { selectedDate, setSelectedDate };
}
