"use client";

import { useGlobeStore } from "@/store/use-globe-store";
import { baseFetchQuery } from "@/utils/baseFetchQuery";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useDateSearchParam } from "@/hooks/use-date-search-param";
import { usePageSearchParam } from "@/hooks/use-page-search-param";

function Iplist() {
  const { setTargetLocation, targetLocation } = useGlobeStore((state) => state);
  const { selectedDate } = useDateSearchParam();
  const { currentPage } = usePageSearchParam();
  const isSelectedDateIsToday = dayjs(selectedDate).isSame(new Date(), "day");

  const {
    data: liveAttacksData,
    error: liveAttacksError,
    isLoading: liveAttacksIsLoading,
    isFetching: liveAttacksIsFetching,
  } = useQuery<{ data: Attack[] }, Error, Attack[]>({
    queryKey: ["liveAttacks", currentPage],
    queryFn: baseFetchQuery("/Attacks?limit=100&page=" + currentPage, "GET"),
    select: (resp) => resp.data as Attack[],
    enabled: isSelectedDateIsToday,
  });

  const historicalDate = dayjs(selectedDate).format("YYYY-MM-DD");

  const {
    data: historicalAttacksData,
    error: historicalAttacksError,
    isLoading: historicalAttacksIsLoading,
    isFetching: historicalAttacksIsFetching,
  } = useQuery<{ data: Attack[] }, Error, Attack[]>({
    queryKey: ["historical", historicalDate],
    queryFn: baseFetchQuery(
      `/Attacks/historical-data?dateTime=${historicalDate}`,
      "GET",
    ),
    select: (resp) => resp.data as Attack[],
    enabled: !!selectedDate && !isSelectedDateIsToday,
  });

  const data = isSelectedDateIsToday ? liveAttacksData : historicalAttacksData;
  const isLoading = isSelectedDateIsToday
    ? liveAttacksIsLoading
    : historicalAttacksIsLoading;
  const isFetching = isSelectedDateIsToday
    ? liveAttacksIsFetching
    : historicalAttacksIsFetching;
  const error = isSelectedDateIsToday
    ? liveAttacksError
    : historicalAttacksError;

  if (isFetching || isLoading) {
    return (
      <div className="absolute -translate-y-1/2 top-1/2 left-4 w-1/4 h-2/3 max-w-100 z-50">
        <div className="terminal-box h-full w-full p-4 flex flex-col">
          <div className="corner top-left">+</div>
          <div className="corner top-right">+</div>
          <div className="corner bottom-left">+</div>
          <div className="corner bottom-right">+</div>

          {/* Title always at top */}
          <h2 className="text-2xl font-bold mb-4 text-center shrink-0">
            Attackers IP List
          </h2>

          {/* Remaining space centers content */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute -translate-y-1/2 top-1/2 left-4 w-1/4 h-2/3 z-10 max-w-100">
        <div className="terminal-box h-full w-full p-4 flex flex-col">
          <div className="corner top-left">+</div>
          <div className="corner top-right">+</div>
          <div className="corner bottom-left">+</div>
          <div className="corner bottom-right">+</div>

          {/* Title always at top */}
          <h2 className="text-2xl font-bold mb-4 text-center shrink-0">
            Attackers IP List
          </h2>

          {/* Remaining space centers content */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-lg text-red-500">
              Error fetching data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="absolute -translate-y-1/2 top-1/2 left-4 w-1/4 h-2/3 z-10 max-w-100">
        <div className="terminal-box h-full w-full p-4 flex flex-col">
          <div className="corner top-left">+</div>
          <div className="corner top-right">+</div>
          <div className="corner bottom-left">+</div>
          <div className="corner bottom-right">+</div>

          {/* Title always at top */}
          <h2 className="text-2xl font-bold mb-4 text-center shrink-0">
            Attackers IP List
          </h2>

          {/* Remaining space centers content */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-lg">
              No attacks found for this date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute -translate-y-1/2 top-1/2 left-4 w-1/4 h-2/3 z-10 max-w-100">
      <div className="terminal-box h-full w-full p-4 flex flex-col">
        <div className="corner top-left">+</div>
        <div className="corner top-right">+</div>
        <div className="corner bottom-left">+</div>
        <div className="corner bottom-right">+</div>

        <h2 className="text-2xl font-bold mb-4 text-center shrink-0 flex items-center justify-center flex-col">
          Attackers IP List
          {isSelectedDateIsToday && (
            <span className="ml-2 text-sm font-normal text-green-400">
              {(currentPage - 1) * 100} - {currentPage * 100}
            </span>
          )}
        </h2>

        <ul
          className="overflow-y-auto flex-1 min-h-0"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "LI") {
              const ip = target.textContent.split(". ")[1].trim() || "";
              const attack = data?.find((a) => a.ipAddress === ip);
              if (attack) {
                setTargetLocation(attack);
              }
            }
          }}
        >
          {data?.map((attack, index) => (
            <li
              key={index}
              className={`mb-2 p-2 bg-gray-800 rounded text-sm break-all cursor-pointer font-semibold ${
                targetLocation &&
                targetLocation.latitude === attack.latitude &&
                targetLocation.longitude === attack.longitude
                  ? "border-l-4 border-primary rounded-l-sm"
                  : "hover:bg-gray-700"
              }`}
            >
              {index + 1}. {attack.ipAddress}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Iplist;
