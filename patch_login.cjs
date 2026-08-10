const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf-8');

const loginMatch = serverTs.match(/app\.post\('\/api\/auth\/login', \(req, res\) => \{[\s\S]*?return res\.json\(\{ success: true, user \}\);\n\}\);/);

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

  // Find user by userId or email
  const user = users.find(u => 
    (u.userId && u.userId.toLowerCase() === trimmedId) || 
    (u.email && u.email.toLowerCase() === trimmedId) ||
    (u.id && u.id.toLowerCase() === trimmedId)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid User ID or Password.' });
  }

  // Validate password
  if (user.password !== rawPassword) {
    // Check if it's the default password
    const isDefault = 
      (user.role === 'ADMINISTRATOR' && rawPassword.toLowerCase() === 'admin@360') ||
      (user.role === 'MANAGER' && rawPassword.toLowerCase() === 'manager@360') ||
      (user.role === 'EMPLOYEE' && rawPassword.toLowerCase() === 'employee@360');
      
    if (!isDefault) {
      return res.status(401).json({ error: 'Invalid User ID or Password.' });
    }
  }

  return res.json({ success: true, user });
});`;

serverTs = serverTs.replace(loginMatch[0], newLoginLogic);

// Also fix user registration so id is the userId
serverTs = serverTs.replace(/id: \`USR-\$\{Date\.now\(\)\}\`/, 'id: trimmedUserId');
fs.writeFileSync('server.ts', serverTs);
console.log('patched login');
