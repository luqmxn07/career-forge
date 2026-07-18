import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMfaVerify } from "@/features/auth/api/auth";

export const Route = createFileRoute("/auth/mfa")({
  head: () => ({ meta: [{ title: "MFA verify — CareerForge" }] }),
  component: MfaPage,
});

function MfaPage() {
  const [code, setCode] = useState("");
  const mfa = useMfaVerify();
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="font-display text-3xl font-semibold">Two-factor check</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mfa.mutate({ code }, {
            onSuccess: () => { toast.success("MFA verified"); navigate({ to: "/admin" }); },
            onError: (err: any) => toast.error(err.message || "Invalid code"),
          });
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          placeholder="123456"
          className="w-full rounded-md border border-glass-border bg-input px-4 py-4 text-center font-display text-3xl tracking-[0.5em] outline-none focus:border-primary focus:ring-glow"
        />
        <button className="btn-glow btn-glow-hover w-full rounded-md px-5 py-2.5 text-sm font-semibold">Verify</button>
      </form>
    </motion.div>
  );
}
