const fs = require("fs");
const path = require("path");

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/pokedex" : "";

const manifest = {
  name: "Pokédex",
  short_name: "Pokédex",
  description:
    "A comprehensive Pokédex app with detailed information about all Pokémon",
  start_url: basePath || "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#000000",
  orientation: "portrait-primary",
  icons: [
    {
      src: `${basePath}/icon-192x192.png`,
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: `${basePath}/icon-512x512.png`,
      sizes: "512x512",
      type: "image/png",
    },
  ],
};

// Write to out directory (after build)
const outDir = path.join(__dirname, "..", "out");
const manifestPath = path.join(outDir, "manifest.json");

if (fs.existsSync(outDir)) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Generated manifest.json with basePath: "${basePath}"`);
} else {
  console.error("✗ out directory does not exist. Run build first.");
}
