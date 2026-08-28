import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./epms_persistent_data.json', 'utf-8'));
console.log("Districts in epms_persistent_data.json:");
(data.districts || []).forEach((d: any) => {
  console.log(`- ID: ${d.id}, Name: ${d.name}, Type: ${d.type}, Region: ${d.region}, SolId: ${d.solId}`);
});
