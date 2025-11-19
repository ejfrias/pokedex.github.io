/**
 * Retry fetching specific failed Pokemon IDs
 */

const fs = require("fs").promises;
const path = require("path");

const BASE_URL = "https://pokeapi.co/api/v2";
const OUTPUT_DIR = path.join(__dirname, "../data/pokemon");

const FAILED_IDS = [137, 395, 427, 526];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.message.includes("404")) return null;
      console.log(`Retry ${i + 1}/${retries} for ${url}`);
      if (i === retries - 1) throw error;
      await delay(2000 * (i + 1));
    }
  }
}

async function retryFailedPokemon() {
  console.log(`Retrying ${FAILED_IDS.length} failed Pokemon...\n`);

  for (const id of FAILED_IDS) {
    try {
      console.log(`Fetching Pokemon #${id}...`);
      const pokemon = await fetchWithRetry(`${BASE_URL}/pokemon/${id}`);

      if (!pokemon) {
        console.log(`⚠ Pokemon #${id} not found\n`);
        continue;
      }

      // Simple data structure for now
      const pokemonData = {
        id: pokemon.id,
        name: pokemon.name,
        image:
          pokemon.sprites.other["official-artwork"].front_default ||
          pokemon.sprites.front_default,
      };

      const filename = `${id}.json`;
      await fs.writeFile(
        path.join(OUTPUT_DIR, filename),
        JSON.stringify(pokemonData, null, 2)
      );

      console.log(`✓ Saved #${id} - ${pokemon.name}\n`);
      await delay(1000); // Be nice to the API
    } catch (error) {
      console.error(`✗ Failed #${id}: ${error.message}\n`);
    }
  }

  console.log(
    'Retry complete! Run "npm run generate-index" to update the index.'
  );
}

retryFailedPokemon().catch(console.error);
