import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <a
      href="/pokedex"
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Pokédex
    </a>
  );
}
