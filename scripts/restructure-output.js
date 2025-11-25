const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "out");

console.log("Restructuring output for clean URLs...");

// Get all .html files in the out directory (since routes are now at root level)
const files = fs.readdirSync(outDir);
let moved = 0;

files.forEach((file) => {
  if (file.endsWith(".html") && file !== "index.html" && file !== "404.html") {
    const name = file.replace(".html", "");
    const htmlPath = path.join(outDir, file);
    const folderPath = path.join(outDir, name);
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
