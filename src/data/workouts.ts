import { db } from "@/index";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return result[0] ?? null;
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  data: { name: string; startedAt: Date }
) {
  const [updated] = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function createWorkout(
  userId: string,
  data: { name: string; startedAt: Date }
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name: data.name, startedAt: data.startedAt })
    .returning();
  return workout;
}
