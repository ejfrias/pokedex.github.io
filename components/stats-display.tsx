import { PokemonStats } from "@/types/pokemon";

interface StatsDisplayProps {
  readonly stats: PokemonStats;
}

const STAT_LABELS: Record<keyof Omit<PokemonStats, "total">, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  specialAttack: "Sp. Atk",
  specialDefense: "Sp. Def",
  speed: "Speed",
};

const MAX_STAT = 255; // Max base stat value in Pokemon

function getStatColor(value: number): string {
  if (value >= 150) return "bg-green-500"; // Excellent
  if (value >= 120) return "bg-lime-500"; // Great
  if (value >= 90) return "bg-yellow-500"; // Good
  if (value >= 60) return "bg-orange-500"; // Average
  return "bg-red-500"; // Poor
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const statKeys = Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {statKeys.map((key) => {
          const value = stats[key];
          const percentage = (value / MAX_STAT) * 100;
          const colorClass = getStatColor(value);

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  {STAT_LABELS[key]}
                </span>
                <span className="font-bold">{value}</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all ${colorClass}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t">
        <div className="flex justify-between">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-bold text-lg">{stats.total}</span>
        </div>
      </div>
    </div>
  );
}
