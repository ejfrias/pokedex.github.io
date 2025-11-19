// Type effectiveness chart - which types are weak to which attacking types
const TYPE_CHART: Record<string, string[]> = {
  normal: [],
  fire: ["grass", "ice", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  electric: ["water", "flying"],
  grass: ["water", "ground", "rock"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
};

/**
 * Get the types that this Pokemon's attacks are super effective against
 * @param types - Array of the Pokemon's types
 * @returns Array of type names that are weak to this Pokemon's attacks
 */
export function getStrongAgainst(types: string[]): string[] {
  const strongAgainst = new Set<string>();

  types.forEach((type) => {
    const weakTypes = TYPE_CHART[type.toLowerCase()] || [];
    weakTypes.forEach((weakType) => strongAgainst.add(weakType));
  });

  return Array.from(strongAgainst).sort((a, b) => a.localeCompare(b));
}

// Subtle background colors for Pokemon images based on their type
const TYPE_BG_COLORS: Record<string, string> = {
  normal: "from-[#aa9]/10 to-[#aa9]/5",
  fire: "from-[#f42]/10 to-[#f42]/5",
  water: "from-[#39f]/10 to-[#39f]/5",
  electric: "from-[#fc3]/10 to-[#fc3]/5",
  grass: "from-[#7c5]/10 to-[#7c5]/5",
  ice: "from-[#6cf]/10 to-[#6cf]/5",
  fighting: "from-[#b54]/10 to-[#b54]/5",
  poison: "from-[#a59]/10 to-[#a59]/5",
  ground: "from-[#db5]/10 to-[#db5]/5",
  flying: "from-[#89f]/10 to-[#89f]/5",
  psychic: "from-[#f59]/10 to-[#f59]/5",
  bug: "from-[#ab2]/10 to-[#ab2]/5",
  rock: "from-[#ba6]/10 to-[#ba6]/5",
  ghost: "from-[#66b]/10 to-[#66b]/5",
  dragon: "from-[#76e]/10 to-[#76e]/5",
  dark: "from-[#754]/10 to-[#754]/5",
  steel: "from-[#aab]/10 to-[#aab]/5",
  fairy: "from-[#e9e]/10 to-[#e9e]/5",
};

/**
 * Get a subtle background gradient color for a Pokemon based on its primary type
 * @param types - Array of the Pokemon's types
 * @returns Tailwind gradient classes for the background
 */
export function getTypeBackgroundColor(types: string[]): string {
  const primaryType = types[0]?.toLowerCase() || "normal";
  return TYPE_BG_COLORS[primaryType] || TYPE_BG_COLORS.normal;
}
