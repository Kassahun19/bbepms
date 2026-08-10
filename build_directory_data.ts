import fs from 'fs';

interface RawRow {
  sNo: number;
  solId: string;
  nameEn: string;
  nameAm: string;
  phone: string;
  manager: string;
  district: string;
  location: string;
  region: string;
}

const rawRows: RawRow[] = [
  // Page 1: 1..21
  { sNo: 1, solId: "101", nameEn: "MAIN", nameAm: "ዐብይ", phone: "011-158-08-84/25/26", manager: "Ato Zena Asefa", district: "Main", location: "ከወሎ ሰፈር አደባባይ ወደ ሩዋንዳ በሚወስደዉ ቡና ባንክ ህንፃ ላይ", region: "Addis Ababa" },
  { sNo: 2, solId: "102", nameEn: "HAYAHULET MAZORIA", nameAm: "ሃያ ሁለት ማዞሪያ", phone: "011-6-62-21-33", manager: "Ato Zebene Abera", district: "East A.A District", location: "ሃያሁለት ማዞሪያ ትራፊክ ጽ/ቤት አካባቢ ከቱሪስት ንግድ ስራ ድርጅት አጠገብ", region: "Addis Ababa" },
  { sNo: 3, solId: "103", nameEn: "MESALEMIA", nameAm: "መሳለሚያ", phone: "011-278-22-46", manager: "Adamu Admasu", district: "West A.A District", location: "መርካቶ አውቶቢስ ተራን እንዳለፉ የሸዋ ፀጋ ህንፃ ፊት ለፊት", region: "Addis Ababa" },
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
  { sNo: 21, solId: "121", nameEn: "SHASHEMENE", nameAm: "ሻሸመኔ", phone: "046-1-10-02-45", manager: "Gemeda Negulie", district: "Hawassa Area Office", location: "አቦስቶ አካባቢ ፀጋዬ ህንፃ", region: "Oromia" },

  // Page 2: 22..44
  { sNo: 22, solId: "122", nameEn: "OLYMPIA", nameAm: "ኦሎምፒያ", phone: "011-5-57-22-21", manager: "Ato Million Kiflie", district: "East A.A District", location: "ኦሎምፒያ ሸዋ ዳቦ ፊት ለፊት ኦሜዳድ አጠገብ", region: "Addis Ababa" },
  { sNo: 23, solId: "123", nameEn: "GAMBELLA", nameAm: "ጋምቤላ", phone: "047-5-51-00-79", manager: "Dawit Haile Tamerasha", district: "Jimma Area Office", location: "ግራንድ ሪዞርት እና ስፓ አጠገብ አደባባዩ ጋር", region: "Gambela" },
  { sNo: 24, solId: "124", nameEn: "DESSIE", nameAm: "ደሴ", phone: "033-1-12-00-50", manager: "Girma Workneh", district: "Dessie District", location: "ፒያሳ፣ አላሙዲን ህንፃ 1ኛ ፎቅ ላይ", region: "Amhara" },
  { sNo: 25, solId: "125", nameEn: "DEBRE BIRIHAN", nameAm: "ደብረ ብርሃን", phone: "011-6-81-13-64", manager: "Gibreyesus Kassaye", district: "Debre Birhan Area Office", location: "ኢትዮ በርኖስ ሆቴል ህንፃ ላይ", region: "Amhara" },
  { sNo: 26, solId: "126", nameEn: "GERJI", nameAm: "ገርጂ", phone: "011-6-39-40-11", manager: "Ato Adinew Hageru", district: "East A.A District", location: "ገርጂ ሮባ ዳቦ ቤት አጠገብ", region: "Addis Ababa" },
  { sNo: 27, solId: "127", nameEn: "BALE GOBA", nameAm: "ባሌ ጎባ", phone: "022-6-61-25-28", manager: "Chernet Ayalkibet Argaw", district: "Hawassa Area Office", location: "የዱሮ ፖስታ ቤት የነበረበት ህንፃ ላይ፣ ከንግድ ባንክ ዋናው ቅርንጫፍ ጐን", region: "Oromia" },
  { sNo: 28, solId: "128", nameEn: "HALABA", nameAm: "አላባ", phone: "046-5-56-06-43", manager: "Simegne G/Mikael", district: "Hawassa Area Office", location: "አስፈራው ህንፃ ላይ ያአብ ሥራ ሆቴል አካባቢ", region: "Central Ethiopia" },
  { sNo: 29, solId: "129", nameEn: "BALE ROBE", nameAm: "ባሌ ሮቤ", phone: "022-6-65-28-00", manager: "Welensa Yakob", district: "Hawassa Area Office", location: "ከመደወላቡ ዩኒቨርሲቲ ወደ አደባባይ በሚወስደው መንገድ ላይ፣ ደበበ ሆቴል ፊት ለፊት", region: "Oromia" },
  { sNo: 30, solId: "130", nameEn: "GOJAM BERENDDA", nameAm: "ጐጃም በረንዳ", phone: "0111-26-27-24", manager: "Ato Henok Mengistu", district: "West A.A District", location: "ከዮሐንስ ወደ ጐጃም በረንዳ በሚወስደው መንገድ ጐጐታ ሆቴል አጠገብ", region: "Addis Ababa" },
  { sNo: 31, solId: "131", nameEn: "KOBO ROBIT", nameAm: "ቆቦ ሮቢት", phone: "033-1-13-01-68", manager: "Abera Gugsa", district: "Dessie District", location: "ከማዘጋጃ ቤት ፊት ለፊት", region: "Amhara" },
  { sNo: 32, solId: "132", nameEn: "SHASHEMENE ARADA", nameAm: "ሻሸመኔ አራዳ", phone: "046-2-11-00-52", manager: "Ketema Abera", district: "Hawassa Area Office", location: "አፖስቶ አካባቢ፣ ፍሬም ህንፃ ላይ", region: "Oromia" },
  { sNo: 33, solId: "133", nameEn: "YIRGALEM", nameAm: "ይርጋለም", phone: "046-2-25-12-95", manager: "Mulatu Shiguta", district: "Hawassa Area Office", location: "መናኃሪያ መግቢያው ላይ፣ አንባሳ ሆቴል አጠገብ", region: "Sidama" },
  { sNo: 34, solId: "134", nameEn: "BELAY ZELEKE", nameAm: "በላይ ዘለቀ", phone: "058-2-20-53-43", manager: "Ato Wondifraw Melaku", district: "Bahir Dar District", location: "ከፖፒረስ ሆቴል ፊት ለፊት", region: "Amhara" },
  { sNo: 35, solId: "135", nameEn: "BOLE RWANDA", nameAm: "ቦሌ ሩዋንዳ", phone: "011-6-39-23-52", manager: "Tegene Kesisa", district: "South A.A District", location: "ቦሌ ሚካኤል Dasabshill ህንፃ ትንሽ ወረድ ብሎ", region: "Addis Ababa" },
  { sNo: 36, solId: "136", nameEn: "DEBRE MARKOS", nameAm: "ደብረ ማርቆስ", phone: "058-7-71-16-45", manager: "Abew", district: "Debre Markos Area Office", location: "ከመናኃሪያ ወደ ገበያ በሚወስደወ መንገድ ላይ ትንሽ ወረድ ብሎ", region: "Amhara" },
  { sNo: 37, solId: "137", nameEn: "TABOR", nameAm: "ታቦር", phone: "046-2-12-00-37", manager: "Asres Menchamo", district: "Hawassa Area Office", location: "አቶቴ አካባቢ ሀይሌ ህንፃ ላይ", region: "Sidama" },
  { sNo: 38, solId: "138", nameEn: "MOYALE", nameAm: "ሞያሌ", phone: "046-4-44-01-10", manager: "Temesegen", district: "Hawassa Area Office", location: "ፍቃዱ ሆቴል፣ (ወይም ስማርት ካፌ ፊት ለትፈ)", region: "Somale" },
  { sNo: 39, solId: "139", nameEn: "DEJEN", nameAm: "ደጀን", phone: "058-776-00-19", manager: "Mamaru gizachew", district: "Debre Markos Area Office", location: "የገበያ ማዕከል ፊት ለፊት (ፍትህ ጽ/ቤት አካባቢ)", region: "Amhara" },
  { sNo: 40, solId: "140", nameEn: "MEKELE ENKODO", nameAm: "መቀሌ ኢንኮዶ", phone: "034-4-40-67-49", manager: "Mebrahtu Hailay G/Mariam", district: "Mekele District", location: "ታሓገዝ ህንፃ ከፍ ብሎ ወደ ሓውዜን ኣደባባይ የሚወስድ መንገድ", region: "Tigray" },
  { sNo: 41, solId: "141", nameEn: "BOLE ASRASIMINT", nameAm: "ቦሌ አስራ ስምንት", phone: "011-6-63-12-89", manager: "YIBELTAL HASAB", district: "East A.A District", location: "ከጐላጐል ወደ ቦሌ መድኃኒዓለም በሚወስደው መንገድ አውራሪስ ሆቴል አጠገብ", region: "Addis Ababa" },
  { sNo: 42, solId: "142", nameEn: "NEKEMTE", nameAm: "ነቀምት", phone: "057-6-61-31-06", manager: "Tariku Birassa", district: "Jimma Area Office", location: "ሁለተኛ ማዞሪያ አካባቢ", region: "Oromia" },
  { sNo: 43, solId: "143", nameEn: "ADAMA DEMBELLA", nameAm: "አዳማ-ደምበላ", phone: "022-1-11-41-81", manager: "Fikru Hailemariam", district: "Adama Area Office", location: "Cinema Mormor፣ መሀማድ ኑር ህንፃ ላይ አጠገብ", region: "Oromia" },
  { sNo: 44, solId: "144", nameEn: "DIRE DAWA", nameAm: "ድሬዳዋ", phone: "025-4-11-01-15", manager: "Abeyu Negash", district: "Adama Area Office", location: "ታይዋን አካባቢ፣ ሼክ ሀቢብ ሞል ህንፃ ላይ", region: "Dire Dawa" }
];

console.log("Parsed rows count:", rawRows.length);
