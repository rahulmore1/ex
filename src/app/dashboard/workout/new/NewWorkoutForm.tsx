"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutAction } from "./actions";

export function NewWorkoutForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const startedAt = (form.elements.namedItem("startedAt") as HTMLInputElement).value;

    setPending(true);
    await createWorkoutAction({ name, startedAt: new Date(startedAt).toISOString() });
    setPending(false);
  }

  const now = new Date().toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input
          id="name"
          name="name"
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
          defaultValue={now}
          required
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create workout"}
      </Button>
    </form>
  );
}
