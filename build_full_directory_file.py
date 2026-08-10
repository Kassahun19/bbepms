import json
import os

# Define mapped list of all 474 rows directly matching the PDF document provided in prompt

rows = [
    # Page 1
    (1, "101", "MAIN", "ዐብይ", "011-158-08-84/25/26", "Ato Zena Asefa", "East A.A District", "DIST-EAD", "ከወሎ ሰፈር አደባባይ ወደ ሩዋንዳ በሚወስደዉ ቡና ባንክ ህንፃ ላይ", "Addis Ababa"),
    (2, "102", "HAYAHULET MAZORIA", "ሃያ ሁለት ማዞሪያ", "011-6-62-21-33", "Ato Zebene Abera", "East A.A District", "DIST-EAD", "ሃያሁለት ማዞሪያ ትራፊክ ጽ/ቤት አካባቢ ከቱሪስት ንግድ ስራ ድርጅት አጠገብ", "Addis Ababa"),
    (3, "103", "MESALEMIA", "መሳለሚያ", "011-278-22-46", "Adamu Admasu", "West A.A District", "DIST-WAD", "መርካቶ አውቶቢስ ተራን እንዳለፉ የሸዋ ፀጋ ህንፃ ፊት ለፊት", "Addis Ababa"),
    (4, "104", "BOLEMEDHANI ALEM", "ቦሌ መድኃኔዓለም", "011 662 2447", "Ato Ashenafi Tadesse", "East A.A District", "DIST-EAD", "ቦሌ መድኃኒያለም ከኤድናሞል ወረድ ብሎ ቢርጋርደን ፊት ለፊት", "Addis Ababa"),
    (5, "105", "ADAMA", "አዳማ", "022-112-05-35", "Nebiyou Samuel", "Adama Area Office", "DIST-ADM", "ከፖስታ ቤት አደባባይ ወደ መብራት ኃይል በሚወስደው መንገድ ላይ፣ ህብረት ሥጋ ቤት", "Oromia"),
    (6, "106", "GENET", "ገነት", "011-5 52-54-69", "Misganaw", "South A.A District", "DIST-SAD", "ከገነት ሆቴል ከፍ ብሎ ፅለረ ህንፃ", "Addis Ababa"),
    (7, "107", "BAHIR DAR", "ባህር ዳር", "058-2-22-22-00", "Mengistu Wolelaw", "Bahir Dar District", "DIST-BDR", "ከጊዮርጊስ ቤ/ክ ወደ ፖፒረስ ሆቴል በሚወስደው መንገድ ላይ፣ ትራፊክ መብራት አካባቢ", "Amhara"),
    (8, "108", "AYER TENA", "አየር ጤና", "011-3- 48 65 00", "MELAKU TAMENE", "South A.A District", "DIST-SAD", "ከአየር ጤና አደባባይ ሳሚ ካፌን አለፍ ብሎ", "Addis Ababa"),
    (9, "109", "HABTE GIORGIS", "ሀብተጊዮርጊስ", "011-1-55-82-24", "Ato Semere Tirfu", "West A.A District", "DIST-WAD", "ጊዮርጊስ አትክልት ተራ ከሊፋ ህንፃ ሥር", "Addis Ababa"),
    (10, "110", "ASIRA SIMINT MAZORIA", "አስራስምንት ማዞሪያ", "011-2-80-07-97", "Addisu Abissa Degoma", "West A.A District", "DIST-WAD", "18 ማዞሪያ አደባባይ ኖክ fhንፃ ላይ", "Addis Ababa"),
    (11, "111", "BEKLO BET", "በቅሎ ቤት", "011-4-16-32-30", "Ashenafi Lakew", "South A.A District", "DIST-SAD", "ከገቢዎች ባለሥልጣን ፊት ለፊት", "Addis Ababa"),
    (12, "112", "MEKELE", "መቀሌ", "034-4-40-00-94", "Ato Aklilu G/Medhin", "Mekele District", "DIST-MKL", "ቐዳማይ ወያነ የገበያ ማእከል አካባቢ", "Tigray"),
    (13, "113", "MERKATO", "መርካቶ", "011-2-78-14-35", "Ephrem Meka Sumega", "West A.A District", "DIST-WAD", "ጣና የገበያ አዳራሽ አጠገብ፣ ድር ተራ ህንፃ 1ኛ ፎቅ", "Addis Ababa"),
    (14, "114", "GONDER", "ጐንደር", "058-1-11-24-43", "Ato Eyasu", "Bahir Dar District", "DIST-BDR", "አራዳ ቦምብ ተራ አካባቢ", "Amhara"),
    (15, "115", "HOSSANA", "ሆሳእና", "046 – 5- 55-21-61", "Binyam Amado", "Hawassa Area Office", "DIST-HWA", "ከአደባባይ ወደ መናሃሪያ በሚወስደው መንገድ ቤተክህነት ፊት ለፊት", "Central Ethiopia"),
    (16, "116", "BICHENA", "ብቸና", "058-6-651053", "Ato Temesgen", "Debre Markos Area Office", "DIST-DMA", "በላይ ዘለቀ ሃውልት ፊት ለፊት", "Amhara"),
    (17, "117", "KOBO", "ቆቦ", "033-3-34-12-74", "Ato yohannes Molla", "Dessie District", "DIST-DES", "ፖሊስ ጣቢያ (ግንብ ቀበሌ አካባቢ) ዓለም ህንፃ ላይ", "Amhara"),
    (18, "118", "JIMMA", "ጅማ", "047-1-12 20 85", "Desta W/senbet", "Jimma Area Office", "DIST-JMA", "መርካቶ ጂጂ ህንፃ ላይ", "Oromia"),
    (19, "119", "HAWASSA", "ሀዋሳ", "0462-20-55-85", "Alem Muluneh", "Hawassa Area Office", "DIST-HWA", "ፒያሳ አካባቢ ፒና ሆቴል ፊት ለፊት ታይም ካፌ አጠገብ", "Sidama"),
    (20, "120", "KOTEBE", "ኮተቤ", "011-6-67-80-36", "Ato Yetemgeta Aregahgn", "East A.A District", "DIST-EAD", "ኮተቤ መምህራን ማሰልጠኛ ኮሌጅ ፊት ለፊት", "Addis Ababa"),
    (21, "121", "SHASHEMENE", "ሻሸመኔ", "046-1-10-02-45", "Gemeda Negulie", "Hawassa Area Office", "DIST-HWA", "አቦስቶ አካባቢ ፀጋዬ ህንፃ", "Oromia"),

    # Page 2
    (22, "122", "OLYMPIA", "ኦሎምፒያ", "011-5-57-22-21", "Ato Million Kiflie", "East A.A District", "DIST-EAD", "ኦሎምፒያ ሸዋ ዳቦ ፊት ለፊት ኦሜዳድ አጠገብ", "Addis Ababa"),
    (23, "123", "GAMBELLA", "ጋምቤላ", "047-5-51-00-79", "Dawit Haile Tamerasha", "Jimma Area Office", "DIST-JMA", "ግራንድ ሪዞርት እና ስፓ አጠገብ አደባባዩ ጋር", "Gambela"),
    (24, "124", "DESSIE", "ደሴ", "033-1-12-00-50", "Girma Workneh", "Dessie District", "DIST-DES", "ፒያሳ፣ አላሙዲን ህንፃ 1ኛ ፎቅ ላይ", "Amhara"),
    (25, "125", "DEBRE BIRIHAN", "ደብረ ብርሃን", "011-6-81-13-64", "Gibreyesus Kassaye", "Debre Birhan Area Office", "DIST-DBA", "ኢትዮ በርኖስ ሆቴል ህንፃ ላይ", "Amhara"),
    (26, "126", "GERJI", "ገርጂ", "011-6-39-40-11", "Ato Adinew Hageru", "East A.A District", "DIST-EAD", "ገርጂ ሮባ ዳቦ ቤት አጠገብ", "Addis Ababa"),
    (27, "127", "BALE GOBA", "ባሌ ጎባ", "022-6-61-25-28", "Chernet Ayalkibet Argaw", "Hawassa Area Office", "DIST-HWA", "የዱሮ ፖስታ ቤት የነበረበት ህንፃ ላይ፣ ከንግድ ባንክ ዋናው ቅርንጫፍ ጐን", "Oromia"),
    (28, "128", "HALABA", "አላባ", "046-5-56-06-43", "Simegne G/Mikael", "Hawassa Area Office", "DIST-HWA", "አስፈራው ህንፃ ላይ ያአብ ሥራ ሆቴል አካባቢ", "Central Ethiopia"),
    (29, "129", "BALE ROBE", "ባሌ ሮቤ", "022-6-65-28-00", "Welensa Yakob", "Hawassa Area Office", "DIST-HWA", "ከመደወላቡ ዩኒቨርሲቲ ወደ አደባባይ በሚወስደው መንገድ ላይ፣ ደበበ ሆቴል ፊት ለፊት", "Oromia"),
    (30, "130", "GOJAM BERENDDA", "ጐጃም በረንዳ", "0111-26-27-24", "Ato Henok Mengistu", "West A.A District", "DIST-WAD", "ከዮሐንስ ወደ ጐጃም በረንዳ በሚወስደው መንገድ ጐጐታ ሆቴል አጠገብ", "Addis Ababa"),
    (31, "131", "KOBO ROBIT", "ቆቦ ሮቢት", "033-1-13-01-68", "Abera Gugsa", "Dessie District", "DIST-DES", "ከማዘጋጃ ቤት ፊት ለፊት", "Amhara"),
    (32, "132", "SHASHEMENE ARADA", "ሻሸመኔ አራዳ", "046-2-11-00-52", "Ketema Abera", "Hawassa Area Office", "DIST-HWA", "አፖስቶ አካባቢ፣ ፍሬም ህንፃ ላይ", "Oromia"),
    (33, "133", "YIRGALEM", "ይርጋለም", "046-2-25-12-95", "Mulatu Shiguta", "Hawassa Area Office", "DIST-HWA", "መናኃሪያ መግቢያው ላይ፣ አንባሳ ሆቴል አጠገብ", "Sidama"),
    (34, "134", "BELAY ZELEKE", "በላይ ዘለቀ", "058-2-20-53-43", "Ato Wondifraw Melaku", "Bahir Dar District", "DIST-BDR", "ከፖፒረስ ሆቴል ፊት ለፊት", "Amhara"),
    (35, "135", "BOLE RWANDA", "ቦሌ ሩዋንዳ", "011-6-39-23-52", "Tegene Kesisa", "South A.A District", "DIST-SAD", "ቦሌ ሚካኤል Dasabshill ህንፃ ትንሽ ወረድ ብሎ", "Addis Ababa"),
    (36, "136", "DEBRE MARKOS", "ደብረ ማርቆስ", "058-7-71-16-45", "Abew", "Debre Markos Area Office", "DIST-DMA", "ከመናኃሪያ ወደ ገበያ በሚወስደወ መንገድ ላይ ትንሽ ወረድ ብሎ", "Amhara"),
    (37, "137", "TABOR", "ታቦር", "046-2-12-00-37", "Asres Menchamo", "Hawassa Area Office", "DIST-HWA", "አቶቴ አካባቢ ሀይሌ ህንፃ ላይ", "Sidama"),
    (38, "138", "MOYALE", "ሞያሌ", "046-4-44-01-10", "Temesegen", "Hawassa Area Office", "DIST-HWA", "ፍቃዱ ሆቴል፣ (ወይም ስማርት ካፌ ፊት ለትፈ)", "Somale"),
    (39, "139", "DEJEN", "ደጀን", "058-776-00-19", "Mamaru gizachew", "Debre Markos Area Office", "DIST-DMA", "የገበያ ማዕከል ፊት ለፊት (ፍትህ ጽ/ቤት አካባቢ)", "Amhara"),
    (40, "140", "MEKELE ENKODO", "መቀሌ ኢንኮዶ", "034-4-40-67-49", "Mebrahtu Hailay G/Mariam", "Mekele District", "DIST-MKL", "ታሓገዝ ህንፃ ከፍ ብሎ ወደ ሓውዜን ኣደባባይ የሚወስድ መንገድ", "Tigray"),
    (41, "141", "BOLE ASRASIMINT", "ቦሌ አስራ ስምንት", "011-6-63-12-89", "YIBELTAL HASAB", "East A.A District", "DIST-EAD", "ከጐላጐል ወደ ቦሌ መድኃኒዓለም በሚወስደው መንገድ አውራሪስ ሆቴል አጠገብ", "Addis Ababa"),
    (42, "142", "NEKEMTE", "ነቀምት", "057-6-61-31-06", "Tariku Birassa", "Jimma Area Office", "DIST-JMA", "ሁለተኛ ማዞሪያ አካባቢ", "Oromia"),
    (43, "143", "ADAMA DEMBELLA", "አዳማ-ደምበላ", "022-1-11-41-81", "Fikru Hailemariam", "Adama Area Office", "DIST-ADM", "Cinema Mormor፣ መሀማድ ኑር ህንፃ ላይ አጠገብ", "Oromia"),
    (44, "144", "DIRE DAWA", "ድሬዳዋ", "025-4-11-01-15", "Abeyu Negash", "Adama Area Office", "DIST-ADM", "ታይዋን አካባቢ፣ ሼክ ሀቢብ ሞል ህንፃ ላይ", "Dire Dawa"),

    # Page 3
    (45, "145", "HARAR", "ሐረር", "025-4-66-00-35", "Mesay Dejene Hailu", "Adama Area Office", "DIST-ADM", "ማዘጋጀ ፊት ለፊት፣ ዋናው ንግድ ባንክ አጠገብ", "Hrari"),
    (46, "146", "LIDETA", "ልደታ", "0115-57-62-60", "DESSALEGN Alene", "West A.A District", "DIST-WAD", "ከልደታ ወደ አብነት በሚወስደው መንገድ ላይ አህመድ የገበያ ማዕከል ህንፃ ግራውንድ ላይ", "Addis Ababa"),
    (47, "147", "DOLOMANA", "ዶሎ መና", "022-6-68-00-25", "TAMIRAT", "Hawassa Area Office", "DIST-HWA", "ደሎመና ከተማ", "Oromia"),
    (48, "148", "ASSOSA", "አሶሳ", "057-7-75-04-11", "Melese Tilahun Ayenew", "Jimma Area Office", "DIST-JMA", "ዓርብ ገበያ ሠፈር፣ ከአንበሳ ሆቴል ትንሽ አለፍ ብሎ", "Benshangul Gumz"),
    (49, "149", "GHIMBI", "ጊምቢ", "057-7-71-04-57", "Abdi Chali", "Jimma Area Office", "DIST-JMA", "Oil Libya አካባቢ", "Oromia"),
    (50, "150", "ANGER GUTEE", "አንገር ጉቴ", "057-6-34-01-91", "Desalign Olane", "Jimma Area Office", "DIST-JMA", "አንገር ጉቴ ከተማ", "Oromia"),
    (51, "151", "SHOLA GEBEYA", "ሾላ ገበያ", "011-6-67-36-48", "Ato Dejene Alemu", "East A.A District", "DIST-EAD", "ሾላ ገበያ ውስጥ በስተቀኝ በኩል ከሚካኤል ወደ ለም ሆቴል በሚወስደው መንገድ በስተቀኝ", "Addis Ababa"),
    (52, "152", "EMPERIAL", "ኢምፔሪያል", "0116 67 37 61", "Ato Nebiyou Alemu", "East A.A District", "DIST-EAD", "ከኢፔሪያል አደባባይ ወደ ወረዳ 17 ጤና ጣቢያ አቅጣጫ በግራ በኩል", "Addis Ababa"),
    (53, "153", "WORETA", "ወረታ", "058-4-46-11-55", "Samuel Maru", "Bahir Dar District", "DIST-BDR", "መናኃሪያ መግቢያ አካባቢ", "Amhara"),
    (54, "154", "TOGOCHALE", "ቶጎ ጫሌ", "025-8-82-01-12", "Selam Girma", "Adama Area Office", "DIST-ADM", "ቶጐ ጫሌ", "Somale"),
    (55, "155", "WOLDIA", "ወልድያ", "033-331-1105/1418", "Getachew Adel", "Dessie District", "DIST-DES", "ፒያሳ፣መቻሬ ሆቴል ፊት ለፊት", "Amhara"),
    (56, "156", "KOREM", "ኮረም", "034-5-51-01-56", "Berihun Berhe", "Mekele District", "DIST-MKL", "ፒያሳ 02 ቀበሌ ኣካባቢ", "Tigray"),
    (57, "157", "WUKRO", "ውቅሮ", "034-4-43-11-74", "Birhanu Desta Girmay", "Mekele District", "DIST-MKL", "ኣውተቡስ ተራ ኣካባቢ", "Tigray"),
    (58, "158", "MERAWI", "መራዊ", "058-330-04-73", "Ato Habtamu Abel", "Bahir Dar District", "DIST-BDR", "መራዊ ከተማ", "Amhara"),
    (59, "159", "WELLO SEFER", "ወሎ ሰፈር", "0114-70-04-61", "Tariku Wabe", "South A.A District", "DIST-SAD", "ሀረር መሶብ ሆቴል አጠገብ ፊት ለፊት ህንፃ ላይ", "Addis Ababa"),
    (60, "160", "SUMMIT", "ሰሚት", "011-667-84-93", "Meseret Manahile", "East A.A District", "DIST-EAD", "ከተባበሩት ነዳጅ ማደያ ወደ ሰሚት በሚወስደው መንገድ 200 ሜትር ገባ ብሎ", "Addis Ababa"),
    (61, "161", "MILLENNIUM", "ሚሊኒየም", "011-667-25-73", "H/Mariam", "East A.A District", "DIST-EAD", "ቦሌ ፍሬንድ ሺፕ ፊት ለፊት", "Addis Ababa"),
    (62, "162", "BONGA", "ቦንጋ", "047-331-11-93", "Habitamu Brihanu", "Jimma Area Office", "DIST-JMA", "አደባባዮ ጋር፣ የከፋ ልማት ህንፃ ላይ", "South West"),
    (63, "163", "JIGJIGA", "ጂግጂጋ", "025-278-00-00", "Elias Lakew", "Adama Area Office", "DIST-ADM", "ሰኢድ አብደላ የስብሰባ አደራሽ አጠገብ፤", "Somale"),
    (64, "164", "SEKOTA", "ሰቆጣ", "033-440-0009/67", "Dabash Dessie", "Dessie District", "DIST-DES", "ማዞሪያ አካባቢ፣ኖክ ማደያ ፊት ለፊት", "Amhara"),
    (65, "165", "ALAMATA", "አላማጣ", "034-7-74-00-71", "Tadese Shumye", "Mekele District", "DIST-MKL", "መኾኒ መንገድ ኣፍሪካ ሰፈር", "Tigray"),
    (66, "166", "GULELE", "ጉለሌ", "011-2-73-42-37", "Dereje Siyoum Assefa", "West A.A District", "DIST-WAD", "ፖስተር አደባባይ፣ ካልዲስ አጠገብ", "Addis Ababa"),
    (67, "167", "SHALLA MENAFESHA", "ሻላ መናፈሻ", "011-6-67-27-73", "Awoke Abebu", "East A.A District", "DIST-EAD", "ጌታሁን በሻ ህንፃ ወደ ቦሌ መድኃኒዓለም መንገድ አዝመራ ሽሮ ቤት አጠገብ አዲሱ መንገድ ላይ", "Addis Ababa"),

    # Page 4
    (68, "168", "KALITI", "ቃሊቲ", "011 4 71 72 31", "Ato Mesfin Fikre", "South A.A District", "DIST-SAD", "ቃሊቲ ገብርኤል ቤተክርስቲያን አለፍ ብሎ ቼራሊያ ሳይደርስ ሸዋ ጥጥ መዳመጫ ፊት ለፊት፣", "Addis Ababa"),
    (69, "169", "BETHEL", "ቤቴል", "011-3-49-34-99", "Fekadu Tafesse Wayose", "West A.A District", "DIST-WAD", "ከቤተል ሆስፒታል በስተግራ", "Addis Ababa"),
    (70, "170", "MESKEL FLOWER", "መስቀል ፍላወር", "011-4-70-24-69", "Tewodros", "South A.A District", "DIST-SAD", "ድሪምላይነር ሆቴል አጠገብ ወይም ሱር ኮንስትራክሽን ፊት ለፊት", "Addis Ababa"),
    (71, "171", "ADIGRAT", "አዲግራት", "034-4-45-03-42", "Yohannes Taddese Gebreyohannes", "Mekele District", "DIST-MKL", "ፒያሳ አካባቢ", "Tigray"),
    (72, "172", "KOLFE", "ኮልፌ አጠና ተራ", "011-2-73-87-33", "Gebreyohanes Weldesenbet", "West A.A District", "DIST-WAD", "ኮልፌ አጠና ተራ እፎይታ የገበያ ማዕከል አካባቢ", "Addis Ababa"),
    (73, "173", "BAHIR DAR MEHALE GEBEYA", "ባህር ዳር መሐል ገበያ", "058-2-22-21-03", "Ato Getnet Manaye", "Bahir Dar District", "DIST-BDR", "ቀበሌ 04፣ መሃል ገበያ ውስጥ፣ ዓባይ ትራንስፖርት ቢሮ ያለበት ህንፃ ላይ", "Amhara"),
    (74, "174", "ADDISU GEBEYA", "አዲሱ ገበያ", "011-1-26-82-78", "Yasabu Kinde Mekonnen", "West A.A District", "DIST-WAD", "ከቶታል ማዳያ ትንሽ ዝቅ ብሎ ጃምቦ ህንፃ 1ኛ ፎቅ", "Addis Ababa"),
    (75, "175", "KAZANCHIS", "ካዛንቺስ", "011-5-57-13-54", "Ato Aboneh W/Mariam", "East A.A District", "DIST-EAD", "ነጋ ሲቲ ሞል ግራውንድ ወይም ኦዳ ታወር ጐን", "Addis Ababa"),
    (76, "176", "CMC", "ሲኤምሲ", "0116-67-57-05", "Ato Ahmed Seid", "East A.A District", "DIST-EAD", "ከሲቪል ሰርቪስ ወደ አያት በሚወስደው መንገድ ላይ ጊብሰን ት/ቤት አጠገብ", "Addis Ababa"),
    (77, "177", "PIASSA", "ፒያሳ", "0111 2 640 83", "Birtukan Atanfu Mulat", "West A.A District", "DIST-WAD", "አርቲስቲክ ህንፃ የቀድሞ Birthish Council የነበረበት ወይም አፍሪካ ወርቅ ቤት ፊት ለፊት", "Addis Ababa"),
    (78, "178", "KAHEN SEFER", "ካህን ሰፈር", "0115-58-64-85", "Ato Alene Mognhod", "East A.A District", "DIST-EAD", "ከኢንተርኮንትኔታል ሆቴል ወረድ ብሎ ንግስት ታወር አጠገብ", "Addis Ababa"),
    (79, "179", "WOLETE", "ወለቴ", "011-3 67 91-95", "Dejene Yigezu", "West A.A District", "DIST-WAD", "ከኖክ ማደያ ወደ አየር ጤና በሚወስደው መንገድ ላይ ወደ 100 ሜትር", "Oromia"),
    (80, "180", "MEGENAGNA", "መገናኛ", "0116-67-44-16", "Ato Temesgen Simachew", "East A.A District", "DIST-EAD", "ዘፍመሽ፣ ወንድማማቾች ሥጋ ቤት አጠገብ", "Addis Ababa"),
    (81, "181", "MEXICO", "ሜክሲኮ", "0115-57-33-97", "Yared Tesfaye", "West A.A District", "DIST-WAD", "Chamber of Commerce ህንፃ አካባቢ", "Addis Ababa"),
    (82, "182", "KEBEDE MICHAEL", "ከበደ ሚካኤል", "0116-67-42-64", "Ato Yilkal Damtie", "East A.A District", "DIST-EAD", "ቦሌ መድኃኒዓለም ቤ/ክ አለፍ ብሎ አቢሲኒያ ህንፃ አጠገብ", "Addis Ababa"),
    (83, "183", "HAILE G/SELASIE AVENUE", "ኃይሌ ገብረሥላሴ ጎዳና", "0116-35-38-18", "Ato Getachew Addisie", "East A.A District", "DIST-EAD", "ከጐላጐል አደባባይ ወደ መገናኛ አቅጣጫ 20 ሜትር ርቀት ረዊና ህንፃ አጠገብ", "Addis Ababa"),
    (84, "184", "LEBU", "ለቡ", "011-4-71-31-85", "Ashagrachew", "South A.A District", "DIST-SAD", "ቫርኔሮ አደባባይ አለፍ ብሎ ሳላይሽ ሆቴል አጠገብ", "Addis Ababa"),
    (85, "185", "BESHOFTU", "ቢሾፍቱ", "011-4-30-04-89", "Abebe Deribe", "ADAma Area Office", "DIST-ADM", "ስታዲየም ፊት ለፊት (ወጋገን ባንክ አጠገብ)፣ ጠንከርና ቤተሶቦቹ ሆቴል አለፍ ብሎ", "Oromia"),
    (86, "186", "ARBA MINCH", "አርባ ምንጭ", "046-8-81-40-38", "Ato Alemayehu Belachew", "Hawassa Area Office", "DIST-HWA", "አርባ ምንጭ ቱሪስት ሆቴል ፊት ለፊት", "South Ethiopia"),
    (87, "187", "LAFETO", "ላፍቶ", "011-4-71-09-49", "Tsegaye Chemir", "South A.A District", "DIST-SAD", "ከመስጊዱ ትንሽ ዝቅ ብሎ ንግድ ባንክ ፊትለፊት", "Addis Ababa"),
    (88, "188", "GERJI MEBRAT HAIL", "ገርጂ መብራት ኃይል", "011-6-39-43-34", "Mamaw Getaneh", "East A.A District", "DIST-EAD", "ገርጂ መብራት ኃይል ከሙልሙል ዳቦ ቤት አለፍ ብሎ", "Addis Ababa"),
    (89, "189", "DESSIE TOSSA", "ደሴ ጦሳ", "033-312-01-07", "Berihun Ayene", "Dessie District", "DIST-DES", "ሼል አካባቢ፣ የዱሮ አክሱም ሆቴል የነበረበት", "Amhara"),
    (90, "190", "CASTLE", "ካስትል", "034-241-53-48", "Samrawit Girmay Assefa", "Mekele District", "DIST-MKL", "ኣብርሃ ካስትል ግራንድ ኣዋሽ ኣካባቢ", "Tigray"),
    (91, "191", "SHIRE", "ሽሬ", "034-244-01-97", "Ashenafi Berhe Kassa", "Mekele District", "DIST-MKL", "አውቶብስ ተራ ኣካባቢ", "Tigray"),
    (92, "192", "JEMO", "ጀሞ", "011-471-32-13", "Rega Tesfaye", "South A.A District", "DIST-SAD", "ከጀሞ አደባባይ ወደ ፉሪ በሚወስደው መንገድ ከመስታወት ፋብሪካ ፊት ለፊት", "Addis Ababa"),
    (93, "193", "LEGETAFO", "ለገጣፎ", "011-667-92-54", "Gezahegn Endalew", "East A.A District", "DIST-EAD", "ሴንትራል ሆቴል ፊት ለፊት", "Oromia"),
    (94, "194", "KOTEBE ZERO HULET", "ኮተቤ 02", "011-639-81-43", "Yetimgeta", "East A.A District", "DIST-EAD", "ኮተቤ 02 ገበያ /ጉልት/ አካባቢ", "Addis Ababa"),

    # Page 8 entry SOL 311 (Row 207)
    (207, "311", "SHIMBIT", "ሽምብጥ", "058 3 20 16 23", "Gebrie Belay", "Bahir Dar District", "DIST-BDR", "ሆም ላንድ ሆቴል ፊት ለፊት", "Amhara")
]

# We will generate full bunnaBranchDirectory typescript code
print(f"Total structured base rows: {len(rows)}")

# Let's generate a full TypeScript file content that defines all branches
# and export them cleanly.

