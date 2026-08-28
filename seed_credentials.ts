import fs from 'fs';
import { bunnaDistrictsAndAreaOffices } from './src/data/bunnaBranchDirectory';

const rawData = fs.readFileSync('./epms_persistent_data.json', 'utf-8');
const db = JSON.parse(rawData);

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

const newUsers = [];

const createUser = (u, i) => {
  return {
    id: `USR-EXEC-PREDEF-${i}`,
    userId: u.userId,
    email: `${u.userId.toLowerCase()}@bunnabanksc.com`,
    firstName: u.userId,
    middleName: "",
    lastName: "User",
    password: u.password,
    role: u.role,
    jobTitle: u.jobTitle,
    districtId: "DIST-HO",
    districtName: "Head Office",
    branchId: "BR-HQ",
    branchName: "Head Office",
    gender: "Male",
    age: 45,
    phone: "+251900000000",
    status: "Active",
    createdAt: "2026-01-01"
  };
};

execs.forEach((u, i) => {
  let user = db.users.find(user => user.userId === u.userId);
  if (!user) {
    const newUser = createUser(u, i);
    db.users.push(newUser);
    newUsers.push(newUser);
  } else {
    user.password = u.password;
    user.role = u.role;
    user.jobTitle = u.jobTitle;
  }
});

bunnaDistrictsAndAreaOffices.forEach((d, i) => {
  let cleanName = d.name.replace(/ District/i, '').replace(/ Area Office/i, '').trim();
  const username = cleanName;
  const password = `${cleanName}@2026`;
  
  let user = db.users.find(user => user.userId === username);
  if (!user) {
    const newUser = {
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
      branchId: "BR-HQ", // Or something dummy
      branchName: "District Office",
      gender: "Male",
      age: 45,
      phone: "+251900000000",
      status: "Active",
      createdAt: "2026-01-01"
    };
    db.users.push(newUser);
    newUsers.push(newUser);
  } else {
    user.password = password;
    user.role = "DISTRICT_DIRECTOR";
    user.districtId = d.id;
    user.districtName = d.name;
  }
});

fs.writeFileSync('./epms_persistent_data.json', JSON.stringify(db, null, 2), 'utf-8');
console.log(`Added ${newUsers.length} predefined users.`);
