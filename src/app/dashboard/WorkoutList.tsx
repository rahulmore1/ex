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

type Workout = {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
};

export default function WorkoutList({ workouts }: { workouts: Workout[] }) {
  const [date, setDate] = useState<Date>(new Date());

  const filtered = workouts.filter(
    (w) =>
      format(new Date(w.startedAt), "yyyy-MM-dd") ===
      format(date, "yyyy-MM-dd")
  );

  return (
    <>
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

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-zinc-400 dark:text-zinc-500 text-sm">
            No workouts logged for this date.
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((workout) => (
              <li
                key={workout.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {workout.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {format(new Date(workout.startedAt), "h:mm a")}
                  </p>
                </div>
                {workout.completedAt && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {Math.round(
                      (new Date(workout.completedAt).getTime() -
                        new Date(workout.startedAt).getTime()) /
                        60000
                    )}{" "}
                    min
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
