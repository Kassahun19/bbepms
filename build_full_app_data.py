import json
import re

# Let's define the data structure and parse all 18 pages of OCR text.
# We will create a clean JSON file and then generate bunnaBranchDirectory.ts

pdf_pages_data = [
    # Page 1
    [
        (1, "101", "MAIN", "ዐብይ", "011-158-08-84/25/26", "Ato Zena Asefa", "Main", "ከወሎ ሰፈር አደባባይ ወደ ሩዋንዳ በሚወስደዉ ቡና ባንክ ህንፃ ላይ", "Addis Ababa"),
        (2, "102", "HAYAHULET MAZORIA", "ሃያ ሁለት ማዞሪያ", "011-6-62-21-33", "Ato Zebene Abera", "East A.A District", "ሃያሁለት ማዞሪያ ትራፊክ ጽ/ቤት አካባቢ ከቱሪስት ንግድ ስራ ድርጅት አጠገብ", "Addis Ababa"),
        (3, "103", "MESALEMIA", "መሳለሚያ", "011-278-22-46", "Adamu Admasu", "West A.A District", "መርካቶ አውቶቢስ ተራን እንዳለፉ የሸዋ ፀጋ ህንፃ ፊት ለፊት", "Addis Ababa"),
        (4, "104", "BOLEMEDHANI ALEM", "ቦሌ መድኃኔዓለም", "011 662 2447", "Ato Ashenafi Tadesse", "East A.A District", "ቦሌ መድኃኒያለም ከኤድናሞል ወረድ ብሎ ቢርጋርደን ፊት ለፊት", "Addis Ababa"),
        (5, "105", "ADAMA", "አዳማ", "022-112-05-35", "Nebiyou Samuel", "Adama Area Office", "ከፖስታ ቤት አደባባይ ወደ መብራት ኃይል በሚወስደው መንገድ ላይ፣ ህብረት ሥጋ ቤት", "Oromia"),
        (6, "106", "GENET", "ገነት", "011-5 52-54-69", "Misganaw", "South A.A District", "ከገነት ሆቴል ከፍ ብሎ ፅለረ ህንፃ", "Addis Ababa"),
        (7, "107", "BAHIR DAR", "ባህር ዳር", "058-2-22-22-00", "Mengistu Wolelaw", "Bahir Dar District", "ከጊዮርጊስ ቤ/ክ ወደ ፖፒረስ ሆቴል በሚወስደው መንገድ ላይ፣ ትራፊክ መብራት አካባቢ", "Amhara"),
        (8, "108", "AYER TENA", "አየር ጤና", "011-3- 48 65 00", "MELAKU TAMENE", "South A.A District", "ከአየር ጤና አደባባይ ሳሚ ካፌን አለፍ ብሎ", "Addis Ababa"),
        (9, "109", "HABTE GIORGIS", "ሀብተጊዮርጊስ", "011-1-55-82-24", "Ato Semere Tirfu", "West A.A District", "ጊዮርጊስ አትክልት ተራ ከሊፋ ህንፃ ሥር", "Addis Ababa"),
        (10, "110", "ASIRA SIMINT MAZORIA", "አስራስምንት ማዞሪያ", "011-2-80-07-97", "Addisu Abissa Degoma", "West A.A District", "18 ማዞሪያ አደባባይ ኖክ fhንፃ ላይ", "Addis Ababa"),
        (11, "111", "BEKLO BET", "በቅሎ ቤት", "011-4-16-32-30", "Ashenafi Lakew", "South A.A District", "ከገቢዎች ባለሥልጣን ፊት ለፊት", "Addis Ababa"),
        (12, "112", "MEKELE", "መቀሌ", "034-4-40-00-94", "Ato Aklilu G/Medhin", "Mekele District", "ቐዳማይ ወያነ የገበያ ማእከል አካባቢ", "Tigray"),
        (13, "113", "MERKATO", "መርካቶ", "011-2-78-14-35", "Ephrem Meka Sumega", "West A.A District", "ጣና የገበያ አዳራሽ አጠገብ፣ ድር ተራ ህንፃ 1ኛ ፎቅ", "Addis Ababa"),
        (14, "114", "GONDER", "ጐንደር", "058-1-11-24-43", "Ato Eyasu", "Bahir Dar District", "አራዳ ቦምብ ተራ አካባቢ", "Amhara"),
        (15, "115", "HOSSANA", "ሆሳእና", "046 – 5- 55-21-61", "Binyam Amado", "Hawassa Area Office", "ከአደባባይ ወደ መናሃሪያ በሚወስደው መንገድ ቤተክህነት ፊት ለፊት", "Central Ethiopia"),
        (16, "116", "BICHENA", "ብቸና", "058-6-651053", "Ato Temesgen", "Debre Markos Area Office", "በላይ ዘለቀ ሃውልት ፊት ለፊት", "Amhara"),
        (17, "117", "KOBO", "ቆቦ", "033-3-34-12-74", "Ato yohannes Molla", "Dessie District", "ፖሊስ ጣቢያ (ግንብ ቀበሌ አካባቢ) ዓለም ህንፃ ላይ", "Amhara"),
        (18, "118", "JIMMA", "ጅማ", "047-1-12 20 85", "Desta W/senbet", "Jimma Area Office", "መርካቶ ጂጂ ህንፃ ላይ", "Oromia"),
        (19, "119", "HAWASSA", "ሀዋሳ", "0462-20-55-85", "Alem Muluneh", "Hawassa Area Office", "ፒያሳ አካባቢ ፒና ሆቴል ፊት ለፊት ታይም ካፌ አጠገብ", "Sidama"),
        (20, "120", "KOTEBE", "ኮተቤ", "011-6-67-80-36", "Ato Yetemgeta Aregahgn", "East A.A District", "ኮተቤ መምህራን ማሰልጠኛ ኮሌጅ ፊት ለፊት", "Addis Ababa"),
        (21, "121", "SHASHEMENE", "ሻሸመኔ", "046-1-10-02-45", "Gemeda Negulie", "Hawassa Area Office", "አቦስቶ አካባቢ ፀጋዬ ህንፃ", "Oromia"),
    ],
    # Page 2
    [
        (22, "122", "OLYMPIA", "ኦሎምፒያ", "011-5-57-22-21", "Ato Million Kiflie", "East A.A District", "ኦሎምፒያ ሸዋ ዳቦ ፊት ለፊት ኦሜዳድ አጠገብ", "Addis Ababa"),
        (23, "123", "GAMBELLA", "ጋምቤላ", "047-5-51-00-79", "Dawit Haile Tamerasha", "Jimma Area Office", "ግራንድ ሪዞርት እና ስፓ አጠገብ አደባባዩ ጋር", "Gambela"),
        (24, "124", "DESSIE", "ደሴ", "033-1-12-00-50", "Girma Workneh", "Dessie District", "ፒያሳ፣ አላሙዲን ህንፃ 1ኛ ፎቅ ላይ", "Amhara"),
        (25, "125", "DEBRE BIRIHAN", "ደብረ ብርሃን", "011-6-81-13-64", "Gibreyesus Kassaye", "Debre Birhan Area Office", "ኢትዮ በርኖስ ሆቴል ህንፃ ላይ", "Amhara"),
        (26, "126", "GERJI", "ገርጂ", "011-6-39-40-11", "Ato Adinew Hageru", "East A.A District", "ገርጂ ሮባ ዳቦ ቤት አጠገብ", "Addis Ababa"),
        (27, "127", "BALE GOBA", "ባሌ ጎባ", "022-6-61-25-28", "Chernet Ayalkibet Argaw", "Hawassa Area Office", "የዱሮ ፖስታ ቤት የነበረበት ህንፃ ላይ፣ ከንግድ ባንክ ዋናው ቅርንጫፍ ጐን", "Oromia"),
        (28, "128", "HALABA", "አላባ", "046-5-56-06-43", "Simegne G/Mikael", "Hawassa Area Office", "አስፈራው ህንፃ ላይ ያአብ ሥራ ሆቴል አካባቢ", "Central Ethiopia"),
        (29, "129", "BALE ROBE", "ባሌ ሮቤ", "022-6-65-28-00", "Welensa Yakob", "Hawassa Area Office", "ከመደወላቡ ዩኒቨርሲቲ ወደ አደባባይ በሚወስደው መንገድ ላይ፣ ደበበ ሆቴል ፊት ለፊት", "Oromia"),
        (30, "130", "GOJAM BERENDDA", "ጐጃም በረንዳ", "0111-26-27-24", "Ato Henok Mengistu", "West A.A District", "ከዮሐንስ ወደ ጐጃም በረንዳ በሚወስደው መንገድ ጐጐታ ሆቴል አጠገብ", "Addis Ababa"),
        (31, "131", "KOBO ROBIT", "ቆቦ ሮቢት", "033-1-13-01-68", "Abera Gugsa", "Dessie District", "ከማዘጋጃ ቤት ፊት ለፊት", "Amhara"),
        (32, "132", "SHASHEMENE ARADA", "ሻሸመኔ አራዳ", "046-2-11-00-52", "Ketema Abera", "Hawassa Area Office", "አፖስቶ አካባቢ፣ ፍሬም ህንፃ ላይ", "Oromia"),
        (33, "133", "YIRGALEM", "ይርጋለም", "046-2-25-12-95", "Mulatu Shiguta", "Hawassa Area Office", "መናኃሪያ መግቢያው ላይ፣ አንባሳ ሆቴል አጠገብ", "Sidama"),
        (34, "134", "BELAY ZELEKE", "በላይ ዘለቀ", "058-2-20-53-43", "Ato Wondifraw Melaku", "Bahir Dar District", "ከፖፒረስ ሆቴል ፊት ለፊት", "Amhara"),
        (35, "135", "BOLE RWANDA", "ቦሌ ሩዋንዳ", "011-6-39-23-52", "Tegene Kesisa", "South A.A District", "ቦሌ ሚካኤል Dasabshill ህንፃ ትንሽ ወረድ ብሎ", "Addis Ababa"),
        (36, "136", "DEBRE MARKOS", "ደብረ ማርቆስ", "058-7-71-16-45", "Abew", "Debre Markos Area Office", "ከመናኃሪያ ወደ ገበያ በሚወስደወ መንገድ ላይ ትንሽ ወረድ ብሎ", "Amhara"),
        (37, "137", "TABOR", "ታቦር", "046-2-12-00-37", "Asres Menchamo", "Hawassa Area Office", "አቶቴ አካባቢ ሀይሌ ህንፃ ላይ", "Sidama"),
        (38, "138", "MOYALE", "ሞያሌ", "046-4-44-01-10", "Temesegen", "Hawassa Area Office", "ፍቃዱ ሆቴል፣ (ወይም ስማርት ካፌ ፊት ለትፈ)", "Somale"),
        (39, "139", "DEJEN", "ደጀን", "058-776-00-19", "Mamaru gizachew", "Debre Markos Area Office", "የገበያ ማዕከል ፊት ለፊት (ፍትህ ጽ/ቤት አካባቢ)", "Amhara"),
        (40, "140", "MEKELE ENKODO", "መቀሌ ኢንኮዶ", "034-4-40-67-49", "Mebrahtu Hailay G/Mariam", "Mekele District", "ታሓገዝ ህንፃ ከፍ ብሎ ወደ ሓውዜን ኣደባባይ የሚወስድ መንገድ", "Tigray"),
        (41, "141", "BOLE ASRASIMINT", "ቦሌ አስራ ስምንት", "011-6-63-12-89", "YIBELTAL HASAB", "East A.A District", "ከጐላጐል ወደ ቦሌ መድኃኒዓለም በሚወስደው መንገድ አውራሪስ ሆቴል አጠገብ", "Addis Ababa"),
        (42, "142", "NEKEMTE", "ነቀምት", "057-6-61-31-06", "Tariku Birassa", "Jimma Area Office", "ሁለተኛ ማዞሪያ አካባቢ", "Oromia"),
        (43, "143", "ADAMA DEMBELLA", "አዳማ-ደምበላ", "022-1-11-41-81", "Fikru Hailemariam", "Adama Area Office", "Cinema Mormor፣ መሀማድ ኑር ህንፃ ላይ አጠገብ", "Oromia"),
        (44, "144", "DIRE DAWA", "ድሬዳዋ", "025-4-11-01-15", "Abeyu Negash", "Adama Area Office", "ታይዋን አካባቢ፣ ሼክ ሀቢብ ሞል ህንፃ ላይ", "Dire Dawa")
    ]
]

print("Python base structure ready.")
