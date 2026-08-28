import { bunnaDistrictsAndAreaOffices, bunnaBranchDirectory } from './src/data/bunnaBranchDirectory';

console.log("Total Districts/Area Offices in manual data:", bunnaDistrictsAndAreaOffices.length);
console.log("Total Branches in manual data:", bunnaBranchDirectory.length);

const branchSolMap = new Map<string, any[]>();
bunnaBranchDirectory.forEach(b => {
  const sol = String(b.solId || '').trim();
  if (!branchSolMap.has(sol)) branchSolMap.set(sol, []);
  branchSolMap.get(sol)!.push(b);
});

let duplicates = 0;
branchSolMap.forEach((branches, sol) => {
  if (branches.length > 1) {
    duplicates++;
    console.log(`Duplicate SOL ID ${sol}:`, branches.map(b => `${b.name} (${b.id})`));
  }
});
console.log(`Total duplicate SOL IDs found among branches: ${duplicates}`);
