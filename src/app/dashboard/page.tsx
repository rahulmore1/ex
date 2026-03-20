"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Placeholder workout data — replace with real data fetching
const MOCK_WORKOUTS = [
  {
    id: 1,
    date: new Date(),
    name: "Morning Run",
    duration: "32 min",
    category: "Cardio",
  },
  {
    id: 2,
    date: new Date(),
    name: "Upper Body Strength",
    duration: "45 min",
    category: "Strength",
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  const workouts = MOCK_WORKOUTS.filter(
    (w) => format(w.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            View your logged workouts by date.
          </p>
        </div>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger
            render={
              <button
                className={cn(
                  "inline-flex w-[220px] items-center justify-start gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm font-normal dark:border-zinc-700 dark:bg-zinc-900",
                  !date && "text-zinc-400"
                )}
              />
            }
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {date ? format(date, "do MMM yyyy") : "Pick a date"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}

            />
          </PopoverContent>
        </Popover>

        {/* Workout List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Workouts — {format(date, "do MMM yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-zinc-400 dark:text-zinc-500 text-sm">
              No workouts logged for this date.
            </div>
          ) : (
            <ul className="space-y-2">
              {workouts.map((workout) => (
                <li
                  key={workout.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {workout.name}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {workout.category}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {workout.duration}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
