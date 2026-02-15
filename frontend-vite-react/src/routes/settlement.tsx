import { createFileRoute } from "@tanstack/react-router";
import { Settlement } from "@/pages/settlement";

export const Route = createFileRoute("/settlement")({
  component: Settlement,
});
