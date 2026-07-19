import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSignup } from "@/features/auth/api/auth";
import { FormField } from "./auth.login";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — CareerForge" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");
  const signup = useSignup();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-3xl font-semibold">Create your account</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Start building forge-quality resumes in seconds.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (fullName.trim().length < 2) {
            toast.error("Full name must be at least 2 characters long");
            return;
          }
          if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
          }
          signup.mutate(
            {
              email,
              password,
              fullName,
              phoneNumber: phoneNumber || undefined,
              location: location || undefined,
              age: age || undefined,
            },
            {
              onSuccess: () => {
                toast.success("Account created! Please sign in.");
                navigate({ to: "/auth/login" });
              },
              onError: (err: any) => {
                const detailsMsg = err?.data?.error?.details?.[0]?.message;
                const errorMsg = detailsMsg || err?.data?.error?.message || err?.message || "Signup failed";
                toast.error(errorMsg);
              },
            }
          );
        }}
      >
        <FormField label="Full Name" type="text" value={fullName} onChange={setFullName} required placeholder="John Doe" />
        <FormField label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" placeholder="john@example.com" />
        <div>
          <FormField label="Password" type="password" value={password} onChange={setPassword} required autoComplete="new-password" placeholder="••••••••" />
          <p className="mt-1 text-[11px] text-muted-foreground">Must be at least 6 characters</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Phone" type="tel" value={phoneNumber} onChange={setPhoneNumber} placeholder="+1 (555) 019-2834" />
          <FormField label="Location" type="text" value={location} onChange={setLocation} placeholder="San Francisco, CA" />
          <FormField label="Age" type="text" value={age} onChange={setAge} placeholder="25" />
        </div>
        <button
          type="submit"
          disabled={signup.isPending}
          className="btn-glow btn-glow-hover inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {signup.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
