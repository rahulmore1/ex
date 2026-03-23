"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EditWorkoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {error.message ?? "An unexpected error occurred while loading this workout."}
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
