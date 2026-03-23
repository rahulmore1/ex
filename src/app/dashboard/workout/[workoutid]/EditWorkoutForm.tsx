"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "./actions";

interface EditWorkoutFormProps {
  workoutId: string;
  defaultName: string;
  defaultStartedAt: string;
}

export function EditWorkoutForm({
  workoutId,
  defaultName,
  defaultStartedAt,
}: EditWorkoutFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const startedAt = (form.elements.namedItem("startedAt") as HTMLInputElement).value;

    setError(null);
    setPending(true);
    try {
      await updateWorkoutAction({
        workoutId,
        name,
        startedAt: new Date(startedAt).toISOString(),
      });
      router.push("/dashboard");
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const localStartedAt = new Date(defaultStartedAt).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder="e.g. Morning Push"
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedAt">Started at</Label>
        <Input
          id="startedAt"
          name="startedAt"
          type="datetime-local"
          defaultValue={localStartedAt}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
