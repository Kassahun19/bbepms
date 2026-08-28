import fs from 'fs';
import { bunnaDistrictsAndAreaOffices } from './src/data/bunnaBranchDirectory';

const rawData = fs.readFileSync('./epms_persistent_data.json', 'utf-8');
const db = JSON.parse(rawData);

// We need to fix the users we added.
const execs = [
  { userId: "Board", password: "Board@2026", role: "BOARD_OF_DIRECTORS", jobTitle: "Board Chairman" },
  { userId: "CEO", password: "CEO@2026", role: "CEO", jobTitle: "Chief Executive Officer (CEO)" },
  { userId: "Finance", password: "Finance@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Finance Officer" },
  { userId: "Strategy", password: "Strategy@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Strategy Officer" },
  { userId: "Digital", password: "Digital@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Digital Officer" },
  { userId: "Corporate", password: "Corporate@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Corporate Banking Officer" },
  { userId: "People", password: "People@2026", role: "CHIEF_OFFICER", jobTitle: "Chief People & Culture Officer" },
  { userId: "Product", password: "Product@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Product & Innovation Officer" },
  { userId: "Transformation", password: "Transformation@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Transformation Officer" },
  { userId: "Retail", password: "Retail@2026", role: "CHIEF_OFFICER", jobTitle: "Chief Retail Banking Officer" },
  { userId: "Planning", password: "Planning@2026", role: "DIRECTOR", jobTitle: "Director (Strategic Planning)" }
];

bunnaDistrictsAndAreaOffices.forEach((d, i) => {
  // Strip " District" and " Area Office"
  let cleanName = d.name.replace(/ District/i, '').replace(/ Area Office/i, '').trim();
  
  const username = cleanName;
  const password = `${cleanName}@2026`;
  
  // Find user we previously added as `d.name` and update them, or just add new.
  let user = db.users.find(u => u.id === `USR-DIST-PREDEF-${i}`);
  if (!user) {
    user = db.users.find(u => u.id === `USR-DIST-${i}`); // Note the other ID
  }
  
  if (user) {
    user.userId = username;
    user.firstName = username;
    user.password = password;
  } else {
    // Add if missing
    db.users.push({
      id: `USR-DIST-PREDEF-${i}`,
      userId: username,
      email: `${username.replace(/\s+/g, '').toLowerCase()}@bunnabanksc.com`,
      firstName: username,
      middleName: "District",
      lastName: "Director",
      password: password,
      role: "DISTRICT_DIRECTOR",
      jobTitle: "District Director",
      districtId: d.id,
      districtName: d.name,
      branchId: "BR-HQ",
      branchName: "District Office",
      gender: "Male",
      age: 45,
      phone: "+251900000000",
      status: "Active",
      createdAt: "2026-01-01"
    });
  }
});

fs.writeFileSync('./epms_persistent_data.json', JSON.stringify(db, null, 2), 'utf-8');
console.log('Fixed epms_persistent_data.json successfully');
