"use client";

import type { FC } from "react";
import Calendar from "../calender";
import { useSelectedDateState } from "@/store/use-date-store";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { baseFetchQuery } from "@/utils/baseFetchQuery";

const Navbar: FC = ({}) => {
  const { selectedDate } = useSelectedDateState();

  const {
    data: minMaxDate,
    isLoading: minMaxDateIsLoading,
    isFetching: minMaxDateIsFetching,
  } = useQuery({
    queryKey: ["minMaxDate"],
    queryFn: baseFetchQuery(
      "/Attacks/min-max-date",
      "GET",
      undefined,
      undefined,
      {
        "X-TimeZone-Id": Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    ),
    select: (resp) => resp.data as { minDate: string; maxDate: string },
  });

  return (
    <div className="absolute w-full to-0 left-0 z-10 p-4 flex justify-between items-center">
      <div className="flex gap-2 items-start justify-center">
        <h1>MATRIX MONITOR</h1>
        {dayjs(selectedDate).isSame(dayjs(), "day") && (
          <p className="text-[.6rem] text-twhite bg-tred px-1 py-0 rounded-sm ">
            Live
          </p>
        )}
      </div>
      {minMaxDateIsLoading || minMaxDateIsFetching ? (
        <>
          <i className="ri-loader-4-fill animate-spin"></i>
        </>
      ) : (
        <>
          {minMaxDate && (
            <Calendar
              minDate={new Date(minMaxDate.minDate)}
              maxDate={new Date(minMaxDate.maxDate)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Navbar;
