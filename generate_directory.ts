import fs from 'fs';

// District mapping function
function getDistrictInfo(districtStr: string, regionStr: string) {
  const d = (districtStr || '').toLowerCase();
  if (d.includes('mekele') || d.includes('mekelle')) return { id: 'DIST-MKL', name: 'Mekele District', region: 'Tigray' };
  if (d.includes('east a.a') || d.includes('east addis')) return { id: 'DIST-EAD', name: 'East A.A District', region: 'Addis Ababa' };
  if (d.includes('west a.a') || d.includes('west addis')) return { id: 'DIST-WAD', name: 'West A.A District', region: 'Addis Ababa' };
  if (d.includes('south a.a') || d.includes('south addis')) return { id: 'DIST-SAD', name: 'South A.A District', region: 'Addis Ababa' };
  if (d.includes('bahir dar') || d.includes('bahirdar')) return { id: 'DIST-BDR', name: 'Bahir Dar District', region: 'Amhara' };
  if (d.includes('dessie')) return { id: 'DIST-DES', name: 'Dessie District', region: 'Amhara' };
  if (d.includes('hawassa')) return { id: 'DIST-HWA', name: 'Hawassa Area Office', region: regionStr || 'Central Ethiopia' };
  if (d.includes('adama')) return { id: 'DIST-ADM', name: 'Adama Area Office', region: regionStr || 'Oromia' };
  if (d.includes('jimma')) return { id: 'DIST-JMA', name: 'Jimma Area Office', region: regionStr || 'Oromia' };
  if (d.includes('debre markos') || d.includes('debremarkos')) return { id: 'DIST-DMA', name: 'Debre Markos Area Office', region: 'Amhara' };
  if (d.includes('debre birhan') || d.includes('debrebirhan')) return { id: 'DIST-DBA', name: 'Debre Birhan Area Office', region: 'Amhara' };
  return { id: 'DIST-EAD', name: districtStr || 'East A.A District', region: regionStr || 'Addis Ababa' };
}

console.log("Directory script helper ready.");
