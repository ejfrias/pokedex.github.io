/**
 * PokeAPI Crawler - Fetches all Pokemon data and saves to JSON files
 *
 * This script fetches comprehensive Pokemon data including:
 * - Basic info (name, ID, image, height, weight, types)
 * - Stats (HP, Attack, Defense, etc.)
 * - Type effectiveness (weaknesses, resistances)
 * - Evolution chain
 * - Game locations (where to catch)
 * - Moves by level and TM/HM per generation
 */

const fs = require("fs").promises;
const path = require("path");

const BASE_URL = "https://pokeapi.co/api/v2";
const OUTPUT_DIR = path.join(__dirname, "../data/pokemon");
const INDEX_FILE = path.join(__dirname, "../data/index.json");

// Rate limiting to be nice to PokeAPI
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // If 404, don't retry - Pokemon doesn't exist
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // Only retry on network errors, not 404s
      if (error.message.includes("404")) {
        return null;
      }
      console.log(`Retry ${i + 1}/${retries} for ${url}`);
      if (i === retries - 1) throw error;
      await delay(2000 * (i + 1)); // Exponential backoff
    }
  }
}

// Type effectiveness chart (2x damage taken)
const TYPE_EFFECTIVENESS = {
  normal: ["fighting"],
  fire: ["water", "ground", "rock"],
  water: ["electric", "grass"],
  electric: ["ground"],
  grass: ["fire", "ice", "poison", "flying", "bug"],
  ice: ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"],
  ground: ["water", "grass", "ice"],
  flying: ["electric", "ice", "rock"],
  psychic: ["bug", "ghost", "dark"],
  bug: ["fire", "flying", "rock"],
  rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["ghost", "dark"],
  dragon: ["ice", "dragon", "fairy"],
  dark: ["fighting", "bug", "fairy"],
  steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
};

// Type resistances (0.5x damage taken)
const TYPE_RESISTANCES = {
  normal: [],
  fire: ["fire", "grass", "ice", "bug", "steel", "fairy"],
  water: ["fire", "water", "ice", "steel"],
  electric: ["electric", "flying", "steel"],
  grass: ["water", "electric", "grass", "ground"],
  ice: ["ice"],
  fighting: ["bug", "rock", "dark"],
  poison: ["grass", "fighting", "poison", "bug", "fairy"],
  ground: ["poison", "rock"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "psychic"],
  bug: ["grass", "fighting", "ground"],
  rock: ["normal", "fire", "poison", "flying"],
  ghost: ["poison", "bug"],
  dragon: ["fire", "water", "electric", "grass"],
  dark: ["ghost", "dark"],
  steel: [
    "normal",
    "grass",
    "ice",
    "flying",
    "psychic",
    "bug",
    "rock",
    "dragon",
    "steel",
    "fairy",
  ],
  fairy: ["fighting", "bug", "dark"],
};

// Type immunities (0x damage)
const TYPE_IMMUNITIES = {
  normal: ["ghost"],
  flying: ["ground"],
  ground: ["electric"],
  ghost: ["normal", "fighting"],
  dark: ["psychic"],
  steel: ["poison"],
  fairy: ["dragon"],
};

function calculateTypeEffectiveness(types) {
  const weaknesses = new Set();
  const resistances = new Set();
  const immunities = new Set();

  types.forEach((type) => {
    const typeName = type.type.name;

    // Add weaknesses
    (TYPE_EFFECTIVENESS[typeName] || []).forEach((w) => weaknesses.add(w));

    // Add resistances
    (TYPE_RESISTANCES[typeName] || []).forEach((r) => resistances.add(r));

    // Add immunities
    (TYPE_IMMUNITIES[typeName] || []).forEach((i) => immunities.add(i));
  });

  // Remove overlaps (immunities override everything, resistances cancel weaknesses)
  immunities.forEach((i) => {
    weaknesses.delete(i);
    resistances.delete(i);
  });

  resistances.forEach((r) => weaknesses.delete(r));

  return {
    weaknesses: Array.from(weaknesses).sort(),
    resistances: Array.from(resistances).sort(),
    immunities: Array.from(immunities).sort(),
  };
}

async function fetchEvolutionChain(url) {
  try {
    const data = await fetchWithRetry(url);
    if (!data) return [];

    const chain = [];

    function traverseChain(node, evolutionDetails = null) {
      const pokemonId = parseInt(node.species.url.split("/").slice(-2, -1)[0]);

      // Extract evolution trigger and min level if available
      let minLevel = null;
      let trigger = null;

      if (evolutionDetails && evolutionDetails.length > 0) {
        const detail = evolutionDetails[0];
        trigger = detail.trigger?.name;
        minLevel = detail.min_level;
      }

      chain.push({
        name: node.species.name,
        id: pokemonId,
        minLevel,
        trigger,
      });

      if (node.evolves_to.length > 0) {
        node.evolves_to.forEach((evolution) =>
          traverseChain(evolution, evolution.evolution_details)
        );
      }
    }

    traverseChain(data.chain);
    return chain;
  } catch (error) {
    console.error(`Error fetching evolution chain: ${error.message}`);
    return [];
  }
}

async function fetchPokemonLocations(id) {
  try {
    const data = await fetchWithRetry(`${BASE_URL}/pokemon/${id}/encounters`);

    const locationsByGame = {};

    data.forEach((encounter) => {
      const locationName = encounter.location_area.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      encounter.version_details.forEach((version) => {
        const game = version.version.name;
        if (!locationsByGame[game]) {
          locationsByGame[game] = [];
        }

        if (!locationsByGame[game].includes(locationName)) {
          locationsByGame[game].push(locationName);
        }
      });
    });

    return locationsByGame;
  } catch (error) {
    console.error(`Error fetching locations for ${id}: ${error.message}`);
    return {};
  }
}

async function fetchPokemonData(id) {
  console.log(`Fetching Pokemon #${id}...`);

  try {
    // Fetch main Pokemon data
    const pokemon = await fetchWithRetry(`${BASE_URL}/pokemon/${id}`);

    // Pokemon doesn't exist (404)
    if (!pokemon) {
      console.log(`⚠ Pokemon #${id} not found (skipping)`);
      return null;
    }

    // Fetch species data for evolution chain
    const species = await fetchWithRetry(`${BASE_URL}/pokemon-species/${id}`);

    // Fetch evolution chain
    const evolutionChain = await fetchEvolutionChain(
      species.evolution_chain.url
    );

    // Fetch locations
    const locations = await fetchPokemonLocations(id);

    // Process moves by generation
    const movesByLevel = {};
    const movesByMachine = {};

    pokemon.moves.forEach((move) => {
      move.version_group_details.forEach((detail) => {
        const genMatch = detail.version_group.name.match(/generation-(\w+)/);
        const gen = genMatch ? genMatch[1] : detail.version_group.name;
        const genKey = `gen-${gen}`;

        if (detail.move_learn_method.name === "level-up") {
          if (!movesByLevel[genKey]) movesByLevel[genKey] = [];
          movesByLevel[genKey].push({
            name: move.move.name,
            level: detail.level_learned_at,
            url: move.move.url,
          });
        } else if (detail.move_learn_method.name === "machine") {
          if (!movesByMachine[genKey]) movesByMachine[genKey] = [];
          movesByMachine[genKey].push({
            name: move.move.name,
            url: move.move.url,
          });
        }
      });
    });

    // Sort moves by level
    Object.keys(movesByLevel).forEach((gen) => {
      movesByLevel[gen].sort((a, b) => a.level - b.level);
    });

    // Calculate type effectiveness
    const typeEffectiveness = calculateTypeEffectiveness(pokemon.types);

    const pokemonData = {
      id: pokemon.id,
      name: pokemon.name,
      image:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default,
      imageShiny: pokemon.sprites.other["official-artwork"].front_shiny,
      types: pokemon.types.map((t) => t.type.name),
      height: pokemon.height / 10, // Convert to meters
      weight: pokemon.weight / 10, // Convert to kg
      stats: {
        hp: pokemon.stats[0].base_stat,
        attack: pokemon.stats[1].base_stat,
        defense: pokemon.stats[2].base_stat,
        specialAttack: pokemon.stats[3].base_stat,
        specialDefense: pokemon.stats[4].base_stat,
        speed: pokemon.stats[5].base_stat,
        total: pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
      },
      abilities: pokemon.abilities.map((a) => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      })),
      typeEffectiveness,
      evolutionChain,
      locations,
      movesByLevel,
      movesByMachine,
      genus: species.genera.find((g) => g.language.name === "en")?.genus || "",
      flavorText:
        species.flavor_text_entries
          .find((entry) => entry.language.name === "en")
          ?.flavor_text.replace(/\f/g, " ") || "",
    };

    return pokemonData;
  } catch (error) {
    console.error(`Error fetching Pokemon #${id}: ${error.message}`);
    return null;
  }
}

async function getMaxPokemonId() {
  try {
    // Fetch all Pokemon species (the definitive list)
    console.log("Checking PokeAPI for latest Pokemon count...");
    const speciesList = await fetchWithRetry(
      `${BASE_URL}/pokemon-species?limit=10000`
    );

    if (!speciesList || !speciesList.results) {
      console.log(
        "⚠ Could not fetch species list, using fallback limit of 1025"
      );
      return 1025;
    }

    // Extract the highest ID from the species URLs
    const maxId = speciesList.results.reduce((max, species) => {
      const id = parseInt(species.url.split("/").slice(-2, -1)[0]);
      return Math.max(max, id);
    }, 0);

    console.log(
      `✓ Found ${speciesList.results.length} Pokemon species, max ID: ${maxId}\n`
    );
    return maxId;
  } catch (err) {
    console.log(
      `⚠ Error checking Pokemon count: ${err.message}, using fallback limit of 1025`
    );
    return 1025;
  }
}

async function main() {
  console.log("Starting Pokemon data crawl...\n");

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Get the actual max Pokemon ID from PokeAPI
  const maxPokemonId = await getMaxPokemonId();

  // Check existing files to skip already crawled Pokemon
  console.log("Checking existing Pokemon data files...");
  const existingFiles = await fs.readdir(OUTPUT_DIR).catch(() => []);
  const existingIds = new Set(
    existingFiles
      .filter((f) => f.endsWith(".json"))
      .map((f) => parseInt(f.replace(".json", "")))
      .filter((id) => !isNaN(id))
  );
  console.log(`✓ Found ${existingIds.size} existing Pokemon files\n`);

  // For demo purposes, let's fetch first 151 (Gen 1) by default
  // Change this number to fetch more or all Pokemon
  const FETCH_LIMIT = process.env.FETCH_ALL ? maxPokemonId : 151;
  const START_INDEX = parseInt(process.env.START_INDEX || "1");

  console.log(`Fetching Pokemon #${START_INDEX} to #${FETCH_LIMIT}...\n`);

  const index = [];
  let successCount = 0;
  let skipCount = 0;
  let alreadyExistsCount = 0;

  for (let i = START_INDEX; i <= FETCH_LIMIT; i++) {
    // Skip if already exists
    if (existingIds.has(i)) {
      alreadyExistsCount++;
      console.log(`⏭ Skipping #${i} (already exists)`);
      continue;
    }

    const pokemonData = await fetchPokemonData(i);

    if (pokemonData) {
      // Save individual Pokemon file
      const filename = `${i}.json`;
      await fs.writeFile(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify(pokemonData, null, 2)
      );

      // Add to index
      index.push({
        id: pokemonData.id,
        name: pokemonData.name,
        types: pokemonData.types,
        image: pokemonData.image,
      });

      successCount++;
      console.log(`✓ Saved #${i} - ${pokemonData.name}`);
    } else {
      skipCount++;
    }

    // Rate limiting: 100ms delay between requests
    await delay(100);
  }

  // Save index file
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
  console.log(`\n✓ Saved index with ${index.length} Pokemon`);
  console.log(`✓ Successfully crawled: ${successCount} Pokemon`);
  console.log(`⏭ Already existed: ${alreadyExistsCount} Pokemon`);
  console.log(`⚠ Skipped (not found): ${skipCount} Pokemon`);
  console.log("\nCrawl complete!");
}

main().catch(console.error);
