import { createFileRoute } from "@tanstack/react-router";
import Landing from "../components/landing/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerForge — Land the job with AI-forged resumes" },
      {
        name: "description",
        content:
          "AI resume builder, ATS analyzer, cover letters, interview simulator, and Kanban job tracker — engineered for a modern job hunt.",
      },
    ],
  }),
  component: Landing,
});
