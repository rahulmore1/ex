"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  startedAt: z.string().datetime(),
});

export async function createWorkoutAction(params: {
  name: string;
  startedAt: string;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { name, startedAt } = createWorkoutSchema.parse(params);

  await createWorkout(userId, { name, startedAt: new Date(startedAt) });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
