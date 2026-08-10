import json
import re

# Load the exact OCR text from the 18 pages in the prompt
ocr_text = """
1 101 MAIN ዐብይ 011-158-08-84/25/26 Ato Zena Asefa East A.A District ከወሎ ሰፈር አደባባይ ወደ ሩዋንዳ በሚወስደዉ ቡና ባንክ ህንፃ ላይ Addis Ababa
2 102 HAYAHULET MAZORIA ሃያ ሁለት ማዞሪያ 011-6-62-21-33 Ato Zebene Abera East A.A District ሃያሁለት ማዞሪያ ትራፊክ ጽ/ቤት አካባቢ ከቱሪስት ንግድ ስራ ድርጅት አጠገብ Addis Ababa
3 103 MESALEMIA መሳለሚያ 011-278-22-46 Adamu Admasu West A.A District መርካቶ አውቶቢስ ተራን እንዳለፉ የሸዋ ፀጋ ህንፃ ፊት ለፊት Addis Ababa
4 104 BOLEMEDHANI ALEM ቦሌ መድኃኔዓለም 011 662 2447 Ato Ashenafi Tadesse East A.A District ቦሌ መድኃኒያለም ከኤድናሞል ወረድ ብሎ ቢርጋርደን ፊት ለፊት Addis Ababa
5 105 ADAMA አዳማ 022-112-05-35 Nebiyou Samuel Adama Area Office ከፖስታ ቤት አደባባይ ወደ መብራት ኃይል በሚወስደው መንገድ ላይ፣ ህብረት ሥጋ ቤት Oromia
6 106 GENET ገነት 011-5 52-54-69 Misganaw South A.A District ከገነት ሆቴል ከፍ ብሎ ፅለረ ህንፃ Addis Ababa
7 107 BAHIR DAR ባህር ዳር 058-2-22-22-00 Mengistu Wolelaw Bahir Dar District ከጊዮርጊስ ቤ/ክ ወደ ፖፒረስ ሆቴል በሚወስደው መንገድ ላይ፣ ትራፊክ መብራት አካባቢ Amhara
8 108 AYER TENA አየር ጤና 011-3- 48 65 00 MELAKU TAMENE South A.A District ከአየር ጤና አደባባይ ሳሚ ካፌን አለፍ ብሎ Addis Ababa
9 109 HABTE GIORGIS ሀብተጊዮርጊስ 011-1-55-82-24 Ato Semere Tirfu West A.A District ጊዮርጊስ አትክልት ተራ ከሊፋ ህንፃ ሥር Addis Ababa
10 110 ASIRA SIMINT MAZORIA አስራስምንት ማዞሪያ 011-2-80-07-97 Addisu Abissa Degoma West A.A District 18 ማዞሪያ አደባባይ ኖክ fhንፃ ላይ Addis Ababa
11 111 BEKLO BET በቅሎ ቤት 011-4-16-32-30 Ashenafi Lakew South A.A District ከገቢዎች ባለሥልጣን ፊት ለፊት Addis Ababa
12 112 MEKELE መቀሌ 034-4-40-00-94 Ato Aklilu G/Medhin Mekele District ቐዳማይ ወያነ የገበያ ማእከል አካባቢ Tigray
13 113 MERKATO መርካቶ 011-2-78-14-35 Ephrem Meka Sumega West A.A District ጣና የገበያ አዳራሽ አጠገብ፣ ድር ተራ ህንፃ 1ኛ ፎቅ Addis Ababa
14 114 GONDER ጐንደር 058-1-11-24-43 Ato Eyasu Bahir Dar District አራዳ ቦምብ ተራ አካባቢ Amhara
15 115 HOSSANA ሆሳእና 046 – 5- 55-21-61 Binyam Amado Hawassa Area Office ከአደባባይ ወደ መናሃሪያ በሚወስደው መንገድ ቤተክህነት ፊት ለፊት Centeral Ethiopia
16 116 BICHENA ብቸና 058-6-651053 Ato Temesgen Debre Markos Area Office በላይ ዘለቀ ሃውልት ፊት ለፊት Amhara
17 117 KOBO ቆቦ 033-3-34-12-74 Ato yohannes Molla Dessie District ፖሊስ ጣቢያ (ግንብ ቀበሌ አካባቢ) ዓለም ህንፃ ላይ Amhara
18 118 JIMMA ጅማ 047-1-12 20 85 Desta W/senbet Jimma Area Office መርካቶ ጂጂ ህንፃ ላይ Oromia
19 119 HAWASSA ሀዋሳ 0462-20-55-85 Alem Muluneh Hawassa Area Office ፒያሳ አካባቢ ፒና ሆቴል ፊት ለፊት ታይም ካፌ አጠገብ Sidama
20 120 KOTEBE ኮተቤ 011-6-67-80-36 Ato Yetemgeta Aregahgn East A.A District ኮተቤ መምህራን ማሰልጠኛ ኮሌጅ ፊት ለፊት Addis Ababa
21 121 SHASHEMENE ሻሸመኔ 046-1-10-02-45 Gemeda Negulie Hawassa Area Office አቦስቶ አካባቢ ፀጋዬ ህንፃ Oromia
"""

print("OCR test script executing...")
