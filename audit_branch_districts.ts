import { bunnaDistrictsAndAreaOffices, bunnaBranchDirectory } from './src/data/bunnaBranchDirectory';

const distMap = new Map();
bunnaDistrictsAndAreaOffices.forEach(d => {
  distMap.set(d.id, d);
  distMap.set(d.name.toLowerCase(), d);
  if (d.code) distMap.set(d.code.toLowerCase(), d);
});

let unmatched = 0;
bunnaBranchDirectory.forEach(b => {
  const d = distMap.get(b.districtId) || distMap.get((b.districtName || '').toLowerCase());
  if (!d) {
    unmatched++;
    console.log(`Branch ${b.name} (${b.solId}) has unmatched districtId: ${b.districtId}, districtName: ${b.districtName}`);
  }
});
console.log(`Total branches with unmatched district references: ${unmatched}`);
