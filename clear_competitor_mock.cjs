const fs = require('fs');

let compTs = fs.readFileSync('./src/data/competitorMockData.ts', 'utf-8');
compTs = compTs.replace(/export const initialCommercialBanks: CommercialBank\[\] = \[[\s\S]*?\];/g, 'export const initialCommercialBanks: CommercialBank[] = [];');
compTs = compTs.replace(/export const initialCompetitorBranches: CompetitorBranch\[\] = \[[\s\S]*?\];/g, 'export const initialCompetitorBranches: CompetitorBranch[] = [];');
compTs = compTs.replace(/export const initialCompetitorKpis: CompetitorKpi\[\] = \[[\s\S]*?\];/g, 'export const initialCompetitorKpis: CompetitorKpi[] = [];');
compTs = compTs.replace(/export const initialCompetitorPerformance: CompetitorPerformance\[\] = \[[\s\S]*?\];/g, 'export const initialCompetitorPerformance: CompetitorPerformance[] = [];');
compTs = compTs.replace(/export const initialAreaRankings: AreaRanking\[\] = \[[\s\S]*?\];/g, 'export const initialAreaRankings: AreaRanking[] = [];');
fs.writeFileSync('./src/data/competitorMockData.ts', compTs);

let epms = require('./epms_persistent_data.json');
epms.competitorBranches = [];
epms.commercialBanks = [];
epms.competitorKpis = [];
epms.competitorPerformance = [];
epms.areaRankings = [];
fs.writeFileSync('./epms_persistent_data.json', JSON.stringify(epms, null, 2));
console.log('Competitor mock cleared.');
