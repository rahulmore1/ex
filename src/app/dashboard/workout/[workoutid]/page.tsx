import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

interface EditWorkoutPageProps {
  params: Promise<{ workoutid: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutid } = await params;
  const workout = await getWorkoutById(workoutid, userId);
  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Edit workout
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Update your workout details.
          </p>
        </div>

        <EditWorkoutForm
          workoutId={workout.id}
          defaultName={workout.name}
          defaultStartedAt={workout.startedAt.toISOString()}
        />
      </div>
    </div>
  );
}
