const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "out");
const pokemonDir = path.join(outDir, "pokemon");

console.log("Restructuring output for clean URLs...");

// Get all .html files in the pokemon directory
const files = fs.readdirSync(pokemonDir);
let moved = 0;

files.forEach((file) => {
  if (file.endsWith(".html") && file !== "index.html") {
    const name = file.replace(".html", "");
    const htmlPath = path.join(pokemonDir, file);
    const folderPath = path.join(pokemonDir, name);
    const newHtmlPath = path.join(folderPath, "index.html");

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Move the HTML file to be index.html in the folder
    fs.renameSync(htmlPath, newHtmlPath);
    moved++;
  }
});

console.log(`✓ Moved ${moved} HTML files into folders`);
