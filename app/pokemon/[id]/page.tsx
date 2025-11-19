import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Pokemon } from "@/types/pokemon";
import { TypeBadge } from "@/components/type-badge";
import { StatsDisplay } from "@/components/stats-display";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Weight } from "lucide-react";
import {
  getStrongAgainst,
  getTypeBackgroundColor,
} from "@/lib/type-effectiveness";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPokemonData(id: string): Promise<Pokemon | null> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    // Check if id is a number or a name
    const isNumber = /^\d+$/.test(id);

    if (isNumber) {
      // Direct file access by ID
      const filePath = path.join(
        process.cwd(),
        "data",
        "pokemon",
        `${id}.json`
      );
      const fileContent = await fs.readFile(filePath, "utf-8");
      return JSON.parse(fileContent) as Pokemon;
    } else {
      // Search by name in index
      const indexPath = path.join(process.cwd(), "data", "index.json");
      const indexContent = await fs.readFile(indexPath, "utf-8");
      const index = JSON.parse(indexContent) as Array<{
        id: number;
        name: string;
      }>;

      const pokemon = index.find(
        (p) => p.name.toLowerCase() === id.toLowerCase()
      );
      if (!pokemon) return null;

      // Load the Pokemon data by ID
      const filePath = path.join(
        process.cwd(),
        "data",
        "pokemon",
        `${pokemon.id}.json`
      );
      const fileContent = await fs.readFile(filePath, "utf-8");
      return JSON.parse(fileContent) as Pokemon;
    }
  } catch (error) {
    console.error(`Failed to load Pokemon #${id}:`, error);
    return null;
  }
}

async function getPokemonTypes(id: number): Promise<string[]> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "pokemon", `${id}.json`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent) as Pokemon;
    return data.types;
  } catch {
    // Return empty array if Pokemon data not found
    return [];
  }
}

export async function generateStaticParams() {
  // Generate paths for both ID and name
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const indexPath = path.join(process.cwd(), "data", "index.json");
    const indexContent = await fs.readFile(indexPath, "utf-8");
    const index = JSON.parse(indexContent) as Array<{
      id: number;
      name: string;
    }>;

    // Generate params for both ID and name
    const params: Array<{ id: string }> = [];
    index.forEach((pokemon) => {
      params.push({ id: pokemon.id.toString() });
      params.push({ id: pokemon.name.toLowerCase() });
    });

    return params;
  } catch {
    return [];
  }
}

// Force static generation at build time
export const dynamic = "force-static";
export const dynamicParams = true; // Allow dynamic params for Pokemon not in index

export default async function PokemonPage({ params }: PageProps) {
  const { id } = await params;
  const pokemon = await getPokemonData(id);

  if (!pokemon) {
    notFound();
  }

  const paddedId = String(pokemon.id).padStart(3, "0");
  const generations = Object.keys(pokemon.movesByLevel).sort();
  const typeGradient = getTypeBackgroundColor(pokemon.types);

  // Get types for each evolution
  const evolutionTypes = await Promise.all(
    pokemon.evolutionChain.map((evo) => getPokemonTypes(evo.id))
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BackButton />

        {/* Header Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left: Image */}
          <Card className="p-0">
            <CardContent className="p-0">
              <div
                className={`relative aspect-square bg-linear-to-br ${typeGradient} rounded-lg overflow-hidden`}
              >
                <Image
                  src={pokemon.image}
                  alt={pokemon.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          {/* Right: Basic Info */}
          <div className="space-y-6">
            <div>
              <div className="font-medium font-mono text-muted-foreground mb-2">
                #{paddedId}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold capitalize mb-2">
                {pokemon.name}
              </h1>
            </div>

            <div className="flex gap-2 flex-wrap">
              {pokemon.types.map((type) => (
                <TypeBadge
                  key={type}
                  type={type}
                  className="text-sm px-4 py-2"
                />
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                {pokemon.genus}
              </h3>
              <p className="text-sm leading-relaxed">{pokemon.flavorText}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card flex items-center gap-3">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Height</div>
                  <div className="font-semibold">{pokemon.height} m</div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card flex items-center gap-3">
                <Weight className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Weight</div>
                  <div className="font-semibold">{pokemon.weight} kg</div>
                </div>
              </div>
            </div>

            {/* Evolution Chain */}
            {pokemon.evolutionChain.length > 1 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
                  Evolution Chain
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {pokemon.evolutionChain.map((evo, index) => {
                    const evoTypeGradient = getTypeBackgroundColor(
                      evolutionTypes[index] || []
                    );
                    const evoPaddedId = String(evo.id).padStart(4, "0");
                    return (
                      <div key={evo.id} className="flex items-center gap-3">
                        <Link
                          href={`/pokemon/${evo.name}`}
                          className="flex flex-col items-center gap-1 hover:opacity-75 transition-opacity cursor-pointer"
                        >
                          <div
                            className={`w-20 h-20 relative bg-linear-to-br ${evoTypeGradient} rounded-lg`}
                          >
                            <Image
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                              alt={evo.name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            #{evoPaddedId}
                          </div>
                          <span className="text-sm font-semibold capitalize text-primary">
                            {evo.name}
                          </span>
                          <div className="flex gap-1">
                            {evolutionTypes[index]?.map((type) => (
                              <TypeBadge
                                key={type}
                                type={type}
                                className="text-[10px] px-2 py-0.5"
                              />
                            ))}
                          </div>
                        </Link>
                        {index < pokemon.evolutionChain.length - 1 && (
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-lg text-muted-foreground relative -top-8">
                              →
                            </div>
                            {pokemon.evolutionChain[index + 1].minLevel && (
                              <div className="text-xs text-muted-foreground">
                                (Level{" "}
                                {pokemon.evolutionChain[index + 1].minLevel})
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Type Effectiveness */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Stats Section */}
          <Card>
            <CardHeader>
              <CardTitle>Base Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsDisplay stats={pokemon.stats} />
            </CardContent>
          </Card>

          {/* Type Effectiveness */}
          <Card>
            <CardHeader>
              <CardTitle>Type Effectiveness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {getStrongAgainst(pokemon.types).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Strong Against (2× damage)
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {getStrongAgainst(pokemon.types).map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
              )}

              {pokemon.typeEffectiveness.weaknesses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Weak Against (2× damage)
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {pokemon.typeEffectiveness.weaknesses.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
              )}

              {pokemon.typeEffectiveness.resistances.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Resistant To (0.5× damage)
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {pokemon.typeEffectiveness.resistances.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
              )}

              {pokemon.typeEffectiveness.immunities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                    Immune To (0× damage)
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {pokemon.typeEffectiveness.immunities.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Moves */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Moves</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={generations[0]}>
              <TabsList>
                {generations.map((gen) => (
                  <TabsTrigger
                    key={gen}
                    value={gen}
                    className="capitalize cursor-pointer"
                  >
                    {gen.replace(/gen-/g, "").replace(/-/g, " ")}
                  </TabsTrigger>
                ))}
              </TabsList>

              {generations.map((gen) => {
                const levelMoves = pokemon.movesByLevel[gen] || [];
                const machineMoves = pokemon.movesByMachine[gen] || [];

                // HM moves list (common HMs across generations)
                const hmMoves = [
                  "cut",
                  "fly",
                  "surf",
                  "strength",
                  "flash",
                  "whirlpool",
                  "waterfall",
                  "rock-smash",
                  "dive",
                  "rock-climb",
                  "defog",
                ];

                const hmList = machineMoves.filter((move) =>
                  hmMoves.includes(move.name)
                );
                const tmList = machineMoves
                  .filter((move) => !hmMoves.includes(move.name))
                  .sort((a, b) => a.name.localeCompare(b.name));

                // Filter locations for this generation
                // Map generation tab names to their game titles
                const genGameMapping: Record<string, string[]> = {
                  "gen-red-blue": ["red", "blue"],
                  "gen-yellow": ["yellow"],
                  "gen-gold-silver": ["gold", "silver"],
                  "gen-crystal": ["crystal"],
                  "gen-ruby-sapphire": ["ruby", "sapphire"],
                  "gen-emerald": ["emerald"],
                  "gen-firered-leafgreen": ["firered", "leafgreen"],
                  "gen-diamond-pearl": ["diamond", "pearl"],
                  "gen-platinum": ["platinum"],
                  "gen-heartgold-soulsilver": ["heartgold", "soulsilver"],
                  "gen-black-white": ["black", "white"],
                  "gen-black-2-white-2": ["black-2", "white-2"],
                  "gen-x-y": ["x", "y"],
                  "gen-omega-ruby-alpha-sapphire": [
                    "omega-ruby",
                    "alpha-sapphire",
                  ],
                  "gen-sun-moon": ["sun", "moon"],
                  "gen-ultra-sun-ultra-moon": ["ultra-sun", "ultra-moon"],
                  "gen-sword-shield": ["sword", "shield"],
                  "gen-brilliant-diamond-shining-pearl": [
                    "brilliant-diamond",
                    "shining-pearl",
                  ],
                  "gen-legends-arceus": ["legends-arceus"],
                  "gen-scarlet-violet": ["scarlet", "violet"],
                };

                const gamesForGen = genGameMapping[gen] || [];
                const genLocations = Object.entries(pokemon.locations).filter(
                  ([game]) => gamesForGen.includes(game)
                );

                return (
                  <TabsContent key={gen} value={gen} className="mt-5">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Level Up Moves */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-4 text-lg">
                            Level Up
                          </h3>
                          {levelMoves.length > 0 ? (
                            <div className="grid gap-2">
                              {levelMoves.map((move, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                                >
                                  <span className="text-sm text-muted-foreground font-mono w-16 shrink-0">
                                    Lv. {move.level}
                                  </span>
                                  <span className="capitalize flex-1">
                                    {move.name.replace(/-/g, " ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No level up moves available
                            </p>
                          )}
                        </div>

                        {/* Where to catch/obtain */}
                        {genLocations.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-lg">
                              Where to catch/obtain
                            </h3>
                            <div className="space-y-4">
                              {genLocations.map(([game, locations]) => (
                                <div key={game}>
                                  <h4 className="font-semibold text-sm capitalize mb-2">
                                    {game.replace(/-/g, " ")}
                                  </h4>
                                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {locations.map((location, idx) => (
                                      <li key={idx} className="text-sm">
                                        {location}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* HM/TM Moves Combined */}
                      <div className="space-y-6">
                        {/* HM Moves */}
                        {hmList.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-lg">HM</h3>
                            <div className="grid gap-2">
                              {hmList.map((move, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-lg bg-muted/50 capitalize hover:bg-muted/70 transition-colors"
                                >
                                  {move.name.replace(/-/g, " ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TM Moves */}
                        {tmList.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-lg">TM</h3>
                            <div className="grid gap-2">
                              {tmList.map((move, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-lg bg-muted/50 capitalize hover:bg-muted/70 transition-colors"
                                >
                                  {move.name.replace(/-/g, " ")}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
