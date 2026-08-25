"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/misc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="max-w-xs mx-auto mt-24 space-y-3">
      <h1 className="text-lg font-semibold">prep-tracker</h1>
      <Input name="password" type="password" placeholder="Password" autoFocus required />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>Sign in</Button>
    </form>
  );
}
