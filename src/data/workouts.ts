import { db } from "@/index";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
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
