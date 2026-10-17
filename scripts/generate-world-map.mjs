// Natural Earth land via world-atlas 2.0.2 (public domain).
// Usage: node scripts/generate-world-map.mjs /path/to/land-110m.json
// D3/TopoJSON are development tools only; the website loads the generated SVG.
import fs from 'node:fs';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const topology = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
// Match projectLocation: longitude 0..360 → x 0..1000; Pacific at center.
// D3 clips spherical polygons at the date line before projection, avoiding seams.
const projection = geoEquirectangular().rotate([-180, 0]).scale(1000 / (2 * Math.PI)).translate([500, 250]);
const land = feature(topology, topology.objects.land);
const path = geoPath(projection).digits(2)(land);
if (!path) throw new Error('No land geometry found in the source topology');
fs.writeFileSync('public/maps/world-land.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" preserveAspectRatio="none"><!-- Natural Earth, public domain; world-atlas 2.0.2. Pacific-centered equirectangular projection, spherical clipping by D3. --><path fill="#d8cec0" stroke="#b9a996" stroke-width="0.45" fill-rule="evenodd" d="${path}"/></svg>\n`);
console.log('Generated geographically clipped Natural Earth land map');
