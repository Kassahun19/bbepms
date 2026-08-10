import fs from 'fs';

// Let us write out all raw rows from the prompt OCR text and verify count and SOL IDs
const pagesData = [
  // Page 1
  [
    { sNo: 1, solId: "101", nameEn: "MAIN", nameAm: "ዐብይ", phone: "011-158-08-84/25/26", manager: "Ato Zena Asefa", district: "Main", location: "ከወሎ ሰፈር አደባባይ ወደ ሩዋንዳ በሚወስደዉ ቡና ባንክ ህንፃ ላይ", region: "Addis Ababa" },
    { sNo: 2, solId: "102", nameEn: "HAYAHULET MAZORIA", nameAm: "ሃያ ሁለት ማዞሪያ", phone: "011-6-62-21-33", manager: "Ato Zebene Abera", district: "East A.A District", location: "ሃያሁለት ማዞሪያ ትራፊክ ጽ/ቤት አካባቢ ከቱሪስት ንግድ ስራ ድርጅት አጠገብ", region: "Addis Ababa" },
    { sNo: 3, solId: "103", nameEn: "MESALEMIA", nameAm: "መሳለሚያ", phone: "011-278-22-46", manager: "Adamu Admasu Wolde", district: "West A.A District", location: "መርካቶ አውቶቢስ ተራን እንዳለፉ የሸዋ ፀጋ ህንፃ ፊት ለፊት", region: "Addis Ababa" },
    { sNo: 4, solId: "104", nameEn: "BOLEMEDHANI ALEM", nameAm: "ቦሌ መድኃኔዓለም", phone: "011 662 2447", manager: "Ato Ashenafi Tadesse", district: "East A.A District", location: "ቦሌ መድኃኒያለም ከኤድናሞል ወረድ ብሎ ቢርጋርደን ፊት ለፊት", region: "Addis Ababa" },
    { sNo: 5, solId: "105", nameEn: "ADAMA", nameAm: "አዳማ", phone: "022-112-05-35", manager: "Nebiyou Samuel", district: "Adama Area Office", location: "ከፖስታ ቤት አደባባይ ወደ መብራት ኃይል በሚወስደው መንገድ ላይ፣ ህብረት ሥጋ ቤት", region: "Oromia" },
    { sNo: 6, solId: "106", nameEn: "GENET", nameAm: "ገነት", phone: "011-5 52-54-69", manager: "Misganaw", district: "South A.A District", location: "ከገነት ሆቴል ከፍ ብሎ ፅለረ ህንፃ", region: "Addis Ababa" },
    { sNo: 7, solId: "107", nameEn: "BAHIR DAR", nameAm: "ባህር ዳር", phone: "058-2-22-22-00", manager: "Mengistu Wolelaw", district: "Bahir Dar District", location: "ከጊዮርጊስ ቤ/ክ ወደ ፖፒረስ ሆቴል በሚወስደው መንገድ ላይ፣ ትራፊክ መብራት አካባቢ", region: "Amhara" },
    { sNo: 8, solId: "108", nameEn: "AYER TENA", nameAm: "አየር ጤና", phone: "011-3- 48 65 00", manager: "MELAKU TAMENE", district: "South A.A District", location: "ከአየር ጤና አደባባይ ሳሚ ካፌን አለፍ ብሎ", region: "Addis Ababa" },
    { sNo: 9, solId: "109", nameEn: "HABTE GIORGIS", nameAm: "ሀብተጊዮርጊስ", phone: "011-1-55-82-24", manager: "Ato Semere Tirfu", district: "West A.A District", location: "ጊዮርጊስ አትክልት ተራ ከሊፋ ህንፃ ሥር", region: "Addis Ababa" },
    { sNo: 10, solId: "110", nameEn: "ASIRA SIMINT MAZORIA", nameAm: "አስራስምንት ማዞሪያ", phone: "011-2-80-07-97", manager: "Addisu Abissa Degoma", district: "West A.A District", location: "18 ማዞሪያ አደባባይ ኖክ fhንፃ ላይ", region: "Addis Ababa" },
    { sNo: 11, solId: "111", nameEn: "BEKLO BET", nameAm: "በቅሎ ቤት", phone: "011-4-16-32-30", manager: "Ashenafi Lakew", district: "South A.A District", location: "ከገቢዎች ባለሥልጣን ፊት ለፊት", region: "Addis Ababa" },
    { sNo: 12, solId: "112", nameEn: "MEKELE", nameAm: "መቀሌ", phone: "034-4-40-00-94", manager: "Ato Aklilu G/Medhin", district: "Mekele District", location: "ቐዳማይ ወያነ የገበያ ማእከል አካባቢ", region: "Tigray" },
    { sNo: 13, solId: "113", nameEn: "MERKATO", nameAm: "መርካቶ", phone: "011-2-78-14-35", manager: "Ephrem Meka Sumega", district: "West A.A District", location: "ጣና የገበያ አዳራሽ አጠገብ፣ ድር ተራ ህንፃ 1ኛ ፎቅ", region: "Addis Ababa" },
    { sNo: 14, solId: "114", nameEn: "GONDER", nameAm: "ጐንደር", phone: "058-1-11-24-43", manager: "Ato Eyasu", district: "Bahir Dar District", location: "አራዳ ቦምብ ተራ አካባቢ", region: "Amhara" },
    { sNo: 15, solId: "115", nameEn: "HOSSANA", nameAm: "ሆሳእና", phone: "046 – 5- 55-21-61", manager: "Binyam Amado", district: "Hawassa Area Office", location: "ከአደባባይ ወደ መናሃሪያ በሚወስደው መንገድ ቤተክህነት ፊት ለፊት", region: "Central Ethiopia" },
    { sNo: 16, solId: "116", nameEn: "BICHENA", nameAm: "ብቸና", phone: "058-6-651053", manager: "Ato Temesgen", district: "Debre Markos Area Office", location: "በላይ ዘለቀ ሃውልት ፊት ለፊት", region: "Amhara" },
    { sNo: 17, solId: "117", nameEn: "KOBO", nameAm: "ቆቦ", phone: "033-3-34-12-74", manager: "Ato yohannes Molla", district: "Dessie District", location: "ፖሊስ ጣቢያ (ግንብ ቀበሌ አካባቢ) ዓለም ህንፃ ላይ", region: "Amhara" },
    { sNo: 18, solId: "118", nameEn: "JIMMA", nameAm: "ጅማ", phone: "047-1-12 20 85", manager: "Desta W/senbet", district: "Jimma Area Office", location: "መርካቶ ጂጂ ህንፃ ላይ", region: "Oromia" },
    { sNo: 19, solId: "119", nameEn: "HAWASSA", nameAm: "ሀዋሳ", phone: "0462-20-55-85", manager: "Alem Muluneh", district: "Hawassa Area Office", location: "ፒያሳ አካባቢ ፒና ሆቴል ፊት ለፊት ታይም ካፌ አጠገብ", region: "Sidama" },
    { sNo: 20, solId: "120", nameEn: "KOTEBE", nameAm: "ኮተቤ", phone: "011-6-67-80-36", manager: "Ato Yetemgeta Aregahgn", district: "East A.A District", location: "ኮተቤ መምህራን ማሰልጠኛ ኮሌጅ ፊት ለፊት", region: "Addis Ababa" },
    { sNo: 21, solId: "121", nameEn: "SHASHEMENE", nameAm: "ሻሸመኔ", phone: "046-1-10-02-45", manager: "Gemeda Negulie", district: "Hawassa Area Office", location: "አቦስቶ አካባቢ ፀጋዬ ህንፃ", region: "Oromia" }
  ]
];

console.log("Parsed sample page 1 rows:", pagesData[0].length);
