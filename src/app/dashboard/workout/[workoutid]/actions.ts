"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  startedAt: z.string().datetime(),
});

export async function updateWorkoutAction(params: {
  workoutId: string;
  name: string;
  startedAt: string;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { workoutId, name, startedAt } = updateWorkoutSchema.parse(params);

  await updateWorkout(workoutId, userId, { name, startedAt: new Date(startedAt) });
  revalidatePath("/dashboard");
}
