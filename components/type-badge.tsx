import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-[#aa9] hover:bg-[#998877]",
  fire: "bg-[#f42] hover:bg-[#dd3311]",
  water: "bg-[#39f] hover:bg-[#2288ee]",
  electric: "bg-[#fc3] hover:bg-[#eebb22]",
  grass: "bg-[#7c5] hover:bg-[#66bb44]",
  ice: "bg-[#6cf] hover:bg-[#55bbee]",
  fighting: "bg-[#b54] hover:bg-[#aa4433]",
  poison: "bg-[#a59] hover:bg-[#994488]",
  ground: "bg-[#db5] hover:bg-[#ccaa44]",
  flying: "bg-[#89f] hover:bg-[#7788ee]",
  psychic: "bg-[#f59] hover:bg-[#ee4488]",
  bug: "bg-[#ab2] hover:bg-[#99aa11]",
  rock: "bg-[#ba6] hover:bg-[#aa9955]",
  ghost: "bg-[#66b] hover:bg-[#5566aa]",
  dragon: "bg-[#76e] hover:bg-[#6655dd]",
  dark: "bg-[#754] hover:bg-[#664433]",
  steel: "bg-[#aab] hover:bg-[#9999aa]",
  fairy: "bg-[#e9e] hover:bg-[#dd88dd]",
};

interface TypeBadgeProps {
  readonly type: string;
  readonly className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-white rounded-full transition-colors uppercase tracking-wide",
        TYPE_COLORS[type] || "bg-gray-400 hover:bg-gray-500",
        className
      )}
    >
      {type}
    </span>
  );
}
