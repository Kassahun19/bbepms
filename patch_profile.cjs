const fs = require('fs');
let content = fs.readFileSync('src/components/profile/UserProfileModal.tsx', 'utf-8');

// 1. Add state variables for editable fields
content = content.replace(/const \[phone, setPhone\].*;/, 
`const [firstName, setFirstName] = useState(activeEmployee.firstName || '');
  const [middleName, setMiddleName] = useState(activeEmployee.middleName || '');
  const [lastName, setLastName] = useState(activeEmployee.lastName || '');
  const [userIdInput, setUserIdInput] = useState(activeEmployee.userId || '');
  const [phone, setPhone] = useState(activeEmployee.phone || '');`);

// 2. Update handleSaveProfile to actually save
const saveFunction = `const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(\`/api/employees/\${activeEmployee.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          userId: userIdInput,
          email,
          phone,
        })
      });
      if (res.ok) {
        const updated = await res.json();
        if (onUserUpdated) onUserUpdated(updated);
        localStorage.setItem('bunna_user', JSON.stringify(updated));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };`;
content = content.replace(/const handleSaveProfile = \(e: React\.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => setIsSaved\(false\), 3000\);\n  \};/, saveFunction);

// 3. Replace the read-only inputs with editable ones
const inputsReplaced = `<div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">User ID</label>
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={e => setUserIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>`;

content = content.replace(/<div>\s*<label[^>]*>First Name<\/label>[\s\S]*?<div>\s*<label[^>]*>Email Address<\/label>/, inputsReplaced);

fs.writeFileSync('src/components/profile/UserProfileModal.tsx', content);
console.log('patched');
