const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const exports = {};
  cache.set(absolute, exports);
  const js = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'exports', js)(id => {
    const target = id.startsWith('@/') ? path.resolve(id.slice(2)) : path.resolve(path.dirname(absolute), id);
    return load(`${target}.ts`);
  }, exports);
  return exports;
}
const { photos } = load('content/photos.ts');
const { mockLocations, mockPhotoLocationIds } = load('content/mock-photo-locations.ts');
const { indexPhotoLocations, validLocation, projectLocation, clusterLocations } = load('lib/photo-geography.ts');
const { groups, unknown } = indexPhotoLocations(photos, [], mockLocations, mockPhotoLocationIds);
assert.equal(groups.length, 6);
assert.equal(unknown.length, 0);
assert.equal(groups.reduce((n,g) => n+g.photos.length,0), photos.length);
for (const group of groups) {
  assert(group.photos.length > 0);
  assert.equal(group.location.source, 'mock');
  assert(validLocation(group.location));
  assert(group.location.coordinateSource.startsWith('https://www.geonames.org/'));
}
assert.equal(new Set(Object.keys(mockPhotoLocationIds)).size, photos.length);
assert.equal(groups.filter(g=>g.location.countryCode==='JP').length,2);
const disabled = indexPhotoLocations(photos, []);
assert.equal(disabled.groups.length,0);
assert.equal(disabled.unknown.length,photos.length);
assert.deepEqual(indexPhotoLocations([], [], mockLocations, mockPhotoLocationIds).groups, []);
const verified = { ...mockLocations[0], id:'verified-seoul', source:'verified' };
const sample = [{ ...photos[0], locationId:verified.id }, { ...photos[1], locationId:'missing' }];
const mixed = indexPhotoLocations(sample,[verified],mockLocations,mockPhotoLocationIds);
assert.equal(mixed.groups[0].location.source,'verified');
assert.equal(mixed.unknown.length,1);
assert(!validLocation({...verified, latitude:91}));
assert(!validLocation({...verified, longitude:181}));
assert(!validLocation({...verified, latitude:NaN}));
assert.deepEqual(projectLocation(0,0),{x:0,y:.5});
assert.deepEqual(projectLocation(-180,90),{x:.5,y:0});
for (const width of [280,390,1000]) {
  const clusters = clusterLocations(groups,width,width/2,1);
  assert.equal(clusters.flat().length,6);
  assert.equal(new Set(clusters.flat().map(g=>g.location.id)).size,6);
  assert(clusters.some(c=>c.length>1));
  assert.equal(clusterLocations(groups,width,width/2,16).flat().length,6);
}
console.log(`Geographic data checks passed: ${photos.length} mock assignments across ${groups.length} populated cities, verified precedence, unknown/disabled/invalid data, projection and clustering.`);
console.log(groups.map(g=>`${g.location.city}: ${g.photos.length}`).join('; '));
// Pacific half-world (90°E–90°W, centered at 25°N) includes every demo city.
for (const location of mockLocations) {
  const point = projectLocation(location.longitude, location.latitude);
  assert(point.x >= .25 && point.x <= .75, `${location.city} outside Pacific longitude window`);
  assert(Math.abs(point.y - (90-25)/180) <= .25, `${location.city} outside Pacific latitude window`);
}
console.log('Pacific half-world default includes Asia and the American west coast.');
