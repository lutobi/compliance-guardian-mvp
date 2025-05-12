import fs from 'fs';
import path from 'path';
import { frameworkData } from '../src/data/frameworks';

const outPath = path.join(__dirname, 'frameworkData.json');
fs.writeFileSync(outPath, JSON.stringify(frameworkData, null, 2));
console.log(`Written JSON to ${outPath}`);
