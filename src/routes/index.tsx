import { createFileRoute } from "@tanstack/react-router";
import AtlasWorkspaceChat from "../components/atlas-workspace-chat";

export const Route = createFileRoute("/")({
  component: AtlasPage,
});

function AtlasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:py-16">
      <AtlasWorkspaceChat />
    </main>
  );
}
