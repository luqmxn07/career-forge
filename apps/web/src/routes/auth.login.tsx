import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "@/features/auth/api/auth";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — CareerForge" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your CareerForge workspace.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate({ email, password }, {
            onSuccess: () => { toast.success("Signed in"); navigate({ to: "/dashboard" }); },
            onError: (err: any) => toast.error(err.message || "Login failed"),
          });
        }}
      >
        <FormField label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
        <FormField label="Password" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
        <button
          type="submit"
          disabled={login.isPending}
          className="btn-glow btn-glow-hover inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/auth/signup" className="text-primary hover:underline">Create one</Link>
      </p>
    </motion.div>
  );
}

export function FormField({
  label, type = "text", value, onChange, required, autoComplete, placeholder,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; autoComplete?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-md border border-glass-border bg-input px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-glow"
      />
    </label>
  );
}
