import fs from 'fs';

// Accurate mapping from the PDF Directory document
const officialPdfDirectory: Record<string, {
  solId: string;
  name: string;
  districtId: string;
  districtName: string;
  phone: string;
  managerName: string;
  location: string;
  region: string;
}> = {
  "101": { solId: "101", name: "MAIN (ዐብይ)", districtId: "DIST-EAD", districtName: "East A.A District", phone: "011-158-08-84/25/26", managerName: "Ato Zena Asefa", location: "ከወሎ ሰፈር አደባባይ ወደ ሩዋንዳ በሚወስደዉ ቡና ባንክ ህንፃ ላይ", region: "Addis Ababa" },
  "102": { solId: "102", name: "HAYAHULET MAZORIA (ሃያ ሁለት ማዞሪያ)", districtId: "DIST-EAD", districtName: "East A.A District", phone: "011-6-62-21-33", managerName: "Ato Zebene Abera", location: "ሃያሁለት ማዞሪያ ትራፊክ ጽ/ቤት አካባቢ ከቱሪስት ንግድ ስራ ድርጅት አጠገብ", region: "Addis Ababa" },
  "103": { solId: "103", name: "MESALEMIA (መሳለሚያ)", districtId: "DIST-WAD", districtName: "West A.A District", phone: "011-278-22-46", managerName: "Adamu Admasu", location: "መርካቶ አውቶቢስ ተራን እንዳለፉ የሸዋ ፀጋ ህንፃ ፊት ለፊት", region: "Addis Ababa" },
  "104": { solId: "104", name: "BOLEMEDHANI ALEM (ቦሌ መድኃኔዓለም)", districtId: "DIST-EAD", districtName: "East A.A District", phone: "011-662-2447", managerName: "Ato Ashenafi Tadesse", location: "ቦሌ መድኃኒያለም ከኤድናሞል ወረድ ብሎ ቢርጋርደን ፊት ለፊት", region: "Addis Ababa" },
  "105": { solId: "105", name: "ADAMA (አዳማ)", districtId: "DIST-ADM", districtName: "Adama Area Office", phone: "022-112-05-35", managerName: "Nebiyou Samuel", location: "ከፖስታ ቤት አደባባይ ወደ መብራት ኃይል በሚወስደው መንገድ ላይ፣ ህብረት ሥጋ ቤት", region: "Oromia" },
  "106": { solId: "106", name: "GENET (ገነት)", districtId: "DIST-SAD", districtName: "South A.A District", phone: "011-5-52-54-69", managerName: "Misganaw", location: "ከገነት ሆቴል ከፍ ብሎ ፅለረ ህንፃ", region: "Addis Ababa" },
  "107": { solId: "107", name: "BAHIR DAR (ባህር ዳር)", districtId: "DIST-BDR", districtName: "Bahir Dar District", phone: "058-2-22-22-00", managerName: "Mengistu Wolelaw", location: "ከጊዮርጊስ ቤ/ክ ወደ ፖፒረስ ሆቴል በሚወስደው መንገድ ላይ፣ ትራፊክ መብራት አካባቢ", region: "Amhara" },
  "108": { solId: "108", name: "AYER TENA (አየር ጤና)", districtId: "DIST-SAD", districtName: "South A.A District", phone: "011-3-48-65-00", managerName: "MELAKU TAMENE", location: "ከአየር ጤና አደባባይ ሳሚ ካፌን አለፍ ብሎ", region: "Addis Ababa" },
  "109": { solId: "109", name: "HABTE GIORGIS (ሀብተጊዮርጊስ)", districtId: "DIST-WAD", districtName: "West A.A District", phone: "011-1-55-82-24", managerName: "Ato Semere Tirfu", location: "ጊዮርጊስ አትክልት ተራ ከሊፋ ህንፃ ሥር", region: "Addis Ababa" },
  "110": { solId: "110", name: "ASIRA SIMINT MAZORIA (አስራስምንት ማዞሪያ)", districtId: "DIST-WAD", districtName: "West A.A District", phone: "011-2-80-07-97", managerName: "Addisu Abissa Degoma", location: "18 ማዞሪያ አደባባይ ኖክ fhንፃ ላይ", region: "Addis Ababa" },
  "111": { solId: "111", name: "BEKLO BET (በቅሎ ቤት)", districtId: "DIST-SAD", districtName: "South A.A District", phone: "011-4-16-32-30", managerName: "Ashenafi Lakew", location: "ከገቢዎች ባለሥልጣን ፊት ለፊት", region: "Addis Ababa" },
  "112": { solId: "112", name: "MEKELE (መቀሌ)", districtId: "DIST-MKL", districtName: "Mekele District", phone: "034-4-40-00-94", managerName: "Ato Aklilu G/Medhin", location: "ቐዳማይ ወያነ የገበያ ማእከል አካባቢ", region: "Tigray" },
  "113": { solId: "113", name: "MERKATO (መርካቶ)", districtId: "DIST-WAD", districtName: "West A.A District", phone: "011-2-78-14-35", managerName: "Ephrem Meka Sumega", location: "ጣና የገበያ አዳራሽ አጠገብ፣ ድር ተራ ህንፃ 1ኛ ፎቅ", region: "Addis Ababa" },
  "114": { solId: "114", name: "GONDER (ጐንደር)", districtId: "DIST-BDR", districtName: "Bahir Dar District", phone: "058-1-11-24-43", managerName: "Ato Eyasu", location: "አራዳ ቦምብ ተራ አካባቢ", region: "Amhara" },
  "115": { solId: "115", name: "HOSSANA (ሆሳእና)", districtId: "DIST-HWA", districtName: "Hawassa Area Office", phone: "046-5-55-21-61", managerName: "Binyam Amado", location: "ከአደባባይ ወደ መናሃሪያ በሚወስደው መንገድ ቤተክህነት ፊት ለፊት", region: "Central Ethiopia" },
  "116": { solId: "116", name: "BICHENA (ብቸና)", districtId: "DIST-DMA", districtName: "Debre Markos Area Office", phone: "058-6-651053", managerName: "Ato Temesgen", location: "በላይ ዘለቀ ሃውልት ፊት ለፊት", region: "Amhara" },
  "117": { solId: "117", name: "KOBO (ቆቦ)", districtId: "DIST-DES", districtName: "Dessie District", phone: "033-3-34-12-74", managerName: "Ato yohannes Molla", location: "ፖሊስ ጣቢያ (ግንብ ቀበሌ አካባቢ) ዓለም ህንፃ ላይ", region: "Amhara" },
  "118": { solId: "118", name: "JIMMA (ጅማ)", districtId: "DIST-JMA", districtName: "Jimma Area Office", phone: "047-1-12-20-85", managerName: "Desta W/senbet", location: "መርካቶ ጂጂ ህንፃ ላይ", region: "Oromia" },
  "119": { solId: "119", name: "HAWASSA (ሀዋሳ)", districtId: "DIST-HWA", districtName: "Hawassa Area Office", phone: "0462-20-55-85", managerName: "Alem Muluneh", location: "ፒያሳ አካባቢ ፒና ሆቴል ፊት ለፊት ታይም ካፌ አጠገብ", region: "Sidama" },
  "120": { solId: "120", name: "KOTEBE (ኮተቤ)", districtId: "DIST-EAD", districtName: "East A.A District", phone: "011-6-67-80-36", managerName: "Ato Yetemgeta Aregahgn", location: "ኮተቤ መምህራን ማሰልጠኛ ኮሌጅ ፊት ለፊት", region: "Addis Ababa" },
  "121": { solId: "121", name: "SHASHEMENE (ሻሸመኔ)", districtId: "DIST-HWA", districtName: "Hawassa Area Office", phone: "046-1-10-02-45", managerName: "Gemeda Negulie", location: "አቦስቶ አካባቢ ፀጋዬ ህንፃ", region: "Oromia" },
  "163": { solId: "163", name: "JIGJIGA (ጂግጂጋ)", districtId: "DIST-ADM", districtName: "Adama Area Office", phone: "025-278-00-00", managerName: "Elias Lakew", location: "ሰኢድ አብደላ የስብሰባ አደራሽ አጠገብ፤", region: "Somale" },
  "311": { solId: "311", name: "SHIMBIT (ሽምብጥ)", districtId: "DIST-BDR", districtName: "Bahir Dar District", phone: "058-320-16-23", managerName: "Gebrie Belay", location: "ሆም ላንድ ሆቴል ፊት ለፊት", region: "Amhara" }
};

// Update epms_persistent_data.json
if (fs.existsSync("./epms_persistent_data.json")) {
  const fileData = JSON.parse(fs.readFileSync("./epms_persistent_data.json", "utf-8"));
  if (Array.isArray(fileData.branches)) {
    // 1. Remove any duplicate or wrongly named branch for 311 or 163
    const updatedBranches = fileData.branches.map((b: any) => {
      const sol = b.solId || b.code;
      if (sol && officialPdfDirectory[sol]) {
        const item = officialPdfDirectory[sol];
        return {
          ...b,
          solId: item.solId,
          code: item.solId,
          name: item.name,
          districtId: item.districtId,
          districtName: item.districtName,
          phone: item.phone,
          managerName: item.managerName,
          location: item.location,
          region: item.region
        };
      }
      return b;
    });

    fileData.branches = updatedBranches;
    fs.writeFileSync("./epms_persistent_data.json", JSON.stringify(fileData, null, 2), "utf-8");
    console.log("Updated epms_persistent_data.json successfully.");
  }
}

// Check search test for SOL 311 and SOL 163
const data = JSON.parse(fs.readFileSync("./epms_persistent_data.json", "utf-8"));
console.log("SOL 311 in persistent data:", data.branches.filter((b: any) => b.solId === "311" || b.code === "311").map((x: any) => ({ solId: x.solId, name: x.name, district: x.districtName })));
console.log("SOL 163 in persistent data:", data.branches.filter((b: any) => b.solId === "163" || b.code === "163").map((x: any) => ({ solId: x.solId, name: x.name, district: x.districtName })));
