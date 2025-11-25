import { ArrowLeft } from "lucide-react";
import { basePath } from "@/lib/config";

export function BackButton() {
  return (
    <a
      href={`${basePath}/`}
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Pokédex
    </a>
  );
}
