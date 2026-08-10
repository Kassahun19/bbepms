const fs = require('fs');
let db = JSON.parse(fs.readFileSync('epms_persistent_data.json'));
let branches = db.branches;
let districts = db.districts;
let content = `import { District, Branch } from '../types';

export const bunnaDistrictsAndAreaOffices: District[] = ${JSON.stringify(districts, null, 2)};

export const bunnaBranchDirectory: Branch[] = ${JSON.stringify(branches, null, 2)};
`;
fs.writeFileSync('src/data/bunnaBranchDirectory.ts', content);
