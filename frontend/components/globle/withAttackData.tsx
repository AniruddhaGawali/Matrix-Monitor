"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { baseFetchQuery } from "@/utils/baseFetchQuery";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useSelectedDateState } from "@/store/use-date-store";

interface WithAttackDataProps {
  attacks: Attack[];
}

export function withAttackData<P extends object>(
  WrappedComponent: React.ComponentType<P & WithAttackDataProps>,
) {
  return function EnhancedComponent(props: P) {
    const { selectedDate } = useSelectedDateState((state) => state);
    const isSelectedDateIsToday = dayjs(selectedDate).isSame(new Date(), "day");

    const { data: liveAttacksData, error: liveAttacksError } = useQuery<
      any,
      Error,
      Attack[]
    >({
      queryKey: ["liveAttacks"],
      queryFn: baseFetchQuery("/Attacks?limit=100&page=1", "GET"),
      select: (resp) => resp.data as Attack[],
      enabled: isSelectedDateIsToday,
    });

    const historicalDate = dayjs(selectedDate).format("YYYY-MM-DD");

    const { data: historicalAttacksData, error: historicalAttacksError } =
      useQuery<any, Error, Attack[]>({
        queryKey: ["historical", historicalDate],
        queryFn: baseFetchQuery(
          `/Attacks/historical-data?dateTime=${historicalDate}`,
          "GET",
        ),
        select: (resp) => resp.data as Attack[],
        enabled: !!selectedDate && !isSelectedDateIsToday,
      });

    const data = isSelectedDateIsToday
      ? liveAttacksData
      : historicalAttacksData;

    const error = isSelectedDateIsToday
      ? liveAttacksError
      : historicalAttacksError;

    useEffect(() => {
      if (error) {
        toast.error("Failed to fetch live attack data.");
      }
    }, [error]);

    return <WrappedComponent {...props} attacks={data ?? []} />;
  };
}
