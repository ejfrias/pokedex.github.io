"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PokemonIndex } from "@/types/pokemon";
import { PokemonCard } from "./pokemon-card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { TypeBadge } from "./type-badge";

interface PokemonGridProps {
  readonly pokemon: PokemonIndex[];
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const GENERATIONS = [
  { value: "1", label: "Gen I (1-151)", min: 1, max: 151 },
  { value: "2", label: "Gen II (152-251)", min: 152, max: 251 },
  { value: "3", label: "Gen III (252-386)", min: 252, max: 386 },
  { value: "4", label: "Gen IV (387-493)", min: 387, max: 493 },
  { value: "5", label: "Gen V (494-649)", min: 494, max: 649 },
  { value: "6", label: "Gen VI (650-721)", min: 650, max: 721 },
  { value: "7", label: "Gen VII (722-809)", min: 722, max: 809 },
  { value: "8", label: "Gen VIII (810-905)", min: 810, max: 905 },
  { value: "9", label: "Gen IX (906-1025)", min: 906, max: 1025 },
];

const CLASSIFICATIONS: Record<string, number[]> = {
  starters: [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 152, 153, 154, 155, 156, 157, 158, 159, 160, 252,
    253, 254, 255, 256, 257, 258, 259, 260, 387, 388, 389, 390, 391, 392, 393,
    394, 395, 495, 496, 497, 498, 499, 500, 501, 502, 503, 650, 651, 652, 653,
    654, 655, 656, 657, 658, 722, 723, 724, 725, 726, 727, 728, 729, 730, 810,
    811, 812, 813, 814, 815, 816, 817, 818, 906, 907, 908, 909, 910, 911, 912,
    913, 914,
  ],
  babies: [
    172, 173, 174, 175, 236, 238, 239, 240, 298, 360, 406, 433, 438, 439, 440,
    446, 447, 458,
  ],
  fossils: [
    138, 139, 140, 141, 142, 345, 346, 347, 348, 408, 409, 410, 411, 564, 565,
    566, 567, 696, 697, 698, 699, 880, 881, 882, 883,
  ],
  paradox: [
    984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006,
    1007, 1008, 1009, 1010,
  ],
  "ultra-beasts": [793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806],
  "pseudo-legendary": [
    147, 148, 149, 246, 247, 248, 371, 372, 373, 443, 444, 445, 610, 611, 612,
    633, 634, 635, 704, 705, 706, 782, 783, 784, 885, 886, 887, 996, 997, 998,
  ],
  legendaries: [
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380,
    381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488,
    489, 490, 491, 492, 493, 494, 638, 639, 640, 641, 642, 643, 644, 645, 646,
    647, 648, 649, 716, 717, 718, 719, 720, 721, 772, 773, 785, 786, 787, 788,
    789, 790, 791, 792, 800, 801, 802, 807, 808, 809, 888, 889, 890, 891, 892,
    893, 894, 895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1014, 1015, 1016,
    1017, 1024, 1025,
  ],
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  starters: "Starters",
  babies: "Babies",
  fossils: "Fossils",
  paradox: "Paradox",
  "ultra-beasts": "Ultra Beasts",
  "pseudo-legendary": "Pseudo-Legendary",
  legendaries: "Legendaries",
};

export function PokemonGrid({ pokemon }: PokemonGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) ?? []
  );
  const [selectedGeneration, setSelectedGeneration] = useState<string>(
    searchParams.get("gen") ?? ""
  );
  const [selectedClassification, setSelectedClassification] = useState<string>(
    searchParams.get("class") ?? ""
  );
  const [sortBy, setSortBy] = useState<"id" | "name">(
    (searchParams.get("sort") as "id" | "name") ?? "id"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
    if (selectedGeneration) params.set("gen", selectedGeneration);
    if (selectedClassification) params.set("class", selectedClassification);
    if (sortBy !== "id") params.set("sort", sortBy);

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.replace(newUrl, { scroll: false });
  }, [
    search,
    selectedTypes,
    selectedGeneration,
    selectedClassification,
    sortBy,
    router,
  ]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedGeneration("");
    setSelectedClassification("");
    setSortBy("id");
    setSearch("");
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedGeneration !== "" ||
    selectedClassification !== "";

  const { filteredPokemon, suggestions } = useMemo(() => {
    let result = [...pokemon];

    // Apply generation filter
    if (selectedGeneration) {
      const gen = GENERATIONS.find((g) => g.value === selectedGeneration);
      if (gen) {
        result = result.filter((p) => p.id >= gen.min && p.id <= gen.max);
      }
    }

    // Apply classification filter
    if (selectedClassification) {
      const classificationIds = CLASSIFICATIONS[selectedClassification];
      if (classificationIds) {
        result = result.filter((p) => classificationIds.includes(p.id));
      }
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      result = result.filter((p) =>
        selectedTypes.some((type) => p.types.includes(type))
      );
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase().trim();

      // Direct matches
      const exactMatches = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(searchLower) ||
          p.types.some((t) => t.toLowerCase().includes(searchLower))
      );

      // If we have exact matches, use them
      if (exactMatches.length > 0) {
        result = exactMatches;
      } else {
        // No exact matches - find similar names using fuzzy matching
        const threshold = 3; // Max edit distance for suggestions
        const similar = result
          .map((p) => ({
            pokemon: p,
            distance: levenshteinDistance(searchLower, p.name.toLowerCase()),
          }))
          .filter((item) => item.distance <= threshold)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5)
          .map((item) => item.pokemon.name);

        return { filteredPokemon: [], suggestions: similar };
      }
    }

    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => a.id - b.id);
    }

    return { filteredPokemon: result, suggestions: [] };
  }, [
    search,
    pokemon,
    selectedTypes,
    selectedGeneration,
    selectedClassification,
    sortBy,
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search by name, number, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 pr-4 h-12 sm:h-14 text-base sm:text-lg rounded-full shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors font-medium cursor-pointer ${
              hasActiveFilters || showFilters
                ? "text-foreground hover:bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {selectedTypes.length +
                  (selectedGeneration ? 1 : 0) +
                  (selectedClassification ? 1 : 0)}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="space-y-6 p-6 rounded-lg border bg-card">
            {/* Type Filter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Type</h3>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className="transition-all cursor-pointer"
                  >
                    <TypeBadge
                      type={type}
                      className={`${
                        selectedTypes.includes(type)
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Filter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Generation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENERATIONS.map((gen) => (
                  <button
                    key={gen.value}
                    onClick={() =>
                      setSelectedGeneration(
                        selectedGeneration === gen.value ? "" : gen.value
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedGeneration === gen.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {gen.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Classification Filter */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Classification</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(CLASSIFICATION_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSelectedClassification(
                        selectedClassification === key ? "" : key
                      )
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedClassification === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Sort By</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("id")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    sortBy === "id"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Number
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    sortBy === "name"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Name (A-Z)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredPokemon.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg sm:text-xl">
            No Pokémon found matching &quot;{search}&quot;
          </p>
          {suggestions.length > 0 ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Did you mean one of these?
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearch(suggestion)}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors capitalize cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Try searching by name, number, or type
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm sm:text-base text-muted-foreground font-medium">
              Showing{" "}
              <span className="font-bold text-foreground">
                {filteredPokemon.length}
              </span>{" "}
              of {pokemon.length} Pokémon
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {filteredPokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
