import React, { useState } from 'react';
import { MapPin, Navigation, Building2, TrendingUp, Award, Layers, Search, Crosshair, ChevronRight } from 'lucide-react';
import { AreaRanking, CompetitorBranch, CommercialBank } from '../../types/competitor';

interface EthiopiaCompetitorMapProps {
  rankings: AreaRanking[];
  branches: CompetitorBranch[];
  banks: CommercialBank[];
  onSelectArea?: (areaName: string) => void;
}

export const EthiopiaCompetitorMap: React.FC<EthiopiaCompetitorMapProps> = ({
  rankings,
  branches,
  banks,
  onSelectArea
}) => {
  const [selectedAreaName, setSelectedAreaName] = useState<string>('Bahir Dar');
  const [selectedFilterBank, setSelectedFilterBank] = useState<string>('ALL');

  const areas = [
    { name: 'Bahir Dar', region: 'Amhara', x: 260, y: 150, bunnaRank: 4, bunnaBpi: 71.8, totalBranches: 12 },
    { name: 'East Addis Ababa (Bole)', region: 'Addis Ababa', x: 320, y: 260, bunnaRank: 2, bunnaBpi: 88.5, totalBranches: 28 },
    { name: 'Hawassa', region: 'Sidama', x: 330, y: 350, bunnaRank: 3, bunnaBpi: 76.4, totalBranches: 16 },
    { name: 'Adama', region: 'Oromia', x: 360, y: 275, bunnaRank: 2, bunnaBpi: 81.2, totalBranches: 18 },
    { name: 'Mekelle', region: 'Tigray', x: 310, y: 80, bunnaRank: 3, bunnaBpi: 74.0, totalBranches: 14 },
    { name: 'Dire Dawa', region: 'Dire Dawa', x: 450, y: 230, bunnaRank: 3, bunnaBpi: 75.8, totalBranches: 11 },
    { name: 'Jimma', region: 'Oromia', x: 220, y: 310, bunnaRank: 4, bunnaBpi: 69.5, totalBranches: 10 }
  ];

  const currentAreaRanking = rankings.find(r => r.areaName.toLowerCase().includes(selectedAreaName.toLowerCase())) || rankings[0];

  const filteredBranches = branches.filter(b => {
    const matchCity = b.city.toLowerCase().includes(selectedAreaName.toLowerCase()) || selectedAreaName.toLowerCase().includes(b.city.toLowerCase());
    const matchBank = selectedFilterBank === 'ALL' || b.bankId === selectedFilterBank || b.bankCode === selectedFilterBank;
    return matchCity && matchBank;
  });

  return (
    <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[#C89A2B]">
            <Navigation className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">GIS Spatial Intelligence</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">Interactive Ethiopia Banking Competitor Map</h3>
          <p className="text-xs text-gray-300">Geographic footprint, branch Sol IDs, and real-time BPI score rankings across commercial hubs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-300 font-medium">Filter Bank:</label>
          <select
            value={selectedFilterBank}
            onChange={(e) => setSelectedFilterBank(e.target.value)}
            className="bg-[#6B3F1D] border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#C89A2B] outline-none"
          >
            <option value="ALL">All Banks operating</option>
            {banks.map(b => (
              <option key={b.id} value={b.id}>{b.shortName} ({b.code})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SVG MAP CONTAINER */}
        <div className="lg:col-span-7 bg-[#2E1B0E] border border-white/10 rounded-2xl p-4 relative min-h-[420px] flex flex-col justify-between overflow-hidden">
          
          <div className="absolute top-3 left-3 bg-[#6B3F1D]/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-[11px] text-gray-300 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C89A2B] animate-ping" />
            <span className="font-semibold text-white">Live Hub Pin Selected: {selectedAreaName}</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center space-x-2 text-[10px] text-gray-400">
            <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-[#C89A2B] inline-block"/><span>Bunna</span></span>
            <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"/><span>CBE</span></span>
            <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/><span>Dashen</span></span>
            <span className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/><span>Awash</span></span>
          </div>

          {/* SVG Map Graphic representing Ethiopia Regions */}
          <svg viewBox="0 0 600 450" className="w-full h-[380px] drop-shadow-lg">
            {/* Outline path simulating Horn of Africa / Ethiopia outline */}
            <path
              d="M 180 60 L 320 30 L 480 140 L 520 220 L 460 320 L 380 410 L 260 410 L 160 350 L 120 260 L 140 160 Z"
              fill="#4A2C17"
              stroke="rgba(200, 154, 43, 0.3)"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Regional Dividers */}
            <path d="M 260 40 L 300 180 L 360 260" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
            <path d="M 140 160 L 280 200 L 450 230" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
            <path d="M 160 350 L 330 350 L 460 320" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />

            {/* Area Hotspot Pins */}
            {areas.map((area) => {
              const isSelected = selectedAreaName.toLowerCase() === area.name.toLowerCase() || area.name.toLowerCase().includes(selectedAreaName.toLowerCase());

              return (
                <g
                  key={area.name}
                  onClick={() => {
                    setSelectedAreaName(area.name);
                    if (onSelectArea) onSelectArea(area.name);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Outer pulse circle for selected */}
                  {isSelected && (
                    <circle cx={area.x} cy={area.y} r="18" fill="none" stroke="#C89A2B" strokeWidth="2" opacity="0.6" className="animate-ping" />
                  )}

                  {/* Marker Circle */}
                  <circle
                    cx={area.x}
                    cy={area.y}
                    r={isSelected ? 10 : 7}
                    fill={isSelected ? '#C89A2B' : '#6B3F1D'}
                    stroke={isSelected ? '#FFFFFF' : '#C89A2B'}
                    strokeWidth="2.5"
                    className="transition-all duration-300 group-hover:scale-125"
                  />

                  {/* Inner Pin Dot */}
                  <circle cx={area.x} cy={area.y} r="3" fill={isSelected ? '#4A2C17' : '#C89A2B'} />

                  {/* Text Label */}
                  <text
                    x={area.x}
                    y={area.y - 14}
                    textAnchor="middle"
                    fill={isSelected ? '#C89A2B' : '#FFFFFF'}
                    fontSize={isSelected ? "12" : "10"}
                    fontWeight={isSelected ? "bold" : "medium"}
                    className="select-none transition-all"
                  >
                    {area.name} (Rank #{area.bunnaRank})
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="text-[11px] text-gray-400 flex items-center justify-between border-t border-white/10 pt-2 px-2">
            <span>Click any hub pin on the map to inspect local competitor branch details.</span>
            <span className="text-[#C89A2B] font-semibold">Coordinates: 9.0100° N, 38.7600° E</span>
          </div>
        </div>

        {/* AREA DETAIL PANEL */}
        <div className="lg:col-span-5 bg-[#2E1B0E] border border-white/10 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#C89A2B]">Selected Commercial Hub</span>
              <h4 className="text-xl font-bold text-white">{selectedAreaName} Area</h4>
            </div>
            <div className="bg-[#6B3F1D] border border-[#C89A2B]/30 rounded-xl px-3 py-1.5 text-center">
              <span className="text-[10px] text-gray-300 block uppercase">Bunna Rank</span>
              <span className="text-lg font-extrabold text-[#C89A2B]">#{currentAreaRanking?.bunnaRank || 4}</span>
            </div>
          </div>

          {/* Area Summary Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#6B3F1D]/50 p-3 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px]">Bunna BPI Score</span>
              <span className="text-base font-bold text-emerald-400">{currentAreaRanking?.bunnaBpiScore || 71.8} / 100</span>
            </div>
            <div className="bg-[#6B3F1D]/50 p-3 rounded-xl border border-white/5">
              <span className="text-gray-400 block text-[10px]">Competitor Banks</span>
              <span className="text-base font-bold text-white">{currentAreaRanking?.totalBanks || 5} Active</span>
            </div>
          </div>

          {/* Local Competitor Branches List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
              <span>Tracked Branches in {selectedAreaName} ({filteredBranches.length})</span>
              <span className="text-[10px] text-[#C89A2B]">Sorted by BPI Rank</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredBranches.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No branch records match filter criteria for this hub.
                </div>
              ) : (
                filteredBranches.map((br) => {
                  const isBunna = br.bankCode === 'BUNNA';
                  return (
                    <div
                      key={br.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isBunna
                          ? 'bg-[#6B3F1D] border-[#C89A2B]/50 text-white'
                          : 'bg-[#4A2C17]/50 border-white/10 hover:border-white/20 text-gray-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: isBunna ? '#C89A2B' : '#888888' }}
                          />
                          <span className="text-xs font-bold text-white">{br.branchName}</span>
                          {isBunna && (
                            <span className="bg-[#C89A2B] text-[#6B3F1D] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                              BUNNA
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-300 flex items-center space-x-2">
                          <span>Bank: <strong>{br.bankName}</strong></span>
                          <span>•</span>
                          <span>Sol ID: <strong>{br.solId || 'N/A'}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#C89A2B] block">
                          {isBunna ? 'Rank #4' : 'Competitor'}
                        </span>
                        <span className="text-[10px] text-gray-400">Kebele: {br.woreda || ' Kebele 04'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
