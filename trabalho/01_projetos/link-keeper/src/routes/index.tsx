import { createFileRoute } from "@tanstack/react-router";
import Library from "@/components/library";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Linkoteka · sua biblioteca de links" },
      {
        name: "description",
        content:
          "Guarde, organize e reencontre seus links com assuntos, temas, hashtags e anotações.",
      },
      { property: "og:title", content: "Linkoteka · sua biblioteca de links" },
      {
        property: "og:description",
        content:
          "Guarde, organize e reencontre seus links com assuntos, temas, hashtags e anotações.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { add?: string | undefined } => ({
    add: typeof search["add"] === "string" ? search["add"] : undefined,
  }),
  component: Index,
});

function Index() {
  const { add } = Route.useSearch();
  return <Library initialAdd={add} />;
}
