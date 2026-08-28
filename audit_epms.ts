import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./epms_persistent_data.json', 'utf-8'));
console.log("EPMS Persistent Data Districts:", data.districts?.length);
console.log("EPMS Persistent Data Branches:", data.branches?.length);
console.log("EPMS Persistent Data Users:", data.users?.length);

const branchSolMap = new Map<string, any[]>();
(data.branches || []).forEach((b: any) => {
  const sol = String(b.solId || b.sol_id || '').trim();
  if (!branchSolMap.has(sol)) branchSolMap.set(sol, []);
  branchSolMap.get(sol)!.push(b);
});

let dupes = 0;
branchSolMap.forEach((branches, sol) => {
  if (branches.length > 1) {
    dupes++;
    console.log(`EPMS Duplicate SOL ID ${sol}:`, branches.map((b: any) => `${b.name} (${b.id})`));
  }
});
console.log(`EPMS duplicate SOL IDs found: ${dupes}`);
