const db = { users: [] };
const req = {
  headers: {
    'x-user-role': 'BOARD_OF_DIRECTORS',
    'x-district-id': 'HWA'
  },
  query: {},
  body: {}
};

function getCallerContext(req) {
  const role = (req.headers['x-user-role'] || req.query.userRole || req.body?.userRole || '').toString().toUpperCase();
  const userId = (req.headers['x-user-id'] || req.query.userId || req.body?.userId || '').toString();
  const districtId = (req.headers['x-district-id'] || req.query.userDistrictId || req.query.districtId || req.body?.districtId || '').toString();
  const branchId = (req.headers['x-branch-id'] || req.query.userBranchId || req.query.branchId || req.body?.branchId || '').toString();

  let user = null;
  if (userId) {
    user = (db.users || []).find((u) => u.id === userId || u.userId === userId || (u.email && u.email.toLowerCase() === userId.toLowerCase()));
  }

  const effectiveRole = user ? user.role : (role || 'EMPLOYEE');
  const effectiveDistrictId = user ? (user.districtId || districtId) : districtId;
  const effectiveDistrictName = user ? (user.districtName || '') : '';
  const effectiveBranchId = user ? (user.branchId || branchId) : branchId;

  return {
    user,
    role: effectiveRole,
    userId,
    districtId: effectiveDistrictId,
    districtName: effectiveDistrictName,
    branchId: effectiveBranchId,
    isBoardOrCeoOrAdmin: ['BOARD_OF_DIRECTORS', 'CEO', 'ADMINISTRATOR'].includes(effectiveRole),
    isChief: ['CHIEF_OFFICER', 'DIRECTOR'].includes(effectiveRole),
    isDistrictDirector: effectiveRole === 'DISTRICT_DIRECTOR',
    isManager: ['MANAGER', 'BRANCH_MANAGER'].includes(effectiveRole),
    isEmployee: effectiveRole === 'EMPLOYEE'
  };
}

console.log(getCallerContext(req));
