export interface PokemonType {
  name: string;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface TypeEffectiveness {
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
}

export interface EvolutionChainItem {
  name: string;
  id: number;
  minLevel: number | null;
  trigger: string | null;
}

export interface Move {
  name: string;
  level?: number;
  url: string;
}

export interface LocationsByGame {
  [game: string]: string[];
}

export interface MovesByGeneration {
  [generation: string]: Move[];
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  imageShiny: string;
  types: string[];
  height: number;
  weight: number;
  stats: PokemonStats;
  abilities: PokemonAbility[];
  typeEffectiveness: TypeEffectiveness;
  evolutionChain: EvolutionChainItem[];
  locations: LocationsByGame;
  movesByLevel: MovesByGeneration;
  movesByMachine: MovesByGeneration;
  genus: string;
  flavorText: string;
}

export interface PokemonIndex {
  id: number;
  name: string;
  types: string[];
  image: string;
}
