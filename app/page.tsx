import { PokemonGrid } from "@/components/pokemon-grid";
import { PokemonIndex } from "@/types/pokemon";
import pokemonIndex from "@/data/index.json";

export default function Home() {
  const pokemon = pokemonIndex as PokemonIndex[];

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 max-w-7xl">
        <header className="mb-8 sm:mb-12 lg:mb-16 text-center space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-linear-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
            Pokédex
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            A streamlined Pokémon reference with everything you need: stats,
            types, evolution chains, locations, and moves.
          </p>
        </header>

        <PokemonGrid pokemon={pokemon} />
      </div>
    </div>
  );
}
