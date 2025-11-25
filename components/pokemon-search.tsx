"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { basePath } from "@/lib/config";

interface PokemonSearchProps {
  readonly pokemonList: Array<{ id: number; name: string }>;
}

export function PokemonSearch({ pokemonList }: PokemonSearchProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredPokemon = useMemo(() => {
    if (!search.trim()) return [];
    const searchLower = search.toLowerCase();
    return pokemonList
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(searchLower)
      )
      .slice(0, 8);
  }, [search, pokemonList]);

  const showResults = search.trim().length > 0 && isOpen;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search by name, number, or type..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-11 pr-4 h-12 text-base rounded-full"
        />
      </div>

      {showResults && filteredPokemon.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {filteredPokemon.map((pokemon) => (
            <a
              key={pokemon.id}
              href={`${basePath}/${pokemon.name}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
            >
              <div className="w-12 h-12 relative shrink-0 bg-muted/50 rounded-lg flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold capitalize">
                  {pokemon.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  #{String(pokemon.id).padStart(4, "0")}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {showResults && search && filteredPokemon.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground z-50">
          No Pokémon found
        </div>
      )}
    </div>
  );
}
