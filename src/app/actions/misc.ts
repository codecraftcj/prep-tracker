"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getState, mutate, setState } from "@/lib/store";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";
import { Application, AppState, Artifact, DesignRep, Mock } from "@/lib/types";

const all = () => revalidatePath("/", "layout");

export async function addMock(m: Omit<Mock, "id">) {
  await mutate((s) => { s.mocks.push({ id: crypto.randomUUID(), ...m }); }); all();
}
export async function deleteMock(id: string) {
  await mutate((s) => { s.mocks = s.mocks.filter((x) => x.id !== id); }); all();
}
export async function addDesignRep(d: Omit<DesignRep, "id">) {
  await mutate((s) => { s.design_reps.push({ id: crypto.randomUUID(), ...d }); }); all();
}
export async function deleteDesignRep(id: string) {
  await mutate((s) => { s.design_reps = s.design_reps.filter((x) => x.id !== id); }); all();
}
export async function updateArtifact(id: string, patch: Partial<Omit<Artifact, "id">>) {
  await mutate((s) => { const a = s.artifacts.find((x) => x.id === id); if (a) Object.assign(a, patch); }); all();
}
export async function saveApplication(app: Omit<Application, "id"> & { id?: string }) {
  await mutate((s) => {
    if (app.id) { const i = s.applications.findIndex((x) => x.id === app.id); if (i >= 0) s.applications[i] = { ...app, id: app.id }; }
    else s.applications.push({ ...app, id: crypto.randomUUID() });
  }); all();
}
export async function deleteApplication(id: string) {
  await mutate((s) => { s.applications = s.applications.filter((x) => x.id !== id); }); all();
}
export async function setPlanStart(ymd: string) {
  await mutate((s) => { s.plan_start = ymd; }); all();
}

export async function exportState(): Promise<string> {
  return JSON.stringify(await getState(), null, 2);
}
export async function importState(json: string) {
  const parsed = JSON.parse(json) as AppState;
  if (parsed.version !== 1 || !Array.isArray(parsed.attempts)) throw new Error("Not a prep-tracker export");
  await setState(parsed); all();
}

export async function login(_: unknown, form: FormData) {
  const pw = String(form.get("password") ?? "");
  if (pw !== process.env.APP_PASSWORD) return { error: "Wrong password" };
  const token = await sessionToken();
  (await cookies()).set(SESSION_COOKIE, token!, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  redirect("/");
}
export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
