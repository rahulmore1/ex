export default function EditWorkoutLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-56 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-10 w-full rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-20 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-10 w-full rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>

          <div className="flex gap-3">
            <div className="h-10 w-28 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-10 w-20 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
