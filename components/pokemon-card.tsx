import Image from "next/image";
import { PokemonIndex } from "@/types/pokemon";
import { TypeBadge } from "./type-badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTypeBackgroundColor } from "@/lib/type-effectiveness";
import { basePath } from "@/lib/config";

interface PokemonCardProps {
  readonly pokemon: PokemonIndex;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const paddedId = String(pokemon.id).padStart(3, "0");
  const typeGradient = getTypeBackgroundColor(pokemon.types);

  return (
    <a href={`${basePath}/${pokemon.name}`} className="block h-full">
      <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden h-full p-0 border-2 hover:border-primary/20">
        <CardContent
          className={`p-4 sm:p-5 flex flex-col h-full bg-linear-to-br ${typeGradient}`}
        >
          <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
            <Image
              src={pokemon.image}
              alt={pokemon.name}
              fill
              className="object-contain p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              priority={pokemon.id <= 20}
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <div className="text-xs sm:text-sm text-muted-foreground font-mono font-semibold">
              #{paddedId}
            </div>

            <h3 className="font-bold text-base sm:text-lg capitalize leading-tight line-clamp-1">
              {pokemon.name}
            </h3>

            <div className="flex gap-1.5 sm:gap-2 flex-wrap mt-auto pt-1">
              {pokemon.types.map((type) => (
                <TypeBadge key={type} type={type} className="text-xs" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
