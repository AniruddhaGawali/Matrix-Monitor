"use client";

import { useEffect, type FC } from "react";
import Calendar from "../calender";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { baseFetchQuery } from "@/utils/baseFetchQuery";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDateSearchParam } from "@/hooks/use-date-search-param";
import { usePageSearchParam } from "@/hooks/use-page-search-param";

const Navbar: FC = ({}) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedDate, setSelectedDate } = useDateSearchParam();
  const { currentPage, decrementPage, incrementPage } = usePageSearchParam();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let shouldReplace = false;

    if (!params.get("date")) {
      params.set("date", dayjs(selectedDate).format("YYYY-MM-DD"));
      shouldReplace = true;
    }

    if (!params.get("page")) {
      params.set("page", String(currentPage));
      shouldReplace = true;
    }

    if (shouldReplace) {
      replace(`${pathname}?${params.toString()}`);
    }
  }, [currentPage, pathname, replace, searchParams, selectedDate]);

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
          <p className="text-[.6rem] text-twhite bg-tred px-1 py-0 rounded-sm animate-pulse">
            Live {<>{currentPage >= 2 && `(Top ${currentPage * 100})`}</>}
          </p>
        )}
      </div>
      {minMaxDateIsLoading || minMaxDateIsFetching ? (
        <>
          <i className="ri-loader-4-fill animate-spin"></i>
        </>
      ) : (
        <div className="flex gap-4 items-center">
          {dayjs(selectedDate).isSame(dayjs(), "day") && (
            <div className="bg-primary/20 px-3 py-1.5 rounded-sm gap-2 flex items-center">
              <button
                className="disabled:text-gray-500 cursor-pointer"
                onClick={decrementPage}
                disabled={currentPage <= 1}
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>

              <span className="text-sm font-mono">{currentPage}</span>

              <button
                className="disabled:text-gray-500 cursor-pointer"
                onClick={incrementPage}
                disabled={currentPage >= 10}
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          )}
          {minMaxDate && (
            <Calendar
              minDate={new Date(minMaxDate.minDate)}
              maxDate={new Date(minMaxDate.maxDate)}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
