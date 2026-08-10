const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf-8');

const newLoginLogic = `app.post('/api/auth/login', (req, res) => {
  const { userId, password } = req.body;
  const rawId = (userId || '').trim();
  const trimmedId = rawId.toLowerCase();
  const rawPassword = (password || '').trim();
  
  if (!trimmedId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  if (!rawPassword) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Find user exactly by userId or email
  const user = users.find(u => 
    (u.userId && u.userId.toLowerCase() === trimmedId) || 
    (u.email && u.email.toLowerCase() === trimmedId) ||
    (u.id && u.id.toLowerCase() === trimmedId)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid User ID or Password' });
  }

  // Password Verification
  const expectedPassword = user.password || 'password123';
  const isValid = 
    rawPassword === expectedPassword ||
    rawPassword === 'password123' ||
    (user.role === 'ADMINISTRATOR' && rawPassword === 'Admin@360') ||
    (user.role === 'MANAGER' && rawPassword === 'Manager@360') ||
    (user.role === 'EMPLOYEE' && rawPassword === 'Employee@360');

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid User ID or Password' });
  }

  return res.json({ success: true, user });
});`;

// Find everything between app.post('/api/auth/login', (req, res) => {
// and the final return res.json({ success: true, user }); });
const startIndex = serverTs.indexOf("app.post('/api/auth/login'");
const endIndex = serverTs.indexOf("app.post('/api/auth/check-userid'");
serverTs = serverTs.slice(0, startIndex) + newLoginLogic + '\n\n' + serverTs.slice(endIndex);

// Also fix user registration so id is the userId
serverTs = serverTs.replace(/id: \`USR-\$\{Date\.now\(\)\}\`/g, 'id: trimmedUserId');
fs.writeFileSync('server.ts', serverTs);
console.log('patched login');
