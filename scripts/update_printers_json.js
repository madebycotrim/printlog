
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const printersPath = path.join(__dirname, '../public/printers.json');
const assetsPath = path.join(__dirname, '../src/data/printerAssets.js');

const rawAssets = fs.readFileSync(assetsPath, 'utf-8');

// Quick dirty parser to extract the object
const matchAssets = rawAssets.match(/export const PRINTER_ASSETS = ({[\s\S]*?});/);
if (!matchAssets) {
    console.error("Could not parse assets file");
    process.exit(1);
}

// Evaluate object safely-ish (it's just a data file we created)
const PRINTER_ASSETS = eval('(' + matchAssets[1] + ')');

const findImage = (brand, model) => {
    const term = `${brand}-${model}`.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Exact
    if (PRINTER_ASSETS[term]) return PRINTER_ASSETS[term];

    // Partial
    const keys = Object.keys(PRINTER_ASSETS);
    const match = keys
        .filter(k => term.includes(k))
        .sort((a, b) => b.length - a.length)[0];

    return match ? PRINTER_ASSETS[match] : "";
};

const printers = JSON.parse(fs.readFileSync(printersPath, 'utf-8'));

let updatedCount = 0;
const updatedPrinters = printers.map(p => {
    const img = findImage(p.brand, p.model);
    if (img) updatedCount++;
    return {
        ...p,
        img: img // User requested "img" field
    };
});

fs.writeFileSync(printersPath, JSON.stringify(updatedPrinters, null, 2));

console.log(`Updated ${updatedCount} printers with images!`);
