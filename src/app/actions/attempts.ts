"use server";
import { revalidatePath } from "next/cache";
import { mutate } from "@/lib/store";
import { slugFromUrl } from "@/lib/logic";
import { Attempt } from "@/lib/types";

export type AttemptInput = Omit<Attempt, "id" | "problem_slug">;

export async function addAttempt(input: AttemptInput) {
  if (!input.problem_title.trim()) throw new Error("Title required");
  if (input.outcome !== "solved_clean" && !input.blocker.trim()) throw new Error("Blocker required when not solved clean");
  await mutate((s) => {
    s.attempts.push({ id: crypto.randomUUID(), problem_slug: slugFromUrl(input.url, input.problem_title), ...input });
  });
  revalidatePath("/", "layout");
}

export async function deleteAttempt(id: string) {
  await mutate((s) => { s.attempts = s.attempts.filter((a) => a.id !== id); });
  revalidatePath("/", "layout");
}
