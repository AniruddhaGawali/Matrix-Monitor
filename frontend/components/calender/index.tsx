"use client";

import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState, type FC } from "react";

interface CalendarProps {
  minDate?: Date;
  maxDate?: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const days = "SMTWTFS";

function formatDateLabel(input: Date | string): string {
  const date = input instanceof Date ? input : new Date(input);
  return dayjs(date).format("MMMM DD, YYYY");
}

function datesInMonth(month: number, year: number) {
  const firstDayOfMonth = dayjs().year(year).month(month).startOf("month");
  const lastDayOfMonth = dayjs().year(year).month(month).endOf("month");

  // Calculate how many days from the previous month to show
  // day() returns 0 (Sun) to 6 (Sat)
  const prefixDays = firstDayOfMonth.day();

  const calendarDays: {
    date: Dayjs;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];
  const today = dayjs();

  // 1. Fill Prefix days (Previous Month)
  for (let i = prefixDays; i > 0; i--) {
    const date = firstDayOfMonth.subtract(i, "day");
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: date.isSame(today, "day"),
    });
  }

  // 2. Fill Current Month days
  for (let i = 0; i < firstDayOfMonth.daysInMonth(); i++) {
    const date = firstDayOfMonth.add(i, "day");
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: date.isSame(today, "day"),
    });
  }

  // 3. Fill Postfix days (Next Month) to reach 42 days (6 rows of 7)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = lastDayOfMonth.add(i, "day");
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isToday: date.isSame(today, "day"),
    });
  }

  return calendarDays;
}

function CalendarPopup({
  minDate,
  maxDate,
  selectedDate = new Date(),
  onDateChange,
}: {
  minDate?: Date;
  maxDate?: Date;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs(selectedDate));
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDate(dayjs(selectedDate));
  }, [selectedDate]);

  const minDay = useMemo(
    () => (minDate ? dayjs(minDate).startOf("day") : null),
    [minDate],
  );
  const maxDay = useMemo(
    () => (maxDate ? dayjs(maxDate).endOf("day") : null),
    [maxDate],
  );
  const currentYear = dayjs().year();
  const minYear = minDay ? minDay.year() : currentYear - 10;
  const maxYear = maxDay ? maxDay.year() : currentYear + 10;
  const yearOptions = useMemo(() => {
    const startYear = Math.min(minYear, maxYear);
    const endYear = Math.max(minYear, maxYear);
    const years: number[] = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  }, [minYear, maxYear]);

  const canGoPrevMonth = useMemo(() => {
    if (!minDay) return true;
    return currentDate
      .startOf("month")
      .isAfter(minDay.startOf("month"), "month");
  }, [currentDate, minDay]);

  const canGoNextMonth = useMemo(() => {
    if (!maxDay) return true;
    return currentDate
      .startOf("month")
      .isBefore(maxDay.startOf("month"), "month");
  }, [currentDate, maxDay]);

  const isDisabledDate = (date: Dayjs) => {
    if (minDay && date.isBefore(minDay, "day")) return true;
    if (maxDay && date.isAfter(maxDay, "day")) return true;
    return false;
  };

  const previousMonth = () => {
    if (!canGoPrevMonth) return;
    setIsYearSelectOpen(false);
    setCurrentDate((prev) => prev.subtract(1, "month"));
  };

  const nextMonth = () => {
    if (!canGoNextMonth) return;
    setIsYearSelectOpen(false);
    setCurrentDate((prev) => prev.add(1, "month"));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate((previous) => {
      const base = previous.year(year);
      const safeDay = Math.min(previous.date(), base.daysInMonth());
      let nextDate = base.date(safeDay);

      if (minDay && nextDate.isBefore(minDay, "day")) {
        nextDate = minDay.startOf("day");
      }
      if (maxDay && nextDate.isAfter(maxDay, "day")) {
        nextDate = maxDay.startOf("day");
      }

      return nextDate;
    });
    setIsYearSelectOpen(false);
  };

  const currentDateYear = currentDate.year();
  const currentDateMonth = currentDate.month();
  const totalDaysInMonth = datesInMonth(currentDateMonth, currentDateYear);

  const handleDateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const dayElement = target.closest("[data-date]");

    if (dayElement) {
      const dateKey = dayElement.getAttribute("data-date");
      if (dateKey) {
        const selectedDay = dayjs(dateKey);
        if (!selectedDay.isValid() || isDisabledDate(selectedDay)) return;
        if (onDateChange) {
          onDateChange(selectedDay.toDate());
        }
        setIsYearSelectOpen(false);
      }
    }
  };

  useEffect(() => {
    const closeYearDropdownOnOutsideClick = (event: MouseEvent) => {
      if (!isYearSelectOpen) return;
      if (!yearDropdownRef.current) return;

      if (!yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearSelectOpen(false);
      }
    };

    document.addEventListener("mousedown", closeYearDropdownOnOutsideClick);
    return () => {
      document.removeEventListener(
        "mousedown",
        closeYearDropdownOnOutsideClick,
      );
    };
  }, [isYearSelectOpen]);

  return (
    <div className="absolute top-12 right-0 w-85 h-85 rounded-sm bg-transparent">
      <div className="terminal-box w-full h-full bg-transparent">
        <div className="corner top-left">+</div>
        <div className="corner top-right">+</div>
        <div className="corner bottom-left">+</div>
        <div className="corner bottom-right">+</div>

        <div className="p-4 gap-2 flex flex-col overflow-visible">
          <div className="flex items-center justify-between mb-1">
            <button
              type="button"
              onClick={previousMonth}
              disabled={!canGoPrevMonth}
              className="h-8 w-8 rounded-sm grid place-items-center hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous month"
            >
              <i className="ri-arrow-left-s-line" />
            </button>
            <div className="flex items-center gap-1 text-sm font-bold overflow-visible">
              <span>{currentDate.format("MMMM")}</span>
              <div className="relative inline-block" ref={yearDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsYearSelectOpen((previous) => !previous)}
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-1 hover:bg-primary/20 cursor-pointer"
                  aria-label="Select year"
                >
                  <span>{currentDateYear}</span>
                  <i
                    className={`ri-arrow-down-s-line transition-transform ${isYearSelectOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isYearSelectOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 max-sm:left-auto max-sm:right-0 max-sm:translate-x-0 z-50 w-24 max-h-40 overflow-y-auto rounded-sm bg-background p-1 pointer-events-auto">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearChange(year)}
                        className={`w-full rounded-sm px-2 py-1 text-center text-xs hover:bg-primary/20 hover:text-twhite ${year === currentDateYear ? "bg-primary text-tblack" : ""}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNextMonth}
              className="h-8 w-8 rounded-sm grid place-items-center hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next month"
            >
              <i className="ri-arrow-right-s-line" />
            </button>

            <button
              type="button"
              onClick={() => {
                const today = dayjs();
                if (isDisabledDate(today)) return;
                if (onDateChange) {
                  onDateChange(today.toDate());
                }
                setCurrentDate(today);
                setIsYearSelectOpen(false);
              }}
              className="ml-2 px-2 py-1 rounded-sm text-xs hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              disabled={isDisabledDate(dayjs())}
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.split("").map((day, index) => (
              <span
                className="grid place-items-center font-black"
                key={day + index}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2" onClick={handleDateClick}>
            {totalDaysInMonth.map((date) => (
              <button
                type="button"
                key={date.date.format("YYYY-MM-DD")}
                data-date={date.date.format("YYYY-MM-DD")}
                disabled={isDisabledDate(date.date)}
                className={`grid place-items-center h-8 w-8 relative rounded-sm hover:underline underline-offset-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${date.date.isSame(selectedDate, "day") && "terminal-box"} ${!date.isCurrentMonth && "text-primary/20"} ${date.isToday && "bg-tred/50 text-twhite"}`}
              >
                {date.date.date()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Calendar: FC<CalendarProps> = ({
  minDate,
  maxDate,
  selectedDate,
  onDateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!calendarRef.current) return;
      if (!calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={calendarRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-primary/20 px-3 py-1.5 rounded-sm cursor-pointer gap-2 flex items-center"
      >
        <i className="ri-calendar-line"></i>
        {selectedDate && (
          <span className="text-xs">{formatDateLabel(selectedDate)}</span>
        )}
      </button>
      {isOpen && (
        <CalendarPopup
          minDate={minDate}
          maxDate={maxDate}
          onDateChange={(date) => {
            onDateChange(date);
            setIsOpen(false);
          }}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Calendar;
