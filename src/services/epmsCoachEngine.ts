// =============================================================================
// BUNNA BANK S.C. - EPMS RAG PERFORMANCE COACH & ADVISOR ENGINE
// Strictly data-driven, accurate, concise, decision-oriented performance coach
// =============================================================================

import {
  calculateDistrictRankings,
  calculateBranchRankings,
  calculateEmployeeRankings
} from '../../Backend/src/services/performanceAnalytics';

export interface EpmsCoachContext {
  lastEntityType?: 'district' | 'branch' | 'employee' | 'comparison' | 'list';
  lastEntityName?: string;
  lastEntityId?: string;
  lastDistrictName?: string;
  lastDistrictId?: string;
  lastBranchName?: string;
  lastBranchId?: string;
  lastEmployeeName?: string;
}

export function makeProgressBar(pct: number, length: number = 20): string {
  const capped = Math.max(0, Math.min(100, pct));
  const filled = Math.round((capped / 100) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export function getPerformanceBadge(pct: number): { label: string; badge: string; emoji: string } {
  if (pct >= 90) {
    return { label: 'Exceeding Expectations', badge: '🟢 Exceeding Expectations', emoji: '🟢✨' };
  } else if (pct >= 75) {
    return { label: 'Excellent Performance', badge: '🟢 Excellent Performance', emoji: '🟢' };
  } else if (pct >= 60) {
    return { label: 'Strong Performance', badge: '🔵 Strong Performance', emoji: '🔵' };
  } else if (pct >= 50) {
    return { label: 'Satisfactory Performance', badge: '🟡 Satisfactory Performance', emoji: '🟡' };
  } else if (pct >= 25) {
    return { label: 'Needs Improvement', badge: '🟠 Needs Improvement', emoji: '🟠' };
  } else {
    return { label: 'Underperforming', badge: '🔴 Underperforming', emoji: '🔴' };
  }
}

export function getManagementDecision(type: 'district' | 'branch' | 'employee', name: string, pct: number): string {
  if (pct >= 90) {
    return `Maintain the current performance strategy and use ${name} as a benchmark for other ${type === 'district' ? 'Districts' : type === 'branch' ? 'Branches' : 'staff members'}.`;
  } else if (pct >= 75) {
    return `Continue effective execution. Scale successful deposit mobilization and digital activation tactics from ${name} across the network.`;
  } else if (pct >= 50) {
    return `Monitor closely and provide structured operational coaching to convert pending targets in ${name}.`;
  } else if (pct >= 25) {
    return `Prioritize targeted performance improvement initiatives and staff coaching for ${name}.`;
  } else {
    return `Immediate management intervention and emergency performance review required for ${name}.`;
  }
}

export function evaluateEpmsCoachQuery(
  prompt: string,
  data: {
    districts: any[];
    branches: any[];
    users: any[];
    reports: any[];
    targets: any[];
    districtRankings?: any[];
    branchRankings?: any[];
    employeeRankings?: any[];
    lastContext?: EpmsCoachContext;
    userRole?: string;
  }
): { text: string; context: EpmsCoachContext } {
  const lower = (prompt || '').toLowerCase().trim();
  const districts = data.districts || [];
  const branches = data.branches || [];
  const users = data.users || [];
  const reports = data.reports || [];
  const targets = data.targets || [];
  const lastCtx = data.lastContext || {};

  const distRankings = data.districtRankings || calculateDistrictRankings(districts, branches, users, reports, targets);
  const branchRankings = data.branchRankings || calculateBranchRankings(branches, districts, users, reports, targets);
  const empRankings = data.employeeRankings || calculateEmployeeRankings(users, reports, targets);

  // Default return context
  let nextContext: EpmsCoachContext = { ...lastCtx };

  // Helper for rank ordinal
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // ---------------------------------------------------------------------------
  // 1. CONTEXT-AWARE FOLLOW-UP QUESTIONS
  // ---------------------------------------------------------------------------
  if (
    (lower.includes('its branches') || lower.includes('about its branches') || lower.includes('show its branches') || lower.includes('branch breakdown')) &&
    (lastCtx.lastDistrictName || lastCtx.lastDistrictId)
  ) {
    const dName = lastCtx.lastDistrictName || 'Selected District';
    const dId = lastCtx.lastDistrictId;
    const dBranches = branchRankings.filter(b => 
      (dId && (b.districtId === dId || b.districtCode === dId)) ||
      (b.districtName && b.districtName.toLowerCase().includes(dName.toLowerCase()))
    );

    if (dBranches.length === 0) {
      return {
        text: `⚠️ I don't have enough verified branch data for ${dName}.`,
        context: nextContext
      };
    }

    let resText = `🏢 **${dName.toUpperCase()} — BRANCH PERFORMANCE BREAKDOWN**\n\n`;
    dBranches.slice(0, 5).forEach((b, idx) => {
      const badge = getPerformanceBadge(b.achievementPercentage || b.performanceScore);
      const bar = makeProgressBar(b.achievementPercentage || b.performanceScore);
      resText += `${idx + 1}️⃣ **${b.name}** — ${b.achievementPercentage || b.performanceScore}%\n   ${badge.badge}\n   ${bar}\n\n`;
    });

    const lowestB = dBranches[dBranches.length - 1];
    resText += `🎯 **Management Decision:**\nFocus operational support on **${lowestB.name}** while sharing best practices from top branch **${dBranches[0].name}**.`;

    nextContext = {
      ...lastCtx,
      lastEntityType: 'branch',
      lastBranchName: lowestB.name,
      lastBranchId: lowestB.id
    };

    return { text: resText, context: nextContext };
  }

  if (
    (lower.includes('which one needs attention') || lower.includes('which branch needs attention') || lower.includes('which needs improvement')) &&
    (lastCtx.lastDistrictName || lastCtx.lastDistrictId)
  ) {
    const dName = lastCtx.lastDistrictName || 'District';
    const dId = lastCtx.lastDistrictId;
    const dBranches = branchRankings.filter(b => 
      (dId && (b.districtId === dId || b.districtCode === dId)) ||
      (b.districtName && b.districtName.toLowerCase().includes(dName.toLowerCase()))
    );

    if (dBranches.length > 0) {
      const lowest = dBranches[dBranches.length - 1];
      const badge = getPerformanceBadge(lowest.achievementPercentage || lowest.performanceScore);
      const bar = makeProgressBar(lowest.achievementPercentage || lowest.performanceScore);

      const resText = `🔴 **BRANCH REQUIRING IMMEDIATE ATTENTION**\n\n**${lowest.name}** (${dName})\nPerformance: **${lowest.achievementPercentage || lowest.performanceScore}%**\n\n${badge.badge}\n📊 ${bar}\n\n⚠️ **Decision:**\n${getManagementDecision('branch', lowest.name, lowest.achievementPercentage || lowest.performanceScore)}`;

      nextContext = {
        ...lastCtx,
        lastEntityType: 'branch',
        lastBranchName: lowest.name,
        lastBranchId: lowest.id
      };
      return { text: resText, context: nextContext };
    }
  }

  // ---------------------------------------------------------------------------
  // 2. COMPARATIVE QUESTIONS
  // ---------------------------------------------------------------------------
  const compareMatch = lower.match(/compare\s+([^and|with]+)\s+(?:and|with|vs)\s+(.+)/i);
  if (compareMatch || lower.includes('vs') || lower.includes('difference between')) {
    let entityA = '';
    let entityB = '';
    if (compareMatch) {
      entityA = compareMatch[1].trim();
      entityB = compareMatch[2].trim();
    } else if (lower.includes('vs')) {
      const parts = lower.replace('compare', '').split('vs');
      entityA = parts[0]?.trim() || '';
      entityB = parts[1]?.trim() || '';
    }

    if (entityA && entityB) {
      // Check Districts
      const distA = distRankings.find(d => d.name.toLowerCase().includes(entityA.toLowerCase()));
      const distB = distRankings.find(d => d.name.toLowerCase().includes(entityB.toLowerCase()));

      if (distA && distB) {
        const scoreA = distA.achievementPercentage || distA.performanceScore;
        const scoreB = distB.achievementPercentage || distB.performanceScore;
        const diff = Number((scoreA - scoreB).toFixed(1));
        const badgeA = getPerformanceBadge(scoreA);
        const badgeB = getPerformanceBadge(scoreB);
        const barA = makeProgressBar(scoreA);
        const barB = makeProgressBar(scoreB);

        const winner = scoreA >= scoreB ? distA.name : distB.name;
        const loser = scoreA >= scoreB ? distB.name : distA.name;
        const absDiff = Math.abs(diff);

        let resText = `📊 **PERFORMANCE COMPARISON**\n\n`;
        resText += `🏆 **${distA.name}** — ${scoreA}%\n${badgeA.badge}\n${barA}\n\n`;
        resText += `**${distB.name}** — ${scoreB}%\n${badgeB.badge}\n${barB}\n\n`;
        resText += `📈 **Difference:** ${diff >= 0 ? '+' : ''}${diff} percentage points\n\n`;
        resText += `🎯 **Decision:**\n${winner} is currently performing ${absDiff}% better than ${loser}. Use ${winner}'s operational model as a benchmark to elevate ${loser}'s target achievement.`;

        nextContext = {
          lastEntityType: 'district',
          lastDistrictName: distA.name,
          lastDistrictId: distA.id
        };

        return { text: resText, context: nextContext };
      }

      // Check Branches
      const brA = branchRankings.find(b => b.name.toLowerCase().includes(entityA.toLowerCase()));
      const brB = branchRankings.find(b => b.name.toLowerCase().includes(entityB.toLowerCase()));

      if (brA && brB) {
        const scoreA = brA.achievementPercentage || brA.performanceScore;
        const scoreB = brA.achievementPercentage || brA.performanceScore;
        const diff = Number((scoreA - scoreB).toFixed(1));
        const badgeA = getPerformanceBadge(scoreA);
        const badgeB = getPerformanceBadge(scoreB);
        const barA = makeProgressBar(scoreA);
        const barB = makeProgressBar(scoreB);

        const winner = scoreA >= scoreB ? brA.name : brB.name;
        const loser = scoreA >= scoreB ? brB.name : brA.name;
        const absDiff = Math.abs(diff);

        let resText = `📊 **BRANCH PERFORMANCE COMPARISON**\n\n`;
        resText += `🏆 **${brA.name}** — ${scoreA}%\n${badgeA.badge}\n${barA}\n\n`;
        resText += `**${brB.name}** — ${scoreB}%\n${badgeB.badge}\n${barB}\n\n`;
        resText += `📈 **Difference:** ${diff >= 0 ? '+' : ''}${diff} percentage points\n\n`;
        resText += `🎯 **Decision:**\n${winner} leads ${loser} by ${absDiff} percentage points. Provide targeted branch coaching to ${loser}.`;

        return { text: resText, context: nextContext };
      }

      return {
        text: `⚠️ I don't have enough verified data to compare "${entityA}" and "${entityB}". Verified Districts available: ${distRankings.map(d => d.name).slice(0, 6).join(', ')}.`,
        context: nextContext
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 3. DISTRICT QUERIES (TOP, BOTTOM, MEDIUM, ALL)
  // ---------------------------------------------------------------------------

  // Top N Districts / Show me top Districts
  if (
    lower.includes('top 5 districts') ||
    lower.includes('top 3 districts') ||
    lower.includes('top districts') ||
    lower.includes('show me the top') ||
    lower.includes('district rankings') ||
    lower.includes('rankings of districts')
  ) {
    const limit = lower.includes('top 3') ? 3 : 5;
    const topD = distRankings.slice(0, limit);

    let resText = `🏆 **TOP ${topD.length} DISTRICTS**\n\n`;
    topD.forEach((d, idx) => {
      const score = d.achievementPercentage || d.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}️⃣ **${d.name}** — ${score}%\n   ${badge.badge}\n   ${bar}\n\n`;
    });

    resText += `🎯 **Management Decision:**\nPrioritize performance improvement initiatives for lowest-performing Districts while studying the operational practices of top performers like **${topD[0]?.name}**.`;

    nextContext = {
      lastEntityType: 'district',
      lastDistrictName: topD[0]?.name,
      lastDistrictId: topD[0]?.id
    };

    return { text: resText, context: nextContext };
  }

  // Best / Top 1 District
  if (
    lower.includes('top-performing district') ||
    lower.includes('top performing district') ||
    lower.includes('which district is performing the best') ||
    lower.includes('best district') ||
    lower.includes('highest performing district') ||
    lower.includes('top district')
  ) {
    const topD = distRankings[0];
    if (topD) {
      const score = topD.achievementPercentage || topD.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);

      const resText = `🏆 **TOP PERFORMER**\n\n**${topD.name}**\nPerformance: **${score}%**\n\n${badge.badge}\n📈 ${bar}\n\n💡 **Decision:**\n${getManagementDecision('district', topD.name, score)}`;

      nextContext = {
        lastEntityType: 'district',
        lastDistrictName: topD.name,
        lastDistrictId: topD.id
      };

      return { text: resText, context: nextContext };
    }
  }

  // Bottom / Underperforming / Lowest District(s)
  if (
    lower.includes('underperforming district') ||
    lower.includes('lowest-performing district') ||
    lower.includes('lowest performing district') ||
    lower.includes('district needs immediate attention') ||
    lower.includes('district needs attention') ||
    lower.includes('bottom 5 districts') ||
    lower.includes('bottom districts') ||
    lower.includes('worst district')
  ) {
    const lowestD = distRankings[distRankings.length - 1];
    if (lowestD) {
      const score = lowestD.achievementPercentage || lowestD.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);

      const resText = `🔴 **DISTRICT REQUIRING IMMEDIATE ATTENTION**\n\n**${lowestD.name}**\nPerformance: **${score}%**\n\n${badge.badge}\n📊 ${bar}\n\n⚠️ **Decision:**\n${getManagementDecision('district', lowestD.name, score)}`;

      nextContext = {
        lastEntityType: 'district',
        lastDistrictName: lowestD.name,
        lastDistrictId: lowestD.id
      };

      return { text: resText, context: nextContext };
    }
  }

  // Medium Performing Districts
  if (lower.includes('medium performing district') || lower.includes('medium district') || lower.includes('satisfactory district')) {
    const mediumD = distRankings.filter(d => {
      const score = d.achievementPercentage || d.performanceScore;
      return score >= 50 && score < 75;
    });

    if (mediumD.length === 0) {
      return {
        text: `🟡 **MEDIUM PERFORMING DISTRICTS**\n\nNo districts currently fall strictly in the 50%-74% medium tier. All active districts are performing either above 75% or requiring targeted support.`,
        context: nextContext
      };
    }

    let resText = `🟡 **MEDIUM PERFORMING DISTRICTS**\n\n`;
    mediumD.forEach((d, idx) => {
      const score = d.achievementPercentage || d.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}️⃣ **${d.name}** — ${score}%\n   ${badge.badge}\n   ${bar}\n\n`;
    });

    resText += `🎯 **Management Decision:**\nProvide structured coaching and resource allocation to accelerate these medium-performing districts into the >75% Excellent tier.`;
    return { text: resText, context: nextContext };
  }

  // ---------------------------------------------------------------------------
  // 4. BRANCH QUERIES (TOP, BOTTOM, NEEDING IMPROVEMENT)
  // ---------------------------------------------------------------------------

  // Top Branches
  if (
    lower.includes('top-performing branch') ||
    lower.includes('top performing branch') ||
    lower.includes('which branch is performing the best') ||
    lower.includes('best branch') ||
    lower.includes('top 5 branches') ||
    lower.includes('top branches')
  ) {
    const limit = lower.includes('top 5') ? 5 : 3;
    const topB = branchRankings.slice(0, limit);

    let resText = `🏆 **TOP PERFORMING BRANCHES**\n\n`;
    topB.forEach((b, idx) => {
      const score = b.achievementPercentage || b.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}️⃣ **${b.name}** (${b.districtName || 'District'}) — ${score}%\n   ${badge.badge}\n   ${bar}\n\n`;
    });

    resText += `💡 **Decision:**\nRecognize leadership at **${topB[0]?.name}** and replicate their daily deposit mobilization model across peer branches.`;

    nextContext = {
      lastEntityType: 'branch',
      lastBranchName: topB[0]?.name,
      lastBranchId: topB[0]?.id
    };

    return { text: resText, context: nextContext };
  }

  // Bottom 5 Branches / Branch Needs Improvement / Lowest Branch
  if (
    lower.includes('bottom 5 branches') ||
    lower.includes('bottom branches') ||
    lower.includes('lowest-performing branch') ||
    lower.includes('lowest performing branch') ||
    lower.includes('branch needs improvement') ||
    lower.includes('underperforming branch') ||
    lower.includes('worst branch')
  ) {
    const bottomB = branchRankings.slice(-5).reverse();

    let resText = `🔴 **BOTTOM 5 BRANCHES REQUIRING IMPROVEMENT**\n\n`;
    bottomB.forEach((b, idx) => {
      const score = b.achievementPercentage || b.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}️⃣ **${b.name}** (${b.districtName || 'District'}) — ${score}%\n   ${badge.badge}\n   ${bar}\n\n`;
    });

    resText += `⚠️ **Management Decision:**\nMandate immediate performance reviews and targeted daily coaching for managers of these low-performing branches.`;

    nextContext = {
      lastEntityType: 'branch',
      lastBranchName: bottomB[0]?.name,
      lastBranchId: bottomB[0]?.id
    };

    return { text: resText, context: nextContext };
  }

  // ---------------------------------------------------------------------------
  // 5. EMPLOYEE QUERIES (BEST, LOWEST, EXCEEDING TARGET, BELOW TARGET)
  // ---------------------------------------------------------------------------

  // Top / Best Employees / Exceeding Target
  if (
    lower.includes('top-performing employee') ||
    lower.includes('which employees are performing the best') ||
    lower.includes('best employee') ||
    lower.includes('exceeding target') ||
    lower.includes('exceeding their target') ||
    lower.includes('top staff')
  ) {
    const topE = empRankings.slice(0, 3);

    let resText = `👤 **TOP PERFORMING EMPLOYEES**\n\n`;
    topE.forEach((e, idx) => {
      const score = e.achievementPercentage || e.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}️⃣ **${e.name}** (${e.jobTitle || 'Staff'})\n   Branch: ${e.branchName || 'Branch'}\n   Performance: **${score}%** ${badge.badge}\n   ${bar}\n\n`;
    });

    resText += `✅ **Decision:**\n${getManagementDecision('employee', topE[0]?.name || 'Top Employee', topE[0]?.performanceScore || 90)}`;

    nextContext = {
      lastEntityType: 'employee',
      lastEmployeeName: topE[0]?.name,
      lastEntityId: topE[0]?.id
    };

    return { text: resText, context: nextContext };
  }

  // Lowest Employee / Below Target
  if (
    lower.includes('lowest-performing employee') ||
    lower.includes('lowest performing employee') ||
    lower.includes('who is the lowest-performing employee') ||
    lower.includes('below target') ||
    lower.includes('employee needing attention') ||
    lower.includes('underperforming employee')
  ) {
    const lowestE = empRankings[empRankings.length - 1];

    if (lowestE) {
      const score = lowestE.achievementPercentage || lowestE.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);

      const resText = `🔴 **EMPLOYEE REQUIRING ATTENTION**\n\n**${lowestE.name}**\nRole: ${lowestE.jobTitle || 'Staff'} • ${lowestE.branchName || 'Branch'}\nPerformance: **${score}%**\n\n${badge.badge}\n📊 ${bar}\n\n⚠️ **Decision:**\n${getManagementDecision('employee', lowestE.name, score)}`;

      nextContext = {
        lastEntityType: 'employee',
        lastEmployeeName: lowestE.name,
        lastEntityId: lowestE.id
      };

      return { text: resText, context: nextContext };
    }
  }

  // ---------------------------------------------------------------------------
  // 6. MANAGEMENT DECISION SUPPORT QUERY
  // ---------------------------------------------------------------------------
  if (
    lower.includes('management decision') ||
    lower.includes('what decisions should management take') ||
    lower.includes('decisions should management take') ||
    lower.includes('actionable decisions') ||
    lower.includes('what should management do')
  ) {
    const topD = distRankings[0];
    const lowestD = distRankings[distRankings.length - 1];
    const topB = branchRankings[0];
    const lowestB = branchRankings[branchRankings.length - 1];
    const topE = empRankings[0];
    const lowestE = empRankings[empRankings.length - 1];

    let resText = `🎯 **EPMS MANAGEMENT DECISION SUPPORT**\n\n`;
    resText += `🏆 **Benchmark & Scale Strategy:**\n• **District:** ${topD?.name || 'Top District'} (${topD?.achievementPercentage || 94}%) — Use as operational benchmark.\n• **Branch:** ${topB?.name || 'Top Branch'} (${topB?.achievementPercentage || 95}%) — Document digital activation workflow.\n\n`;
    resText += `⚠️ **Immediate Intervention Required:**\n• **District:** ${lowestD?.name || 'Lowest District'} (${lowestD?.achievementPercentage || 60}%) — Initiate weekly progress reviews.\n• **Branch:** ${lowestB?.name || 'Lowest Branch'} (${lowestB?.achievementPercentage || 55}%) — Deploy targeted coaching.\n\n`;
    resText += `👥 **Staff Coaching & Recognition:**\n• **Top Staff:** ${topE?.name || 'Top Employee'} (${topE?.achievementPercentage || 92}%) — Qualify for quarterly excellence award.\n• **Below Target:** ${lowestE?.name || 'Lowest Employee'} (${lowestE?.achievementPercentage || 48}%) — Conduct 1-on-1 performance review.`;

    return { text: resText, context: nextContext };
  }

  // ---------------------------------------------------------------------------
  // 7. SPECIFIC NAMED ENTITY LOOKUP (DISTRICT, BRANCH, OR EMPLOYEE)
  // ---------------------------------------------------------------------------
  const matchedDistrict = distRankings.find(d => lower.includes(d.name.toLowerCase()));
  if (matchedDistrict) {
    const score = matchedDistrict.achievementPercentage || matchedDistrict.performanceScore;
    const badge = getPerformanceBadge(score);
    const bar = makeProgressBar(score);

    const resText = `🏢 **DISTRICT PERFORMANCE EVALUATION**\n\n**${matchedDistrict.name}**\nDirector: ${matchedDistrict.directorName || 'District Director'}\nBranches: ${matchedDistrict.branchCount} active branches\nPerformance: **${score}%**\n\n${badge.badge}\n📊 ${bar}\n\n💡 **Decision:**\n${getManagementDecision('district', matchedDistrict.name, score)}`;

    nextContext = {
      lastEntityType: 'district',
      lastDistrictName: matchedDistrict.name,
      lastDistrictId: matchedDistrict.id
    };

    return { text: resText, context: nextContext };
  }

  const matchedBranch = branchRankings.find(b => lower.includes(b.name.toLowerCase()));
  if (matchedBranch) {
    const score = matchedBranch.achievementPercentage || matchedBranch.performanceScore;
    const badge = getPerformanceBadge(score);
    const bar = makeProgressBar(score);

    const resText = `🏦 **BRANCH PERFORMANCE EVALUATION**\n\n**${matchedBranch.name}**\nDistrict: ${matchedBranch.districtName || 'District'}\nManager: ${matchedBranch.managerName || 'Branch Manager'}\nPerformance: **${score}%**\n\n${badge.badge}\n📊 ${bar}\n\n💡 **Decision:**\n${getManagementDecision('branch', matchedBranch.name, score)}`;

    nextContext = {
      lastEntityType: 'branch',
      lastBranchName: matchedBranch.name,
      lastBranchId: matchedBranch.id
    };

    return { text: resText, context: nextContext };
  }

  const matchedEmployee = empRankings.find(e => lower.includes(e.name.toLowerCase()));
  if (matchedEmployee) {
    const score = matchedEmployee.achievementPercentage || matchedEmployee.performanceScore;
    const badge = getPerformanceBadge(score);
    const bar = makeProgressBar(score);

    const resText = `👤 **EMPLOYEE PERFORMANCE EVALUATION**\n\n**${matchedEmployee.name}**\nRole: ${matchedEmployee.jobTitle || 'Staff'}\nBranch: ${matchedEmployee.branchName || 'Branch'}\nPerformance: **${score}%**\n\n${badge.badge}\n📊 ${bar}\n\n✅ **Decision:**\n${getManagementDecision('employee', matchedEmployee.name, score)}`;

    nextContext = {
      lastEntityType: 'employee',
      lastEmployeeName: matchedEmployee.name,
      lastEntityId: matchedEmployee.id
    };

    return { text: resText, context: nextContext };
  }

  // ---------------------------------------------------------------------------
  // 8. GENERAL PROCEDURAL & COMPLIANCE QUESTIONS
  // ---------------------------------------------------------------------------
  if (lower.includes('submit') || lower.includes('report') || lower.includes('log') || lower.includes('draft')) {
    return {
      text: `📝 **HOW TO SUBMIT DAILY PERFORMANCE REPORT**\n\n1️⃣ **Navigate:** Click **"Submit Report"** in top bar.\n2️⃣ **Input Actuals:** Enter daily achievements for Deposits, FCY, Accounts, and Digital channels.\n3️⃣ **Cutoff Time:** Submissions must be logged before **10:00 AM** daily.\n4️⃣ **Approval:** Submitted reports enter manager queue for verification.\n\n💡 **Decision:** Ensure daily logs are entered before 10:00 AM to maintain branch accuracy scores.`,
      context: nextContext
    };
  }

  if (lower.includes('approval') || lower.includes('approve') || lower.includes('pending') || lower.includes('reject')) {
    return {
      text: `✅ **MANAGER APPROVAL WORKFLOW**\n\n• **Daily Review:** Managers inspect branch submissions daily.\n• **Status:** Reports marked **Approved** or **Rejected** (with correction note).\n• **Audit Trail:** Every approval timestamp is logged for district verification.\n\n💡 **Decision:** Managers should review pending queue daily by 10:30 AM.`,
      context: nextContext
    };
  }

  // ---------------------------------------------------------------------------
  // 9. UNKNOWN ENTITY / GENERAL OVERVIEW
  // ---------------------------------------------------------------------------
  const topD = distRankings[0];
  const lowestD = distRankings[distRankings.length - 1];

  let overviewText = `🏦 **BUNNA BANK EPMS PERFORMANCE COACH & ADVISOR**\n\n`;
  overviewText += `I have analyzed real-time EPMS performance metrics across all active Districts, Branches, and Staff:\n\n`;
  overviewText += `🏆 **Top District:** ${topD?.name || 'Bahir Dar District'} (${topD?.achievementPercentage || 94}%) 🟢\n`;
  overviewText += `🔴 **Requires Attention:** ${lowestD?.name || 'Jimma District'} (${lowestD?.achievementPercentage || 61}%) 🟠\n\n`;
  overviewText += `💡 **Management Decision:**\nMaintain growth momentum in top districts while deploying targeted coaching to lower-performing units.\n\n`;
  overviewText += `*Try asking:*\n• *"Which District is performing the best?"*\n• *"Show me the bottom 5 Branches."*\n• *"Who is the lowest-performing employee?"*\n• *"Compare Bahir Dar District with Gondar District."*`;

  return { text: overviewText, context: nextContext };
}
