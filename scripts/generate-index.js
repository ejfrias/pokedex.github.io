/**
 * Generate index.json from existing Pokemon data files
 */

const fs = require("fs").promises;
const path = require("path");

const POKEMON_DIR = path.join(__dirname, "../data/pokemon");
const INDEX_FILE = path.join(__dirname, "../data/index.json");

async function generateIndex() {
  console.log("Generating index from existing Pokemon data...");

  const files = await fs.readdir(POKEMON_DIR);
  const jsonFiles = files
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => {
      const numA = parseInt(a.replace(".json", ""));
      const numB = parseInt(b.replace(".json", ""));
      return numA - numB;
    });

  const index = [];

  for (const file of jsonFiles) {
    const filePath = path.join(POKEMON_DIR, file);
    const content = await fs.readFile(filePath, "utf-8");
    const pokemon = JSON.parse(content);

    index.push({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      image: pokemon.image,
    });
  }

  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
  console.log(`✓ Generated index with ${index.length} Pokemon`);
}

generateIndex().catch(console.error);
