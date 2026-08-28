import fs from 'fs';
import { bunnaDistrictsAndAreaOffices } from './src/data/bunnaBranchDirectory';

const mockDataPath = './src/data/mockData.ts';
let mockDataContent = fs.readFileSync(mockDataPath, 'utf-8');

bunnaDistrictsAndAreaOffices.forEach((d, i) => {
  const oldUsername = d.name;
  const cleanName = d.name.replace(/ District/i, '').replace(/ Area Office/i, '').trim();
  const newUsername = cleanName;
  const newPassword = `${cleanName}@2026`;
  
  // It's a bit tricky to safely regex replace inside a file, so let's just rewrite the block we generated.
  // Actually, I can just match the exact old username because it was uniquely generated.
  
  mockDataContent = mockDataContent.replace(
    `userId: '${oldUsername}',`,
    `userId: '${newUsername}',`
  );
  mockDataContent = mockDataContent.replace(
    `firstName: '${oldUsername}',`,
    `firstName: '${newUsername}',`
  );
  mockDataContent = mockDataContent.replace(
    `password: '${oldUsername}@2026',`,
    `password: '${newPassword}',`
  );
});

fs.writeFileSync(mockDataPath, mockDataContent, 'utf-8');
console.log('Fixed src/data/mockData.ts successfully');
