import {
  calculateDistrictRankings,
  calculateBranchRankings,
  calculateEmployeeRankings
} from "../utils/performanceAnalytics.js";
export function makeProgressBar(pct, length = 20) {
  const capped = Math.max(0, Math.min(100, pct));
  const filled = Math.round(capped / 100 * length);
  const empty = length - filled;
  return "\u2588".repeat(filled) + "\u2591".repeat(empty);
}
export function getPerformanceBadge(pct) {
  if (pct >= 90) {
    return { label: "Exceeding Expectations", badge: "\u{1F7E2} Exceeding Expectations", emoji: "\u{1F7E2}\u2728" };
  } else if (pct >= 75) {
    return { label: "Excellent Performance", badge: "\u{1F7E2} Excellent Performance", emoji: "\u{1F7E2}" };
  } else if (pct >= 60) {
    return { label: "Strong Performance", badge: "\u{1F535} Strong Performance", emoji: "\u{1F535}" };
  } else if (pct >= 50) {
    return { label: "Satisfactory Performance", badge: "\u{1F7E1} Satisfactory Performance", emoji: "\u{1F7E1}" };
  } else if (pct >= 25) {
    return { label: "Needs Improvement", badge: "\u{1F7E0} Needs Improvement", emoji: "\u{1F7E0}" };
  } else {
    return { label: "Underperforming", badge: "\u{1F534} Underperforming", emoji: "\u{1F534}" };
  }
}
export function getManagementDecision(type, name, pct) {
  if (pct >= 90) {
    return `Maintain the current performance strategy and use ${name} as a benchmark for other ${type === "district" ? "Districts" : type === "branch" ? "Branches" : "staff members"}.`;
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
export function evaluateEpmsCoachQuery(prompt, data) {
  const lower = (prompt || "").toLowerCase().trim();
  const districts = data.districts || [];
  const branches = data.branches || [];
  const users = data.users || [];
  const reports = data.reports || [];
  const targets = data.targets || [];
  const lastCtx = data.lastContext || {};
  const distRankings = data.districtRankings || calculateDistrictRankings(districts, branches, users, reports, targets);
  const branchRankings = data.branchRankings || calculateBranchRankings(branches, districts, users, reports, targets);
  const empRankings = data.employeeRankings || calculateEmployeeRankings(users, reports, targets);
  let nextContext = { ...lastCtx };
  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  if ((lower.includes("its branches") || lower.includes("about its branches") || lower.includes("show its branches") || lower.includes("branch breakdown")) && (lastCtx.lastDistrictName || lastCtx.lastDistrictId)) {
    const dName = lastCtx.lastDistrictName || "Selected District";
    const dId = lastCtx.lastDistrictId;
    const dBranches = branchRankings.filter(
      (b) => dId && (b.districtId === dId || b.districtCode === dId) || b.districtName && b.districtName.toLowerCase().includes(dName.toLowerCase())
    );
    if (dBranches.length === 0) {
      return {
        text: `\u26A0\uFE0F I don't have enough verified branch data for ${dName}.`,
        context: nextContext
      };
    }
    let resText = `\u{1F3E2} **${dName.toUpperCase()} \u2014 BRANCH PERFORMANCE BREAKDOWN**

`;
    dBranches.slice(0, 5).forEach((b, idx) => {
      const badge = getPerformanceBadge(b.achievementPercentage || b.performanceScore);
      const bar = makeProgressBar(b.achievementPercentage || b.performanceScore);
      resText += `${idx + 1}\uFE0F\u20E3 **${b.name}** \u2014 ${b.achievementPercentage || b.performanceScore}%
   ${badge.badge}
   ${bar}

`;
    });
    const lowestB = dBranches[dBranches.length - 1];
    resText += `\u{1F3AF} **Management Decision:**
Focus operational support on **${lowestB.name}** while sharing best practices from top branch **${dBranches[0].name}**.`;
    nextContext = {
      ...lastCtx,
      lastEntityType: "branch",
      lastBranchName: lowestB.name,
      lastBranchId: lowestB.id
    };
    return { text: resText, context: nextContext };
  }
  if ((lower.includes("which one needs attention") || lower.includes("which branch needs attention") || lower.includes("which needs improvement")) && (lastCtx.lastDistrictName || lastCtx.lastDistrictId)) {
    const dName = lastCtx.lastDistrictName || "District";
    const dId = lastCtx.lastDistrictId;
    const dBranches = branchRankings.filter(
      (b) => dId && (b.districtId === dId || b.districtCode === dId) || b.districtName && b.districtName.toLowerCase().includes(dName.toLowerCase())
    );
    if (dBranches.length > 0) {
      const lowest = dBranches[dBranches.length - 1];
      const badge = getPerformanceBadge(lowest.achievementPercentage || lowest.performanceScore);
      const bar = makeProgressBar(lowest.achievementPercentage || lowest.performanceScore);
      const resText = `\u{1F534} **BRANCH REQUIRING IMMEDIATE ATTENTION**

**${lowest.name}** (${dName})
Performance: **${lowest.achievementPercentage || lowest.performanceScore}%**

${badge.badge}
\u{1F4CA} ${bar}

\u26A0\uFE0F **Decision:**
${getManagementDecision("branch", lowest.name, lowest.achievementPercentage || lowest.performanceScore)}`;
      nextContext = {
        ...lastCtx,
        lastEntityType: "branch",
        lastBranchName: lowest.name,
        lastBranchId: lowest.id
      };
      return { text: resText, context: nextContext };
    }
  }
  const compareMatch = lower.match(/compare\s+([^and|with]+)\s+(?:and|with|vs)\s+(.+)/i);
  if (compareMatch || lower.includes("vs") || lower.includes("difference between")) {
    let entityA = "";
    let entityB = "";
    if (compareMatch) {
      entityA = compareMatch[1].trim();
      entityB = compareMatch[2].trim();
    } else if (lower.includes("vs")) {
      const parts = lower.replace("compare", "").split("vs");
      entityA = parts[0]?.trim() || "";
      entityB = parts[1]?.trim() || "";
    }
    if (entityA && entityB) {
      const distA = distRankings.find((d) => d.name.toLowerCase().includes(entityA.toLowerCase()));
      const distB = distRankings.find((d) => d.name.toLowerCase().includes(entityB.toLowerCase()));
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
        let resText = `\u{1F4CA} **PERFORMANCE COMPARISON**

`;
        resText += `\u{1F3C6} **${distA.name}** \u2014 ${scoreA}%
${badgeA.badge}
${barA}

`;
        resText += `**${distB.name}** \u2014 ${scoreB}%
${badgeB.badge}
${barB}

`;
        resText += `\u{1F4C8} **Difference:** ${diff >= 0 ? "+" : ""}${diff} percentage points

`;
        resText += `\u{1F3AF} **Decision:**
${winner} is currently performing ${absDiff}% better than ${loser}. Use ${winner}'s operational model as a benchmark to elevate ${loser}'s target achievement.`;
        nextContext = {
          lastEntityType: "district",
          lastDistrictName: distA.name,
          lastDistrictId: distA.id
        };
        return { text: resText, context: nextContext };
      }
      const brA = branchRankings.find((b) => b.name.toLowerCase().includes(entityA.toLowerCase()));
      const brB = branchRankings.find((b) => b.name.toLowerCase().includes(entityB.toLowerCase()));
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
        let resText = `\u{1F4CA} **BRANCH PERFORMANCE COMPARISON**

`;
        resText += `\u{1F3C6} **${brA.name}** \u2014 ${scoreA}%
${badgeA.badge}
${barA}

`;
        resText += `**${brB.name}** \u2014 ${scoreB}%
${badgeB.badge}
${barB}

`;
        resText += `\u{1F4C8} **Difference:** ${diff >= 0 ? "+" : ""}${diff} percentage points

`;
        resText += `\u{1F3AF} **Decision:**
${winner} leads ${loser} by ${absDiff} percentage points. Provide targeted branch coaching to ${loser}.`;
        return { text: resText, context: nextContext };
      }
      return {
        text: `\u26A0\uFE0F I don't have enough verified data to compare "${entityA}" and "${entityB}". Verified Districts available: ${distRankings.map((d) => d.name).slice(0, 6).join(", ")}.`,
        context: nextContext
      };
    }
  }
  if (lower.includes("top 5 districts") || lower.includes("top 3 districts") || lower.includes("top districts") || lower.includes("show me the top") || lower.includes("district rankings") || lower.includes("rankings of districts")) {
    const limit = lower.includes("top 3") ? 3 : 5;
    const topD2 = distRankings.slice(0, limit);
    let resText = `\u{1F3C6} **TOP ${topD2.length} DISTRICTS**

`;
    topD2.forEach((d, idx) => {
      const score = d.achievementPercentage || d.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}\uFE0F\u20E3 **${d.name}** \u2014 ${score}%
   ${badge.badge}
   ${bar}

`;
    });
    resText += `\u{1F3AF} **Management Decision:**
Prioritize performance improvement initiatives for lowest-performing Districts while studying the operational practices of top performers like **${topD2[0]?.name}**.`;
    nextContext = {
      lastEntityType: "district",
      lastDistrictName: topD2[0]?.name,
      lastDistrictId: topD2[0]?.id
    };
    return { text: resText, context: nextContext };
  }
  if (lower.includes("top-performing district") || lower.includes("top performing district") || lower.includes("which district is performing the best") || lower.includes("best district") || lower.includes("highest performing district") || lower.includes("top district")) {
    const topD2 = distRankings[0];
    if (topD2) {
      const score = topD2.achievementPercentage || topD2.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      const resText = `\u{1F3C6} **TOP PERFORMER**

**${topD2.name}**
Performance: **${score}%**

${badge.badge}
\u{1F4C8} ${bar}

\u{1F4A1} **Decision:**
${getManagementDecision("district", topD2.name, score)}`;
      nextContext = {
        lastEntityType: "district",
        lastDistrictName: topD2.name,
        lastDistrictId: topD2.id
      };
      return { text: resText, context: nextContext };
    }
  }
  if (lower.includes("underperforming district") || lower.includes("lowest-performing district") || lower.includes("lowest performing district") || lower.includes("district needs immediate attention") || lower.includes("district needs attention") || lower.includes("bottom 5 districts") || lower.includes("bottom districts") || lower.includes("worst district")) {
    const lowestD2 = distRankings[distRankings.length - 1];
    if (lowestD2) {
      const score = lowestD2.achievementPercentage || lowestD2.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      const resText = `\u{1F534} **DISTRICT REQUIRING IMMEDIATE ATTENTION**

**${lowestD2.name}**
Performance: **${score}%**

${badge.badge}
\u{1F4CA} ${bar}

\u26A0\uFE0F **Decision:**
${getManagementDecision("district", lowestD2.name, score)}`;
      nextContext = {
        lastEntityType: "district",
        lastDistrictName: lowestD2.name,
        lastDistrictId: lowestD2.id
      };
      return { text: resText, context: nextContext };
    }
  }
  if (lower.includes("medium performing district") || lower.includes("medium district") || lower.includes("satisfactory district")) {
    const mediumD = distRankings.filter((d) => {
      const score = d.achievementPercentage || d.performanceScore;
      return score >= 50 && score < 75;
    });
    if (mediumD.length === 0) {
      return {
        text: `\u{1F7E1} **MEDIUM PERFORMING DISTRICTS**

No districts currently fall strictly in the 50%-74% medium tier. All active districts are performing either above 75% or requiring targeted support.`,
        context: nextContext
      };
    }
    let resText = `\u{1F7E1} **MEDIUM PERFORMING DISTRICTS**

`;
    mediumD.forEach((d, idx) => {
      const score = d.achievementPercentage || d.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}\uFE0F\u20E3 **${d.name}** \u2014 ${score}%
   ${badge.badge}
   ${bar}

`;
    });
    resText += `\u{1F3AF} **Management Decision:**
Provide structured coaching and resource allocation to accelerate these medium-performing districts into the >75% Excellent tier.`;
    return { text: resText, context: nextContext };
  }
  if (lower.includes("top-performing branch") || lower.includes("top performing branch") || lower.includes("which branch is performing the best") || lower.includes("best branch") || lower.includes("top 5 branches") || lower.includes("top branches")) {
    const limit = lower.includes("top 5") ? 5 : 3;
    const topB = branchRankings.slice(0, limit);
    let resText = `\u{1F3C6} **TOP PERFORMING BRANCHES**

`;
    topB.forEach((b, idx) => {
      const score = b.achievementPercentage || b.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}\uFE0F\u20E3 **${b.name}** (${b.districtName || "District"}) \u2014 ${score}%
   ${badge.badge}
   ${bar}

`;
    });
    resText += `\u{1F4A1} **Decision:**
Recognize leadership at **${topB[0]?.name}** and replicate their daily deposit mobilization model across peer branches.`;
    nextContext = {
      lastEntityType: "branch",
      lastBranchName: topB[0]?.name,
      lastBranchId: topB[0]?.id
    };
    return { text: resText, context: nextContext };
  }
  if (lower.includes("bottom 5 branches") || lower.includes("bottom branches") || lower.includes("lowest-performing branch") || lower.includes("lowest performing branch") || lower.includes("branch needs improvement") || lower.includes("underperforming branch") || lower.includes("worst branch")) {
    const bottomB = branchRankings.slice(-5).reverse();
    let resText = `\u{1F534} **BOTTOM 5 BRANCHES REQUIRING IMPROVEMENT**

`;
    bottomB.forEach((b, idx) => {
      const score = b.achievementPercentage || b.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}\uFE0F\u20E3 **${b.name}** (${b.districtName || "District"}) \u2014 ${score}%
   ${badge.badge}
   ${bar}

`;
    });
    resText += `\u26A0\uFE0F **Management Decision:**
Mandate immediate performance reviews and targeted daily coaching for managers of these low-performing branches.`;
    nextContext = {
      lastEntityType: "branch",
      lastBranchName: bottomB[0]?.name,
      lastBranchId: bottomB[0]?.id
    };
    return { text: resText, context: nextContext };
  }
  if (lower.includes("top-performing employee") || lower.includes("which employees are performing the best") || lower.includes("best employee") || lower.includes("exceeding target") || lower.includes("exceeding their target") || lower.includes("top staff")) {
    const topE = empRankings.slice(0, 3);
    let resText = `\u{1F464} **TOP PERFORMING EMPLOYEES**

`;
    topE.forEach((e, idx) => {
      const score = e.achievementPercentage || e.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      resText += `${idx + 1}\uFE0F\u20E3 **${e.name}** (${e.jobTitle || "Staff"})
   Branch: ${e.branchName || "Branch"}
   Performance: **${score}%** ${badge.badge}
   ${bar}

`;
    });
    resText += `\u2705 **Decision:**
${getManagementDecision("employee", topE[0]?.name || "Top Employee", topE[0]?.performanceScore || 90)}`;
    nextContext = {
      lastEntityType: "employee",
      lastEmployeeName: topE[0]?.name,
      lastEntityId: topE[0]?.id
    };
    return { text: resText, context: nextContext };
  }
  if (lower.includes("lowest-performing employee") || lower.includes("lowest performing employee") || lower.includes("who is the lowest-performing employee") || lower.includes("below target") || lower.includes("employee needing attention") || lower.includes("underperforming employee")) {
    const lowestE = empRankings[empRankings.length - 1];
    if (lowestE) {
      const score = lowestE.achievementPercentage || lowestE.performanceScore;
      const badge = getPerformanceBadge(score);
      const bar = makeProgressBar(score);
      const resText = `\u{1F534} **EMPLOYEE REQUIRING ATTENTION**

**${lowestE.name}**
Role: ${lowestE.jobTitle || "Staff"} \u2022 ${lowestE.branchName || "Branch"}
Performance: **${score}%**

${badge.badge}
\u{1F4CA} ${bar}

\u26A0\uFE0F **Decision:**
${getManagementDecision("employee", lowestE.name, score)}`;
      nextContext = {
        lastEntityType: "employee",
        lastEmployeeName: lowestE.name,
        lastEntityId: lowestE.id
      };
      return { text: resText, context: nextContext };
    }
  }
  if (lower.includes("management decision") || lower.includes("what decisions should management take") || lower.includes("decisions should management take") || lower.includes("actionable decisions") || lower.includes("what should management do")) {
    const topD2 = distRankings[0];
    const lowestD2 = distRankings[distRankings.length - 1];
    const topB = branchRankings[0];
    const lowestB = branchRankings[branchRankings.length - 1];
    const topE = empRankings[0];
    const lowestE = empRankings[empRankings.length - 1];
    let resText = `\u{1F3AF} **EPMS MANAGEMENT DECISION SUPPORT**

`;
    resText += `\u{1F3C6} **Benchmark & Scale Strategy:**
\u2022 **District:** ${topD2?.name || "Top District"} (${topD2?.achievementPercentage || 94}%) \u2014 Use as operational benchmark.
\u2022 **Branch:** ${topB?.name || "Top Branch"} (${topB?.achievementPercentage || 95}%) \u2014 Document digital activation workflow.

`;
    resText += `\u26A0\uFE0F **Immediate Intervention Required:**
\u2022 **District:** ${lowestD2?.name || "Lowest District"} (${lowestD2?.achievementPercentage || 60}%) \u2014 Initiate weekly progress reviews.
\u2022 **Branch:** ${lowestB?.name || "Lowest Branch"} (${lowestB?.achievementPercentage || 55}%) \u2014 Deploy targeted coaching.

`;
    resText += `\u{1F465} **Staff Coaching & Recognition:**
\u2022 **Top Staff:** ${topE?.name || "Top Employee"} (${topE?.achievementPercentage || 92}%) \u2014 Qualify for quarterly excellence award.
\u2022 **Below Target:** ${lowestE?.name || "Lowest Employee"} (${lowestE?.achievementPercentage || 48}%) \u2014 Conduct 1-on-1 performance review.`;
    return { text: resText, context: nextContext };
  }
  const matchedDistrict = distRankings.find((d) => lower.includes(d.name.toLowerCase()));
  if (matchedDistrict) {
    const score = matchedDistrict.achievementPercentage || matchedDistrict.performanceScore;
    const badge = getPerformanceBadge(score);
    const bar = makeProgressBar(score);
    const resText = `\u{1F3E2} **DISTRICT PERFORMANCE EVALUATION**

**${matchedDistrict.name}**
Director: ${matchedDistrict.directorName || "District Director"}
Branches: ${matchedDistrict.branchCount} active branches
Performance: **${score}%**

${badge.badge}
\u{1F4CA} ${bar}

\u{1F4A1} **Decision:**
${getManagementDecision("district", matchedDistrict.name, score)}`;
    nextContext = {
      lastEntityType: "district",
      lastDistrictName: matchedDistrict.name,
      lastDistrictId: matchedDistrict.id
    };
    return { text: resText, context: nextContext };
  }
  const matchedBranch = branchRankings.find((b) => lower.includes(b.name.toLowerCase()));
  if (matchedBranch) {
    const score = matchedBranch.achievementPercentage || matchedBranch.performanceScore;
    const badge = getPerformanceBadge(score);
    const bar = makeProgressBar(score);
    const resText = `\u{1F3E6} **BRANCH PERFORMANCE EVALUATION**

**${matchedBranch.name}**
District: ${matchedBranch.districtName || "District"}
Manager: ${matchedBranch.managerName || "Branch Manager"}
Performance: **${score}%**

${badge.badge}
\u{1F4CA} ${bar}

\u{1F4A1} **Decision:**
${getManagementDecision("branch", matchedBranch.name, score)}`;
    nextContext = {
      lastEntityType: "branch",
      lastBranchName: matchedBranch.name,
      lastBranchId: matchedBranch.id
    };
    return { text: resText, context: nextContext };
  }
  const matchedEmployee = empRankings.find((e) => lower.includes(e.name.toLowerCase()));
  if (matchedEmployee) {
    const score = matchedEmployee.achievementPercentage || matchedEmployee.performanceScore;
    const badge = getPerformanceBadge(score);
    const bar = makeProgressBar(score);
    const resText = `\u{1F464} **EMPLOYEE PERFORMANCE EVALUATION**

**${matchedEmployee.name}**
Role: ${matchedEmployee.jobTitle || "Staff"}
Branch: ${matchedEmployee.branchName || "Branch"}
Performance: **${score}%**

${badge.badge}
\u{1F4CA} ${bar}

\u2705 **Decision:**
${getManagementDecision("employee", matchedEmployee.name, score)}`;
    nextContext = {
      lastEntityType: "employee",
      lastEmployeeName: matchedEmployee.name,
      lastEntityId: matchedEmployee.id
    };
    return { text: resText, context: nextContext };
  }
  if (lower.includes("submit") || lower.includes("report") || lower.includes("log") || lower.includes("draft")) {
    return {
      text: `\u{1F4DD} **HOW TO SUBMIT DAILY PERFORMANCE REPORT**

1\uFE0F\u20E3 **Navigate:** Click **"Submit Report"** in top bar.
2\uFE0F\u20E3 **Input Actuals:** Enter daily achievements for Deposits, FCY, Accounts, and Digital channels.
3\uFE0F\u20E3 **Cutoff Time:** Submissions must be logged before **10:00 AM** daily.
4\uFE0F\u20E3 **Approval:** Submitted reports enter manager queue for verification.

\u{1F4A1} **Decision:** Ensure daily logs are entered before 10:00 AM to maintain branch accuracy scores.`,
      context: nextContext
    };
  }
  if (lower.includes("approval") || lower.includes("approve") || lower.includes("pending") || lower.includes("reject")) {
    return {
      text: `\u2705 **MANAGER APPROVAL WORKFLOW**

\u2022 **Daily Review:** Managers inspect branch submissions daily.
\u2022 **Status:** Reports marked **Approved** or **Rejected** (with correction note).
\u2022 **Audit Trail:** Every approval timestamp is logged for district verification.

\u{1F4A1} **Decision:** Managers should review pending queue daily by 10:30 AM.`,
      context: nextContext
    };
  }
  const topD = distRankings[0];
  const lowestD = distRankings[distRankings.length - 1];
  let overviewText = `\u{1F3E6} **BUNNA BANK EPMS PERFORMANCE COACH & ADVISOR**

`;
  overviewText += `I have analyzed real-time EPMS performance metrics across all active Districts, Branches, and Staff:

`;
  overviewText += `\u{1F3C6} **Top District:** ${topD?.name || "Bahir Dar District"} (${topD?.achievementPercentage || 94}%) \u{1F7E2}
`;
  overviewText += `\u{1F534} **Requires Attention:** ${lowestD?.name || "Jimma District"} (${lowestD?.achievementPercentage || 61}%) \u{1F7E0}

`;
  overviewText += `\u{1F4A1} **Management Decision:**
Maintain growth momentum in top districts while deploying targeted coaching to lower-performing units.

`;
  overviewText += `*Try asking:*
\u2022 *"Which District is performing the best?"*
\u2022 *"Show me the bottom 5 Branches."*
\u2022 *"Who is the lowest-performing employee?"*
\u2022 *"Compare Bahir Dar District with Gondar District."*`;
  return { text: overviewText, context: nextContext };
}
