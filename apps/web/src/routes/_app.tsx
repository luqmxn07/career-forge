import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="scrollbar-thin mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
