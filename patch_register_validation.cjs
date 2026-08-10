const fs = require('fs');
let content = fs.readFileSync('src/components/auth/RegisterModal.tsx', 'utf-8');

const validationLogic = `
    // 1. Branch Manager validation
    if (roleType === 'Managerial' && selectedBranchId) {
      try {
        const res = await fetch(\`/api/auth/branch-manager-status/\${selectedBranchId}\`);
        const data = await res.json();
        if (data.hasManager) {
          setError('A Branch Manager has already been assigned to this branch. Please register as an Employee or contact the System Administrator.');
          setLoading(false);
          return;
        }
      } catch (err) {}
    }

    // 2. Validate User ID uniqueness
    try {
      const res = await fetch(\`/api/auth/validate-userid?userId=\${userId}\`);
      const data = await res.json();
      if (!data.available) {
        setError('User ID is already taken by another staff member.');
        setLoading(false);
        return;
      }
    } catch (err) {}
`;

content = content.replace(/const handleRegister = async \(e: React.FormEvent\) => \{\s*e.preventDefault\(\);\s*setError\(''\);\s*setLoading\(true\);/, "const handleRegister = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setError('');\n    setLoading(true);\n" + validationLogic);

fs.writeFileSync('src/components/auth/RegisterModal.tsx', content);
