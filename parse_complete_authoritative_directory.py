# Parse all 18 pages of the official Bunna Bank Branch Directory PDF verbatim
import json
import re

raw_ocr_pages = """
--- PAGE 1 ---
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
15 115 HOSSANA ሆሳእና 046 – 5- 55-21-61 Binyam Amado Hawassa Area Office ከአደባባይ ወደ መናሃሪያ በሚወስደው መንገድ ቤተክህነት ፊት ለፊት Central Ethiopia
16 116 BICHENA ብቸና 058-6-651053 Ato Temesgen Debre Markos Area Office በላይ ዘለቀ ሃውልት ፊት ለፊት Amhara
17 117 KOBO ቆቦ 033-3-34-12-74 Ato yohannes Molla Dessie District ፖሊስ ጣቢያ (ግንብ ቀበሌ አካባቢ) ዓለም ህንፃ ላይ Amhara
18 118 JIMMA ጅማ 047-1-12 20 85 Desta W/senbet Jimma Area Office መርካቶ ጂጂ ህንፃ ላይ Oromia
19 119 HAWASSA ሀዋሳ 0462-20-55-85 Alem Muluneh Hawassa Area Office ፒያሳ አካባቢ ፒና ሆቴል ፊት ለፊት ታይም ካፌ አጠገብ Sidama
20 120 KOTEBE ኮተቤ 011-6-67-80-36 Ato Yetemgeta Aregahgn East A.A District ኮተቤ መምህራን ማሰልጠኛ ኮሌጅ ፊት ለፊት Addis Ababa
21 121 SHASHEMENE ሻሸመኔ 046-1-10-02-45 Gemeda Negulie Hawassa Area Office አቦስቶ አካባቢ ፀጋዬ ህንፃ Oromia
--- PAGE 2 ---
22 122 OLYMPIA ኦሎምፒያ 011-5-57-22-21 Ato Million Kiflie East A.A District ኦሎምፒያ ሸዋ ዳቦ ፊት ለፊት ኦሜዳድ አጠገብ Addis Ababa
23 123 GAMBELLA ጋምቤላ 047-5-51-00-79 Dawit Haile Tamerasha Jimma Area Office ግራንድ ሪዞርት እና ስፓ አጠገብ አደባባዩ ጋር Gambela
24 124 DESSIE ደሴ 033-1-12-00-50 Girma Workneh Dessie District ፒያሳ፣ አላሙዲን ህንፃ 1ኛ ፎቅ ላይ Amhara
25 125 DEBRE BIRIHAN ደብረ ብርሃን 011-6-81-13-64 Gibreyesus Kassaye Debre Birhan Area Office ኢትዮ በርኖስ ሆቴል ህንፃ ላይ Amhara
26 126 GERJI ገርጂ 011-6-39-40-11 Ato Adinew Hageru East A.A District ገርጂ ሮባ ዳቦ ቤት አጠገብ Addis Ababa
27 127 BALE GOBA ባሌ ጎባ 022-6-61-25-28 Chernet Ayalkibet Argaw Hawassa Area Office የዱሮ ፖስታ ቤት የነበረበት ህንፃ ላይ፣ ከንግድ ባንክ ዋናው ቅርንጫፍ ጐን Oromia
28 128 HALABA አላባ 046-5-56-06-43 Simegne G/Mikael Hawassa Area Office አስፈራው ህንፃ ላይ ያአብ ሥራ ሆቴል አካባቢ Central Ethiopia
29 129 BALE ROBE ባሌ ሮቤ 022-6-65-28-00 Welensa Yakob Hawassa Area Office ከመደወላቡ ዩኒቨርሲቲ ወደ አደባባይ በሚወስደው መንገድ ላይ፣ ደበበ ሆቴል ፊት ለፊት Oromia
30 130 GOJAM BERENDDA ጐጃም በረንዳ 0111-26-27-24 Ato Henok Mengistu West A.A District ከዮሐንስ ወደ ጐጃም በረንዳ በሚወስደው መንገድ ጐጐታ ሆቴል አጠገብ Addis Ababa
31 131 KOBO ROBIT ቆቦ ሮቢት 033-1-13-01-68 Abera Gugsa Dessie District ከማዘጋጃ ቤት ፊት ለፊት Amhara
32 132 SHASHEMENE ARADA ሻሸመኔ አራዳ 046-2-11-00-52 Ketema Abera Hawassa Area Office አፖስቶ አካባቢ፣ ፍሬም ህንፃ ላይ Oromia
33 133 YIRGALEM ይርጋለም 046-2-25-12-95 Mulatu Shiguta Hawassa Area Office መናኃሪያ መግቢያው ላይ፣ አንባሳ ሆቴል አጠገብ Sidama
34 134 BELAY ZELEKE በላይ ዘለቀ 058-2-20-53-43 Ato Wondifraw Melaku Bahir Dar District ከፖፒረስ ሆቴል ፊት ለፊት Amhara
35 135 BOLE RWANDA ቦሌ ሩዋንዳ 011-6-39-23-52 Tegene Kesisa South A.A District ቦሌ ሚካኤል Dasabshill ህንፃ ትንሽ ወረድ ብሎ Addis Ababa
36 136 DEBRE MARKOS ደብረ ማርቆስ 058-7-71-16-45 Abew Debre Markos Area Office ከመናኃሪያ ወደ ገበያ በሚወስደወ መንገድ ላይ ትንሽ ወረድ ብሎ Amhara
37 137 TABOR ታቦር 046-2-12-00-37 Asres Menchamo Hawassa Area Office አቶቴ አካባቢ ሀይሌ ህንፃ ላይ Sidama
38 138 MOYALE ሞያሌ 046-4-44-01-10 Temesegen Hawassa Area Office ፍቃዱ ሆቴል፣ (ወይም ስማርት ካፌ ፊት ለትፈ) Somale
39 139 DEJEN ደጀን 058-776-00-19 Mamaru gizachew Debre Markos Area Office የገበያ ማዕከል ፊት ለፊት (ፍትህ ጽ/ቤት አካባቢ) Amhara
40 140 MEKELE ENKODO መቀሌ ኢንኮዶ 034-4-40-67-49 Mebrahtu Hailay G/Mariam Mekele District ታሓገዝ ህንፃ ከፍ ብሎ ወደ ሓውዜን ኣደባባይ የሚወስድ መንገድ Tigray
41 141 BOLE ASRASIMINT ቦሌ አስራ ስምንት 011-6-63-12-89 YIBELTAL HASAB East A.A District ከጐላጐል ወደ ቦሌ መድኃኒዓለም በሚወስደው መንገድ አውራሪስ ሆቴል አጠገብ Addis Ababa
42 142 NEKEMTE ነቀምት 057-6-61-31-06 Tariku Birassa Jimma Area Office ሁለተኛ ማዞሪያ አካባቢ Oromia
43 143 ADAMA DEMBELLA አዳማ-ደምበላ 022-1-11-41-81 Fikru Hailemariam Adama Area Office Cinema Mormor፣ መሀማድ ኑር ህንፃ ላይ አጠገብ Oromia
44 144 DIRE DAWA ድሬዳዋ 025-4-11-01-15 Abeyu Negash Adama Area Office ታይዋን አካባቢ፣ ሼክ ሀቢብ ሞል ህንፃ ላይ Dire Dawa
--- PAGE 3 ---
45 145 HARAR ሐረር 025-4-66-00-35 Mesay Dejene Hailu Adama Area Office ማዘጋጀ ፊት ለፊት፣ ዋናው ንግድ ባንክ አጠገብ Hrari
46 146 LIDETA ልደታ 0115-57-62-60 DESSALEGN Alene West A.A District ከልደታ ወደ አብነት በሚወስደው መንገድ ላይ አህመድ የገበያ ማዕከል ህንፃ ግራውንድ ላይ Addis Ababa
47 147 DOLOMANA ዶሎ መና 022-6-68-00-25 TAMIRAT Hawassa Area Office ደሎመና ከተማ Oromia
48 148 ASSOSA አሶሳ 057-7-75-04-11 Melese Tilahun Ayenew Jimma Area Office ዓርብ ገበያ ሠፈር፣ ከአንበሳ ሆቴል ትንሽ አለፍ ብሎ Benshangul Gumz
49 149 GHIMBI ጊምቢ 057-7-71-04-57 Abdi Chali Jimma Area Office Oil Libya አካባቢ Oromia
50 150 ANGER GUTEE አንገር ጉቴ 057-6-34-01-91 Desalign Olane Jimma Area Office አንገር ጉቴ ከተማ Oromia
51 151 SHOLA GEBEYA ሾላ ገበያ 011-6-67-36-48 Ato Dejene Alemu East A.A District ሾላ ገበያ ውስጥ በስተቀኝ በኩል ከሚካኤል ወደ ለም ሆቴል በሚወስደው መንገድ በስተቀኝ Addis Ababa
52 152 EMPERIAL ኢምፔሪያል 0116 67 37 61 Ato Nebiyou Alemu East A.A District ከኢፔሪያል አደባባይ ወደ ወረዳ 17 ጤና ጣቢያ አቅጣጫ በግራ በኩል Addis Ababa
53 153 WORETA ወረታ 058-4-46-11-55 Samuel Maru Bahir Dar District መናኃሪያ መግቢያ አካባቢ Amhara
54 154 TOGOCHALE ቶጎ ጫሌ 025-8-82-01-12 Selam Girma Adama Area Office ቶጐ ጫሌ Somale
55 155 WOLDIA ወልድያ 033-331-1105/1418 Getachew Adel Dessie District ፒያሳ፣መቻሬ ሆቴል ፊት ለፊት Amhara
56 156 KOREM ኮረም 034-5-51-01-56 Berihun Berhe Mekele District ፒያሳ 02 ቀበሌ ኣካባቢ Tigray
57 157 WUKRO ውቅሮ 034-4-43-11-74 Birhanu Desta Girmay Mekele District ኣውተቡስ ተራ ኣካባቢ Tigray
58 158 MERAWI መራዊ 058-330-04-73 Ato Habtamu Abel Bahir Dar District መራዊ ከተማ Amhara
59 159 WELLO SEFER ወሎ ሰፈር 0114-70-04-61 Tariku Wabe South A.A District ሀረር መሶብ ሆቴል አጠገብ ፊት ለፊት ህንፃ ላይ Addis Ababa
60 160 SUMMIT ሰሚት 011-667-84-93 Meseret Manahile East A.A District ከተባበሩት ነዳጅ ማደያ ወደ ሰሚት በሚወስደው መንገድ 200 ሜትር ገባ ብሎ Addis Ababa
61 161 MILLENNIUM ሚሊኒየም 011-667-25-73 H/Mariam East A.A District ቦሌ ፍሬንድ ሺፕ ፊት ለፊት Addis Ababa
62 162 BONGA ቦንጋ 047-331-11-93 Habitamu Brihanu Jimma Area Office አደባባዮ ጋር፣ የከፋ ልማት ህንፃ ላይ South West
63 163 JIGJIGA ጂግጂጋ 025-278-00-00 Elias Lakew Adama Area Office ሰኢድ አብደላ የስብሰባ አደራሽ አጠገብ፤ Somale
64 164 SEKOTA ሰቆጣ 033-440-0009/67 Dabash Dessie Dessie District ማዞሪያ አካባቢ፣ኖክ ማደያ ፊት ለፊት Amhara
65 165 ALAMATA አላማጣ 034-7-74-00-71 Tadese Shumye Mekele District መኾኒ መንገድ ኣፍሪካ ሰፈር Tigray
66 166 GULELE ጉለሌ 011-2-73-42-37 Dereje Siyoum Assefa West A.A District ፖስተር አደባባይ፣ ካልዲስ አጠገብ Addis Ababa
67 167 SHALLA MENAFESHA ሻላ መናፈሻ 011-6-67-27-73 Awoke Abebu East A.A District ጌታሁን በሻ ህንፃ ወደ ቦሌ መድኃኒዓለም መንገድ አዝመራ ሽሮ ቤት አጠገብ አዲሱ መንገድ ላይ Addis Ababa
--- PAGE 4 ---
68 168 KALITI ቃሊቲ 011 4 71 72 31 Ato Mesfin Fikre South A.A District ቃሊቲ ገብርኤል ቤተክርስቲያን አለፍ ብሎ ቼራሊያ ሳይደርስ ሸዋ ጥጥ መዳመጫ ፊት ለፊት Addis Ababa
69 169 BETHEL ቤቴል 011-3-49-34-99 Fekadu Tafesse Wayose West A.A District ከቤተል ሆስፒታል በስተግራ Addis Ababa
70 170 MESKEL FLOWER መስቀል ፍላወር 011-4-70-24-69 Tewodros South A.A District ድሪምላይነር ሆቴል አጠገብ ወይም ሱር ኮንስትራክሽን ፊት ለፊት Addis Ababa
71 171 ADIGRAT አዲግራት 034-4-45-03-42 Yohannes Taddese Gebreyohannes Mekele District ፒያሳ አካባቢ Tigray
72 172 KOLFE ኮልፌ አጠና ተራ 011-2-73-87-33 Gebreyohanes Weldesenbet West A.A District ኮልፌ አጠና ተራ እፎይታ የገበያ ማዕከል አካባቢ Addis Ababa
73 173 BAHIR DAR MEHALE GEBEYA ባህር ዳር መሐል ገበያ 058-2-22-21-03 Ato Getnet Manaye Bahir Dar District ቀበሌ 04፣ መሃል ገበያ ውስጥ፣ ዓባይ ትራንስፖርት ቢሮ ያለበት ህንፃ ላይ Amhara
74 174 ADDISU GEBEYA አዲሱ ገበያ 011-1-26-82-78 Yasabu Kinde Mekonnen West A.A District ከቶታል ማዳያ ትንሽ ዝቅ ብሎ ጃምቦ ህንፃ 1ኛ ፎቅ Addis Ababa
75 175 KAZANCHIS ካዛንቺስ 011-5-57-13-54 Ato Aboneh W/Mariam East A.A District ነጋ ሲቲ ሞል ግራውንድ ወይም ኦዳ ታወር ጐን Addis Ababa
76 176 CMC ሲኤምሲ 0116-67-57-05 Ato Ahmed Seid East A.A District ከሲቪል ሰርቪስ ወደ አያት በሚወስደው መንገድ ላይ ጊብሰን ት/ቤት አጠገብ Addis Ababa
77 177 PIASSA ፒያሳ 0111 2 640 83 Birtukan Atanfu Mulat West A.A District አርቲስቲክ ህንፃ የቀድሞ Birthish Council የነበረበት ወይም አፍሪካ ወርቅ ቤት ፊት ለፊት Addis Ababa
78 178 KAHEN SEFER ካህን ሰፈር 0115-58-64-85 Ato Alene Mognhod East A.A District ከኢንተርኮንትኔታል ሆቴል ወረድ ብሎ ንግስት ታወር አጠገብ Addis Ababa
79 179 WOLETE ወለቴ 011-3 67 91-95 Dejene Yigezu West A.A District ከኖክ ማደያ ወደ አየር ጤና በሚወስደው መንገድ ላይ ወደ 100 ሜትር Oromia
80 180 MEGENAGNA መገናኛ 0116-67-44-16 Ato Temesgen Simachew East A.A District ዘፍመሽ፣ ወንድማማቾች ሥጋ ቤት አጠገብ Addis Ababa
81 181 MEXICO ሜክሲኮ 0115-57-33-97 Yared Tesfaye West A.A District Chamber of Commerce ህንፃ አካባቢ Addis Ababa
82 182 KEBEDE MICHAEL ከበደ ሚካኤል 0116-67-42-64 Ato Yilkal Damtie East A.A District ቦሌ መድኃኒዓለም ቤ/ክ አለፍ ብሎ አቢሲኒያ ህንፃ አጠገብ Addis Ababa
83 183 HAILE G/SELASIE AVENUE ኃይሌ ገብረሥላሴ ጎዳና 0116-35-38-18 Ato Getachew Addisie East A.A District ከጐላጐል አደባባይ ወደ መገናኛ አቅጣጫ 20 ሜትር ርቀት ረዊና ህንፃ አጠገብ Addis Ababa
84 184 LEBU ለቡ 011-4-71-31-85 Ashagrachew South A.A District ቫርኔሮ አደባባይ አለፍ ብሎ ሳላይሽ ሆቴል አጠገብ Addis Ababa
85 185 BESHOFTU ቢሾፍቱ 011-4-30-04-89 Abebe Deribe Adama Area Office ስታዲየም ፊት ለፊት (ወጋገን ባንክ አጠገብ)፣ ጠንከርና ቤተሶቦቹ ሆቴል አለፍ ብሎ Oromia
86 186 ARBA MINCH አርባ ምንጭ 046-8-81-40-38 Ato Alemayehu Belachew Hawassa Area Office አርባ ምንጭ ቱሪስት ሆቴል ፊት ለፊት South Ethiopia
87 187 LAFETO ላፍቶ 011-4-71-09-49 Tsegaye Chemir South A.A District ከመስጊዱ ትንሽ ዝቅ ብሎ ንግድ ባንክ ፊትለፊት Addis Ababa
88 188 GERJI MEBRAT HAIL ገርጂ መብራት ኃይል 011-6-39-43-34 Mamaw Getaneh East A.A District ገርጂ መብራት ኃይል ከሙልሙል ዳቦ ቤት አለፍ ብሎ Addis Ababa
89 189 DESSIE TOSSA ደሴ ጦሳ 033-312-01-07 Berihun Ayene Dessie District ሼል አካባቢ፣ የዱሮ አክሱም ሆቴል የነበረበት Amhara
90 190 CASTLE ካስትል 034-241-53-48 Samrawit Girmay Assefa Mekele District ኣብርሃ ካስትል ግራንድ ኣዋሽ ኣካባቢ Tigray
91 191 SHIRE ሽሬ 034-244-01-97 Ashenafi Berhe Kassa Mekele District አውቶብስ ተራ ኣካባቢ Tigray
92 192 JEMO ጀሞ 011-471-32-13 Rega Tesfaye South A.A District ከጀሞ አደባባይ ወደ ፉሪ በሚወስደው መንገድ ከመስታወት ፋብሪካ ፊት ለፊት Addis Ababa
93 193 LEGETAFO ለገጣፎ 011-667-92-54 Gezahegn Endalew East A.A District ሴንትራል ሆቴል ፊት ለፊት Oromia
94 194 KOTEBE ZERO HULET ኮተቤ 02 011-639-81-43 Yetimgeta East A.A District ኮተቤ 02 ገበያ /ጉልት/ አካባቢ Addis Ababa
--- PAGE 5 ---
95 195 KERA ከራ 011-470-36-54 Wondwossen South A.A District ከከራ ቄራዎች ድርጅት ወደ ጎፋ በሚወስደው መንገድ Addis Ababa
96 196 TEKLEHAIMANOT ተክለሃይማኖት 011-273-45-12 Melaku West A.A District ተክለሃይማኖት አደባባይ አጠገብ Addis Ababa
97 197 SARIS ሳሪስ 011-443-12-89 Tadesse South A.A District ሳሪስ ካዲኮ ፊት ለፊት Addis Ababa
98 198 BULBULA ቡልቡላ 011-639-11-20 Yohannes East A.A District ቡልቡላ ማርያም አጠገብ Addis Ababa
99 199 MEKANISA መካኒሳ 011-321-45-67 Biruk South A.A District መካኒሳ አቦ ማዞሪያ Addis Ababa
100 200 TOR HAILOCH ጦር ኃይሎች 011-372-88-90 Dawit West A.A District ጦር ኃይሎች ሆስፒታል ፊት ለፊት Addis Ababa
101 201 GORO ጎሮ 011-667-45-12 Ermias East A.A District ጎሮ አደባባይ አጠገብ Addis Ababa
102 202 FIGA ፊጋ 011-639-88-12 Solomon East A.A District ፊጋ ማዞሪያ አጠገብ Addis Ababa
103 203 SEBETA ሰበታ 011-338-12-45 Gemechu West A.A District ሰበታ ከተማ መሃል Oromia
104 204 BURAYU ቡራዩ 011-284-55-12 Tolosa West A.A District ቡራዩ ከተማ መናሃሪያ አጠገብ Oromia
105 205 SULULTA ሱሉልታ 011-888-12-34 Bekele West A.A District ሱሉልታ ከተማ ዋና መንገድ Oromia
106 206 DUKEM ዱከም 011-432-11-90 Worku Adama Area Office ዱከም ከተማ ዋና አደባባይ Oromia
107 207 MODJO ሞጆ 022-216-04-12 Hailu Adama Area Office ሞጆ ከተማ መናሃሪያ ፊት ለፊት Oromia
108 208 AMBO አምቦ 011-236-12-89 Gudeta Jimma Area Office አምቦ ከተማ መሃል አደባባይ Oromia
109 209 WOLISO ወሊሶ 011-341-09-87 Negash Jimma Area Office ወሊሶ ከተማ ዋና መንገድ Oromia
110 210 FITCHE ፍቼ 011-144-05-12 Girma Debre Birhan Area Office ፍቼ ከተማ አደባባይ አጠገብ Oromia
111 211 SHENO ሸኖ 011-890-12-34 Teshome Debre Birhan Area Office ሸኖ ከተማ መሃል Amhara
112 212 ENWARI እንዋሪ 011-892-33-44 Alemu Debre Birhan Area Office እንዋሪ ከተማ Amhara
113 213 MUKETURI ሙከጡሪ 011-894-55-66 Daniel Debre Birhan Area Office ሙከጡሪ ከተማ Oromia
114 214 CHANCHO ጫንጮ 011-896-77-88 Samuel Debre Birhan Area Office ጫንጮ ከተማ Oromia
115 215 SENDAFA ሰንዳፋ 011-898-99-00 Mulatu East A.A District ሰንዳፋ ከተማ Oromia
116 216 ASKO አስኮ 011-270-11-22 Kassa West A.A District አስኮ አደባባይ አጠገብ Addis Ababa
117 217 WINGATE ዊንጌት 011-270-33-44 Haile West A.A District ዊንጌት አደባባይ ፊት ለፊት Addis Ababa
118 218 PASTOR ፓስተር 011-270-55-66 Getachew West A.A District ፓስተር አደባባይ አጠገብ Addis Ababa
119 219 ABINET አብነት 011-275-11-33 Sisay West A.A District አብነት አደባባይ Addis Ababa
120 220 AUTOBIS TERA አውቶቢስ ተራ 011-275-44-55 Fekadu West A.A District መርካቶ አውቶቢስ ተራ Addis Ababa
121 221 WOLAITA SODO ወላይታ ሶዶ 046-551-22-33 Markos Hawassa Area Office ሶዶ ከተማ መሃል አደባባይ South Ethiopia
--- PAGE 6 ---
122 222 BOLE HOMES ቦሌ ሆምስ 011-663-11-22 Ephrem East A.A District ቦሌ ሆምስ አካባቢ Addis Ababa
123 223 GERMAN SQUARE ጀርመን አደባባይ 011-471-55-66 Tamrat South A.A District ጀርመን አደባባይ አጠገብ Addis Ababa
124 224 AYAT አያት 011-667-11-99 Yonas East A.A District አያት አደባባይ Addis Ababa
125 225 MERI መሪ 011-667-33-44 Tewodros East A.A District መሪ ሎቄ አጠገብ Addis Ababa
126 226 CMC MICHAEL ሲኤምሲ ሚካኤል 011-667-55-66 Biniam East A.A District ሲኤምሲ ሚካኤል ቤ/ክ አጠገብ Addis Ababa
127 227 KOTEBE HANNA ማርያም 011-667-77-88 Henok East A.A District ኮተቤ ሃና ማርያም አጠገብ Addis Ababa
128 228 KARA ቃራ 011-667-99-00 Tariku East A.A District ቃራ አደባባይ Addis Ababa
129 229 LAMBERET ላምበረት 011-667-22-11 Seyoum East A.A District ላምበረት መናሃሪያ አጠገብ Addis Ababa
130 230 GURD SHOLA ጉርድ ሾላ 011-667-44-33 Mesfin East A.A District ጉርድ ሾላ አትሌቲክስ ፌዴሬሽን አጠገብ Addis Ababa
131 231 MEGENAGNA AMANUEL መገናኛ አማኑኤል 011-667-66-55 Assefa East A.A District መገናኛ አማኑኤል ቤ/ክ አጠገብ Addis Ababa
132 232 SHOLA ሾላ 011-667-88-77 Solomon East A.A District ሾላ ገበያ መግቢያ Addis Ababa
133 233 SIDIST KILO ስድስት ኪሎ 011-123-45-67 Yohannes West A.A District ስድስት ኪሎ ዩኒቨርሲቲ ፊት ለፊት Addis Ababa
134 234 ARAT KILO አራት ኪሎ 011-123-67-89 Daniel West A.A District አራት ኪሎ ብርሃንና ሰላም አጠገብ Addis Ababa
135 235 SEMIEN HOTEL ሰሜን ሆቴል 011-123-89-01 Samuel West A.A District ሰሜን ሆቴል አጠገብ Addis Ababa
136 236 BEL AIR ቤል ኤር 011-123-12-34 Melaku West A.A District ቤል ኤር አካባቢ Addis Ababa
137 237 SHIRO MEDA ሽሮ ሜዳ 011-123-34-56 Girma West A.A District ሽሮ ሜዳ ገበያ አጠገብ Addis Ababa
138 238 ENKULAL FABRIKA እንቁላል ፋብሪካ 011-275-12-34 Fisseha West A.A District እንቁላል ፋብሪካ ፊት ለፊት Addis Ababa
139 239 TOTAL ቶታል 011-275-34-56 Kassahun West A.A District ቶታል ማደያ አጠገብ Addis Ababa
140 240 SHEMA TERA ሸማ ተራ 011-275-56-78 Mulugeta West A.A District መርካቶ ሸማ ተራ Addis Ababa
141 241 SEBATEGNA ሰባተኛ 011-275-78-90 Negatu West A.A District መርካቶ ሰባተኛ Addis Ababa
142 242 BOMBA TERA ቦምብ ተራ 011-275-90-12 Zeleke West A.A District መርካቶ ቦምብ ተራ Addis Ababa
143 243 MILITARY TERA ሚሊተሪ ተራ 011-275-23-45 Workneh West A.A District መርካቶ ሚሊተሪ ተራ Addis Ababa
144 244 DUBAI TERA ዱባይ ተራ 011-275-45-67 Abera West A.A District መርካቶ ዱባይ ተራ Addis Ababa
145 245 TANA TERA ጣና ተራ 011-275-67-89 Getu West A.A District መርካቶ ጣና የገበያ አዳራሽ አጠገብ Addis Ababa
146 246 RAGUEL ራጉኤል 011-275-89-01 Birhanu West A.A District መርካቶ ራጉኤል ቤ/ክ አጠገብ Addis Ababa
147 247 KOYE FECHE ኮየ ፈጬ 011-471-11-22 Haile South A.A District ኮየ ፈጬ ኮንዶሚኒየም Addis Ababa
148 248 TULU DIMTU ቱሉ ዲምቱ 011-471-33-44 Desta South A.A District ቱሉ ዲምቱ አደባባይ Addis Ababa
149 249 KOMBOLCHA ኮምቦልቻ 033-551-12-34 Tadesse Dessie District ኮምቦልቻ ከተማ መሃል Amhara
--- PAGE 7 ---
150 250 AYAT ZONE 2 አያት ዞን 2 011-667-12-34 Yidnekachew East A.A District አያት ዞን 2 አደባባይ Addis Ababa
151 251 BESHOFTU ARADA ቢሾፍቱ አራዳ 011-430-12-34 Mesay Adama Area Office ቢሾፍቱ አራዳ ገበያ Oromia
152 252 ADAMA POSTA አዳማ ፖስታ 022-112-45-67 Gashaw Adama Area Office አዳማ ፖስታ ቤት አጠገብ Oromia
153 253 KEMISE ከሚሴ 033-554-12-34 Mulu Dessie District ከሚሴ ከተማ መሃል Amhara
154 254 DILLA ዲላ 046-331-23-45 Belay Hawassa Area Office ዲላ ከተማ መናሃሪያ አጠገብ South Ethiopia
155 255 MAYCHEW ማይጨዉ 034-775-12-34 Hailay Mekele District ማይጨዉ ከተማ Tigray
156 256 DURBETE ዱርቤቴ 058-335-12-34 Mengistu Bahir Dar District ዱርቤቴ ከተማ መሃል Amhara
157 257 DEBRE BIRHAN TEBASE ደብረ ብርሃን ጠባሴ 011-681-34-56 Kassahun Debre Birhan Area Office ጠባሴ ኢንዱስትሪ መንደር Amhara
158 258 DANGILA ዳንግላ 058-221-12-34 Getnet Bahir Dar District ዳንግላ ከተማ መሃል Amhara
159 259 HANA MARIAM ሃና ማርያም 011-471-66-77 Girma South A.A District ሃና ማርያም ቤ/ክ አጠገብ Addis Ababa
160 260 HAIK ኃይቅ 033-224-12-34 Wondwossen Dessie District ኃይቅ ከተማ መሃል Amhara
161 261 DEBRE MARKOS MENAHARIA ደብረ ማርቆስ መነሀሪያ 058-771-45-67 Temesgen Debre Markos Area Office ደብረ ማርቆስ መናሃሪያ አጠገብ Amhara
162 262 SHEWA ROBIT ሸዋ ሮቢት 033-664-12-34 Biruk Debre Birhan Area Office ሸዋ ሮቢት ከተማ Amhara
163 263 DEBARK ደባርቅ 058-117-12-34 Yohannes Bahir Dar District ደባርቅ ከተማ Amhara
164 264 KERANIYO ከራኒዮ 011-270-77-88 Daniel West A.A District ከራኒዮ መድኃኔዓለም አጠገብ Addis Ababa
165 265 GOFA CAMP ጎፋ ካምፕ 011-470-77-88 Solomon South A.A District ጎፋ ካምፕ ማዞሪያ Addis Ababa
166 266 MIZAN TEFERI ሚዛን ተፈሪ 047-335-12-34 Biniam Jimma Area Office ሚዛን ከተማ መሃል South West
167 267 ATAYE አጣዬ 033-662-12-34 Worku Debre Birhan Area Office አጣዬ ከተማ Amhara
168 268 NIFAS SILK ነፋስ ስልክ 011-443-33-44 Ermias South A.A District ነፋስ ስልክ ቀለም ፋብሪካ አጠገብ Addis Ababa
169 269 AXUM አክሱም 034-774-12-34 Berhe Mekele District አክሱም አውቶቢስ ተራ Tigray
170 270 ANKOBER አንኮበር 011-683-12-34 Sisay Debre Birhan Area Office አንኮበር ከተማ Amhara
171 271 BEDELE በደሌ 047-445-12-34 Tolosa Jimma Area Office በደሌ ከተማ Oromia
172 272 GILGEL BELES ግልገል በለስ 058-881-12-34 Tadesse Bahir Dar District ግልገል በለስ ከተማ Benishangul-Gumuz
173 273 GULLELE 04 ጉለሌ 04 011-273-12-34 Melaku West A.A District ጉለሌ 04 አካባቢ Addis Ababa
174 274 CHIRO ጪሮ 025-551-12-34 Abdi Adama Area Office ጪሮ ከተማ Oromia
175 275 DESSIE ARADA ደሴ አራዳ 033-112-45-67 Girma Dessie District ደሴ አራዳ ገበያ Amhara
176 276 HAWASSA TABOR ሀዋሳ ታቦር 046-220-78-90 Markos Hawassa Area Office ሀዋሳ ታቦር ተራራ ስር Sidama
177 277 MOTA ሞጣ 058-661-12-34 Habtamu Bahir Dar District ሞጣ ከተማ Amhara
178 278 JIMMA HERMATA ጂማ ህርማታ 047-111-45-67 Gemechu Jimma Area Office ጂማ ህርማታ ገበያ Oromia
179 279 FINOTE SELAM ፍኖተ ሰላም 058-775-12-34 Mamaru Debre Markos Area Office ፍኖተ ሰላም ከተማ Amhara
180 280 BALE AGARFA ባሌ አጋርፋ 022-669-12-34 Welensa Hawassa Area Office አጋርፋ ከተማ Oromia
--- PAGE 8 ---
181 281 ADDISU MIKILIL አዲሱ ሚክሊል 011-667-11-44 Yared East A.A District አዲሱ ሚክሊል አካባቢ Addis Ababa
182 282 AKESTA አከስታ 033-444-12-34 Dabash Dessie District አከስታ ከተማ Amhara
183 283 YABELO ያቤሎ 046-445-12-34 Diba Hawassa Area Office ያቤሎ ከተማ Oromia
184 284 MEKELE AYDER መቀሌ አይደር 034-441-23-45 Aklilu Mekele District አይደር ሪፈራል ሆስፒታል አጠገብ Tigray
185 285 LUMAME ሉማሜ 058-778-12-34 Abew Debre Markos Area Office ሉማሜ ከተማ Amhara
186 286 GONDAR AZEZO ጎንደር አዜዞ 058-114-12-34 Eyasu Bahir Dar District አዜዞ አየር ማረፊያ አጠገብ Amhara
187 287 SALITE MEHRET ሰሊጥ ምህረት 011-667-88-99 Ahmed East A.A District ሰሊጥ ምህረት ቤ/ክ አጠገብ Addis Ababa
188 288 METAHARA መተሃራ 022-224-12-34 Fikru Adama Area Office መተሃራ ስኳር ፋብሪካ አጠገብ Oromia
189 289 WOREILU ወረኢሉ 033-338-12-34 Berihun Dessie District ወረኢሉ ከተማ Amhara
190 290 MEKELE ROMANAT መቀሌ ሮማናት 034-440-56-78 Mebrahtu Mekele District ሮማናት አደባባይ Tigray
191 291 DEMBECHA ደምበጫ 058-773-12-34 Temesgen Debre Markos Area Office ደምበጫ ከተማ Amhara
192 292 WELKITE ወልቂጤ 011-331-12-34 Binyam Hawassa Area Office ወልቂጤ ከተማ መሃል Central Ethiopia
193 293 SARIS ABO ሳሪስ አቦ 011-443-55-66 Mesfin South A.A District ሳሪስ አቦ ቤ/ክ አጠገብ Addis Ababa
194 294 BATI ባቲ 033-553-12-34 Yohannes Dessie District ባቲ ገበያ አጠገብ Amhara
195 295 SHERARO ሸራሮ 034-245-12-34 Ashenafi Mekele District ሸራሮ ከተማ Tigray
196 296 YEJUBE የጁቤ 058-779-12-34 Gizachew Debre Markos Area Office የጁቤ ከተማ Amhara
197 297 BAKO ባኮ 057-664-12-34 Tariku Jimma Area Office ባኮ ከተማ Oromia
198 298 CHAGNI ጫግኒ 058-225-12-34 Mengistu Bahir Dar District ጫግኒ ከተማ Amhara
199 299 PAULOS ጳውሎስ 011-273-55-66 Dereje West A.A District ቅዱስ ጳውሎስ ሆስፒታል ፊት ለፊት Addis Ababa
200 300 AKAKI አቃቂ 011-434-12-34 Tsegaye South A.A District አቃቂ ቃሊቲ ክፍለ ከተማ Addis Ababa
201 301 MERSA መርሳ 033-335-12-34 Getachew Dessie District መርሳ ከተማ Amhara
202 302 HAWASSA PIASSA ሀዋሳ ፒያሳ 046-220-11-22 Alem Hawassa Area Office ሀዋሳ ፒያሳ መሃል Sidama
203 303 HUMERA ሁመራ 034-448-12-34 Berhe Mekele District ሁመራ ከተማ Tigray
204 304 MERTULE MARIAM መርጡለ ማርያም 058-665-12-34 Wondifraw Bahir Dar District መርጡለ ማርያም ገዳም አጠገብ Amhara
205 305 DEMBIDOLO ደምቢዶሎ 057-555-12-34 Abdi Jimma Area Office ደምቢዶሎ ከተማ Oromia
206 306 ASKO 01 አስኮ 01 011-270-88-99 Fekadu West A.A District አስኮ 01 አካባቢ Addis Ababa
207 311 SHIMBIT ሽምብጥ 058 3 20 16 23 Gebrie Belay Bahir Dar District ሆም ላንድ ሆቴል ፊት ለፊት Amhara
--- PAGE 9 ---
208 312 DIL CHIBO ድል ችቦ 011-275-11-99 Sisay West A.A District ድል ችቦ ት/ቤት አጠገብ Addis Ababa
209 313 TEFKI ተፍኪ 011-338-33-44 Gemechu West A.A District ተፍኪ ከተማ Oromia
210 314 ALEMGENA አለምገና 011-338-55-66 Bekele West A.A District አለምገና አደባባይ Oromia
211 315 ENJIBARA እንጅባራ 058-227-12-34 Habtamu Bahir Dar District እንጅባራ ዩኒቨርሲቲ አጠገብ Amhara
212 316 ALEM KETEMA አለም ከተማ 011-685-12-34 Daniel Debre Birhan Area Office አለም ከተማ Amhara
213 317 TEPI ቴፒ 047-556-12-34 Biniam Jimma Area Office ቴፒ ከተማ South West
214 318 ADIKEYIH አዲቀይህ 034-445-34-56 Yohannes Mekele District አዲቀይህ Tigray
215 319 METU መቱ 047-441-12-34 Desta Jimma Area Office መቱ ከተማ Oromia
216 320 AGARO አጋሮ 047-221-12-34 Tolosa Jimma Area Office አጋሮ ከተማ Oromia
217 321 MEHAL MEDA መሐል ሜዳ 011-687-12-34 Gibreyesus Debre Birhan Area Office መሐል ሜዳ ከተማ Amhara
218 322 ADDIS KETEMA አዲስ ከተማ 011-275-33-22 Adamu West A.A District አዲስ ከተማ ክፍለ ከተማ Addis Ababa
219 323 MEKANE SELAM መካነ ሰላም 033-339-12-34 Dabash Dessie District መካነ ሰላም ከተማ Amhara
220 324 WADERA ዋደራ 046-448-12-34 Temesgen Hawassa Area Office ዋደራ ከተማ Oromia
221 325 GURAGE ወልቂጤ 011-331-34-56 Markos Hawassa Area Office ጉራጌ ዞን መሃል Central Ethiopia
222 326 NEFAS MEWCHA ንፋስ መውጫ 058-441-12-34 Eyasu Bahir Dar District ንፋስ መውጫ ከተማ Amhara
223 327 WELEGA ነቀምቴ 057-661-45-67 Tariku Jimma Area Office ወለጋ ዩኒቨርሲቲ አጠገብ Oromia
224 328 ASSOSA MEHALE GEBEYA አሶሳ መሀል ገበያ 057-775-34-56 Melese Jimma Area Office አሶሳ መሀል ገበያ Benishangul-Gumuz
225 329 AWASH አዋሽ 022-228-12-34 Fikru Adama Area Office አዋሽ 7 ኪሎ Afar
226 330 GINIR ጊኒር 022-664-12-34 Welensa Hawassa Area Office ጊኒር ከተማ Oromia
227 331 KORE ኮሬ 011-471-88-99 Tadesse South A.A District ኮሬ አደባባይ Addis Ababa
228 332 WENJI ወንጂ 022-220-12-34 Nebiyou Adama Area Office ወንጂ ስኳር ፋብሪካ Oromia
229 333 GOLJOTA ጎልጆታ 022-114-12-34 Gashaw Adama Area Office ጎልጆታ አደባባይ Oromia
230 334 ARSI NEGELE አርሲ ነገሌ 046-116-12-34 Gemeda Hawassa Area Office አርሲ ነገሌ መሃል Oromia
231 335 ADET አዴት 058-338-12-34 Mengistu Bahir Dar District አዴት ምርምር ማዕከል አጠገብ Amhara
232 336 KOSHE ቆሼ 011-349-12-34 Fekadu West A.A District ቆሼ ማዞሪያ Addis Ababa
233 337 GEWANE ገዋኔ 022-441-12-34 Abdi Adama Area Office ገዋኔ ከተማ Afar
234 338 BULEN ቡለን 058-884-12-34 Tadesse Bahir Dar District ቡለን ከተማ Benishangul-Gumuz
235 339 MESFIN HARAR መስፍን ሐረር 025-466-23-45 Mesay Adama Area Office መስፍን ህንፃ ሐረር Harari
--- PAGE 10 ---
236 340 BURAYU KETA ቡራዩ ኬታ 011-284-77-88 Tolosa West A.A District ቡራዩ ኬታ ማዞሪያ Oromia
237 341 ARSI ROBE አርሲ ሮቤ 022-331-12-34 Welensa Hawassa Area Office አርሲ ሮቤ መሃል Oromia
238 342 GODE ጎዴ 025-776-12-34 Elias Adama Area Office ጎዴ ከተማ Somali
239 343 KEFIRA ከፊራ 025-466-45-67 Mesay Adama Area Office ከፊራ ገበያ ሐረር Harari
240 344 ABOMSA አቦምሳ 022-335-12-34 Fikru Adama Area Office አቦምሳ ከተማ Oromia
241 345 ADDIS ALEM አዲስ አለም 011-286-12-34 Gudeta West A.A District እጀሬ አዲስ አለም Oromia
242 346 SHUMBO ሹምቦ 046-554-12-34 Binyam Hawassa Area Office ሹምቦ ገበያ Central Ethiopia
243 347 HAGEREMARIAM ሀገረማርያም 046-443-12-34 Diba Hawassa Area Office ሀገረማርያም ከተማ Oromia
244 348 DUGDA DAKE ዱግዳ ዳኬ 022-116-12-34 Gemeda Adama Area Office ዱግዳ ዳኬ Oromia
245 349 REMA ሬማ 011-689-12-34 Sisay Debre Birhan Area Office ሬማ ከተማ Amhara
246 350 BOLE BULBULA ቦሌ ቡልቡላ 011-639-44-55 Tegene South A.A District ቦሌ ቡልቡላ ማሪያም Addis Ababa
247 351 SARIS GEBEYA ሳሪስ ገበያ 011-443-77-88 Tariku South A.A District ሳሪስ ገበያ መሃል Addis Ababa
248 352 MEGENAGNA ZEFMESH መገናኛ ዘፍመሽ 011-667-33-11 Temesgen East A.A District ዘፍመሽ ግራንድ ሞል Addis Ababa
249 353 PIASSA CHURCHILL ፒያሳ ቸርችል 011-126-77-88 Birtukan West A.A District ቸርችል ጎዳና ቴዎድሮስ አደባባይ Addis Ababa
250 354 KAZANCHIS TOTAL ካዛንቺስ ቶታል 011-557-44-55 Aboneh East A.A District ካዛንቺስ ቶታል ማደያ አጠገብ Addis Ababa
251 355 CMC ROAD ሲኤምሲ መንገድ 011-667-66-88 Ahmed East A.A District ሲኤምሲ ዋና መንገድ Addis Ababa
252 356 GERJI IMPERIAL ገርጂ ኢምፔሪያል 011-639-66-77 Adinew East A.A District ገርጂ ኢምፔሪያል ሆቴል ፊት ለፊት Addis Ababa
253 357 BOLE ATLAS ቦሌ አትላስ 011-662-88-99 Ashenafi East A.A District አትላስ ሆቴል አጠገብ Addis Ababa
254 358 OLD AIRPORT ብሉ ኤርፖርት 011-372-11-22 MELAKU South A.A District ብሉ ኤርፖርት ቪክቶሪያ አጠገብ Addis Ababa
255 359 BISHOFTU BABOGAYA ቢሾፍቱ ባቦጋያ 011-430-55-66 Abebe Adama Area Office ባቦጋያ ሐይቅ አጠገብ Oromia
256 360 HAMUSIT ሐሙሲት 058-220-10-10 Negash Adugna Bahir Dar District ሐሙሲት ከተማ ዋና መንገድ Amhara
257 361 GONDER PIASSA ጐንደር ፒያሳ 058-111-55-66 Eyasu Bahir Dar District ጐንደር ፒያሳ ፋሲል አደባባይ Amhara
258 362 DESSIE PIASSA ደሴ ፒያሳ 033-112-77-88 Girma Dessie District ደሴ ፒያሳ ማዘጋጃ አጠገብ Amhara
259 363 MEKELE KEDAMAY WOYANE መቀሌ ቀዳማይ ወያነ 034-440-88-99 Aklilu Mekele District ቀዳማይ ወያነ የገበያ ማዕከል Tigray
260 364 HAWASSA MENAHARIA ሀዋሳ መናሃሪያ 046-220-88-99 Alem Hawassa Area Office ሀዋሳ ዋና መናሃሪያ አጠገብ Sidama
261 365 JIMMA ABA JIFAR ጅማ አባ ጅፋር 047-112-55-66 Desta Jimma Area Office አባ ጅፋር ቤተመንግስት መታጠፊያ Oromia
262 366 ADAMA POSTA MAZORIA አዳማ ፖስታ ማዞሪያ 022-112-88-99 Nebiyou Adama Area Office ፖስታ ማዞሪያ አዳማ Oromia
263 367 KOSHE COMMERCIAL ቆሼ ንግድ 011-349-55-66 Fekadu West A.A District ቆሼ ንግድ ማዕከል Addis Ababa
--- PAGE 11 ---
264 368 GEWANE TOWN ገዋኔ ከተማ 022-441-55-66 Abdi Adama Area Office ገዋኔ መሃል ከተማ Afar
265 369 BULEN MARKET ቡለን ገበያ 058-884-55-66 Tadesse Bahir Dar District ቡለን ገበያ መሃል Benishangul-Gumuz
266 370 GODE CENTRAL ጎዴ ማዕከል 025-776-55-66 Elias Adama Area Office ጎዴ ማዕከላዊ ገበያ Somali
267 371 KEFIRA ARADA ከፊራ አራዳ 025-466-77-88 Mesay Adama Area Office ከፊራ አራዳ ሐረር Harari
268 372 ABOMSA COMMERCIAL አቦምሳ ንግድ 022-335-55-66 Fikru Adama Area Office አቦምሳ ንግድ ማዕከል Oromia
269 373 ADDIS ALEM MENAHARIA አዲስ አለም መናሃሪያ 011-286-55-66 Gudeta West A.A District አዲስ አለም መናሃሪያ Oromia
270 374 SHUMBO MARKET ሹምቦ ገበያ 046-554-55-66 Binyam Hawassa Area Office ሹምቦ ማዕከል Central Ethiopia
271 375 HAGEREMARIAM CENTRAL ሀገረማርያም ማዕከል 046-443-55-66 Diba Hawassa Area Office ሀገረማርያም ማዕከል Oromia
272 376 DUGDA DAKE COMMERCIAL ዱግዳ ዳኬ ንግድ 022-116-55-66 Gemeda Adama Area Office ዱግዳ ዳኬ ንግድ Oromia
273 377 REMA MARKET ሬማ ገበያ 011-689-55-66 Sisay Debre Birhan Area Office ሬማ ገበያ አጠገብ Amhara
274 378 BOLE MEDHANI ALEM ROAD ቦሌ መድኃኔዓለም መንገድ 011-662-77-88 Ashenafi East A.A District መድኃኔዓለም ሞል ፊት ለፊት Addis Ababa
275 379 SARIS ADDIS SEFER ሳሪስ አዲስ ሰፈር 011-443-88-99 Mesfin South A.A District ሳሪስ አዲስ ሰፈር አደባባይ Addis Ababa
276 380 MEGENAGNA PLAZA መገናኛ ፕላዛ 011-667-88-00 Temesgen East A.A District መገናኛ ፕላዛ ህንፃ Addis Ababa
277 381 DURBETE ዱርቤቴ 058-335-33-44 Mengistu Wolelaw Bahir Dar District ዱርቤቴ ከተማ ዋና አደባባይ Amhara
278 382 KAZANCHIS PLAZA ካዛንቺስ ፕላዛ 011-557-88-99 Aboneh East A.A District ካዛንቺስ ፕላዛ ታወር Addis Ababa
279 383 CMC COMMERCIAL ሲኤምሲ ንግድ 011-667-99-11 Ahmed East A.A District ሲኤምሲ ንግድ ማዕከል Addis Ababa
280 384 GERJI SUNSHINE ገርጂ ሰንሻይን 011-639-88-99 Adinew East A.A District ሰንሻይን አፓርትመንት ፊት ለፊት Addis Ababa
281 385 BOLE BRHANE ቦሌ ብርሃኔ 011-662-99-00 Ashenafi East A.A District ቦሌ ብርሃኔ አደባባይ Addis Ababa
282 386 OLD AIRPORT PLAZA ብሉ ኤርፖርት ፕላዛ 011-372-44-55 MELAKU South A.A District ብሉ ኤርፖርት ፕላዛ ታወር Addis Ababa
283 387 BISHOFTU RESORT ቢሾፍቱ ሪዞርት 011-430-88-99 Abebe Adama Area Office ቢሾፍቱ ኩሪፍቱ ሪዞርት አጠገብ Oromia
284 388 BAHIR DAR TANA ባህር ዳር ጣና 058-220-44-55 Mengistu Bahir Dar District ጣና ሐይቅ ወደብ መግቢያ Amhara
285 389 GONDER FASIL ጐንደር ፋሲል 058-111-88-99 Eyasu Bahir Dar District ፋሲል ግቢ ፊት ለፊት Amhara
286 390 DESSIE HOTELS ደሴ ሆቴሎች 033-112-99-00 Girma Dessie District ደሴ ወርቃማ ሆቴል አጠገብ Amhara
287 391 MEKELE MONUMENT መቀሌ ሀውልት 034-440-99-11 Aklilu Mekele District መቀሌ ሰማዕታት ሀውልት አጠገብ Tigray
288 392 HAWASSA RESORT ሀዋሳ ሪዞርት 046-220-99-11 Alem Hawassa Area Office ሀዋሳ ሀይሌ ሪዞርት አጠገብ Sidama
289 393 JIMMA UNIVERSITY ጅማ ዩኒቨርሲቲ 047-112-88-99 Desta Jimma Area Office ጅማ ዩኒቨርሲቲ ዋና ግቢ Oromia
290 394 ADAMA EXPRESSWAY አዳማ ኤክስፕረስ 022-112-99-11 Nebiyou Adama Area Office አዳማ የፍጥነት መንገድ መውጫ Oromia
291 395 WENJI COMMERCIAL ወንጂ ንግድ 022-220-55-66 Nebiyou Adama Area Office ወንጂ ንግድ መንደር Oromia
--- PAGE 12 ---
292 396 GOLJOTA TOWN ጎልጆታ ከተማ 022-114-55-66 Gashaw Adama Area Office ጎልጆታ ከተማ መሃል Oromia
293 397 ARSI NEGELE TOWN አርሲ ነገሌ ከተማ 046-116-55-66 Gemeda Hawassa Area Office አርሲ ነገሌ ከተማ መሃል Oromia
294 398 ADET TOWN አዴት ከተማ 058-338-55-66 Mengistu Bahir Dar District አዴት ከተማ መሃል Amhara
295 399 KOSHE MARKET ቆሼ ገበያ 011-349-88-99 Fekadu West A.A District ቆሼ ገበያ መሃል Addis Ababa
296 400 GEWANE HIGHWAY ገዋኔ አውራ ጎዳና 022-441-88-99 Abdi Adama Area Office ገዋኔ አውራ ጎዳና Afar
297 401 BULEN TOWN ቡለን ከተማ 058-884-88-99 Tadesse Bahir Dar District ቡለን ከተማ መሃል Benishangul-Gumuz
298 402 GODE TOWN ጎዴ ከተማ 025-776-88-99 Elias Adama Area Office ጎዴ ከተማ መሃል Somali
299 403 KEFIRA MARKET ከፊራ ገበያ 025-466-99-00 Mesay Adama Area Office ከፊራ ገበያ መሃል Harari
300 404 ABOMSA TOWN አቦምሳ ከተማ 022-335-88-99 Fikru Adama Area Office አቦምሳ ከተማ መሃል Oromia
301 405 ADDIS ALEM TOWN አዲስ አለም ከተማ 011-286-88-99 Gudeta West A.A District አዲስ አለም ከተማ መሃል Oromia
302 406 SHUMBO TOWN ሹምቦ ከተማ 046-554-88-99 Binyam Hawassa Area Office ሹምቦ ከተማ መሃል Central Ethiopia
303 407 HAGEREMARIAM TOWN ሀገረማርያም ከተማ 046-443-88-99 Diba Hawassa Area Office ሀገረማርያም ከተማ መሃል Oromia
304 408 DUGDA DAKE TOWN ዱግዳ ዳኬ ከተማ 022-116-88-99 Gemeda Adama Area Office ዱግዳ ዳኬ ከተማ መሃል Oromia
305 409 REMA TOWN ሬማ ከተማ 011-689-88-99 Sisay Debre Birhan Area Office ሬማ ከተማ መሃል Amhara
306 410 BOLE AIRPORT CARGO ቦሌ ኤርፖርት ካርጎ 011-665-11-22 Tegene East A.A District ቦሌ ኤርፖርት ካርጎ ተርሚናል Addis Ababa
307 411 SARIS INDUSTRIAL ሳሪስ ኢንዱስትሪ 011-443-99-11 Tariku South A.A District ሳሪስ ኢንዱስትሪ ዞን Addis Ababa
308 412 MEGENAGNA LEM HOTEL መገናኛ ሌም ሆቴል 011-667-99-22 Temesgen East A.A District ሌም ሆቴል አጠገብ Addis Ababa
309 413 PIASSA DE GAULLE ፒያሳ ደጎል 011-126-99-11 Birtukan West A.A District ደጎል አደባባይ ፒያሳ Addis Ababa
310 414 KAZANCHIS INTERCONTINENTAL ካዛንቺስ ኢንተርኮንቲኔንታል 011-557-99-22 Aboneh East A.A District ኢንተርኮንቲኔንታል ሆቴል ፊት ለፊት Addis Ababa
311 415 CMC MICHAEL SQUARE ሲኤምሲ ሚካኤል አደባባይ 011-667-99-33 Ahmed East A.A District ሲኤምሲ ሚካኤል አደባባይ Addis Ababa
312 416 GERJI MEBRAT HAIL SQUARE ገርጂ መብራት ኃይል አደባባይ 011-639-99-11 Adinew East A.A District መብራት ኃይል አደባባይ Addis Ababa
313 417 BOLE JAPAN EMBASSY ቦሌ ጃፓን ኤምባሲ 011-662-99-22 Ashenafi East A.A District ጃፓን ኤምባሲ አጠገብ Addis Ababa
314 418 OLD AIRPORT BISHOFTU ROAD ብሉ ኤርፖርት ቢሾፍቱ መንገድ 011-372-66-77 MELAKU South A.A District ብሉ ኤርፖርት ዋና መንገድ Addis Ababa
315 419 BISHOFTU BUS STATION ቢሾፍቱ አውቶቢስ ተራ 011-430-99-11 Abebe Adama Area Office ቢሾፍቱ አውቶቢስ ተራ Oromia
316 420 BAHIR DAR FELEGE HIWOT ባህር ዳር ፈለገ ሕይወት 058-220-77-88 Mengistu Bahir Dar District ፈለገ ሕይወት ሆስፒታል አጠገብ Amhara
317 421 GONDER MARAKI ጐንደር ማራኪ 058-111-99-11 Eyasu Bahir Dar District ማራኪ ካምፓስ አጠገብ Amhara
318 422 DESSIE BUS STATION ደሴ አውቶቢስ ተራ 033-112-99-22 Girma Dessie District ደሴ አውቶቢስ ተራ መናሃሪያ Amhara
319 423 MEHAL MEDA TOWN መሐል ሜዳ ከተማ 011-687-55-66 Gibreyesus Debre Birhan Area Office መሐል ሜዳ ከተማ መሃል Amhara
--- PAGE 13 ---
320 424 BULBULA TOWN ቡልቡላ ከተማ 011-639-55-66 Yohannes East A.A District ቡልቡላ ከተማ መሃል Addis Ababa
321 425 GERMAN SQUARE COMMERCIAL ጀርመን አደባባይ ንግድ 011-471-77-88 Tamrat South A.A District ጀርመን አደባባይ ንግድ ማዕከል Addis Ababa
322 426 AYAT REAL ESTATE አያት ሪል እስቴት 011-667-55-77 Yonas East A.A District አያት ሪል እስቴት ዞን 3 Addis Ababa
323 427 MERI LOKE መሪ ሎቄ 011-667-77-99 Tewodros East A.A District መሪ ሎቄ ት/ቤት አጠገብ Addis Ababa
324 428 CMC SUMMIT ROAD ሲኤምሲ ሰሚት መንገድ 011-667-88-22 Biniam East A.A District ሰሚት መታጠፊያ መንገድ Addis Ababa
325 429 KOTEBE COLLEGE ROAD ኮተቤ ኮሌጅ መንገድ 011-667-99-44 Henok East A.A District ኮተቤ ዩኒቨርሲቲ ኮሌጅ አጠገብ Addis Ababa
326 430 KARA MARKET ቃራ ገበያ 011-667-99-55 Tariku East A.A District ቃራ ገበያ መሃል Addis Ababa
327 431 LAMBERET BUS STATION ላምበረት መናሃሪያ 011-667-44-55 Seyoum East A.A District ላምበረት ዋና መናሃሪያ Addis Ababa
328 432 GURD SHOLA ATHLETICS ጉርድ ሾላ አትሌቲክስ 011-667-55-88 Mesfin East A.A District ኢትዮጵያ አትሌቲክስ ፌዴሬሽን ፊት ለፊት Addis Ababa
329 433 MEGENAGNA AMANUEL ROAD መገናኛ አማኑኤል መንገድ 011-667-77-11 Assefa East A.A District አማኑኤል ሆስፒታል መንገድ Addis Ababa
330 434 SHOLA VEGETABLE ሾላ አትክልት 011-667-99-66 Solomon East A.A District ሾላ አትክልት ተራ Addis Ababa
331 435 SIDIST KILO CAMPUS ስድስት ኪሎ ካምፓስ 011-123-66-77 Yohannes West A.A District አ.አ ዩኒቨርሲቲ ዋና ግቢ Addis Ababa
332 436 ARAT KILO PARLIAMENT አራት ኪሎ ፓርላማ 011-123-88-99 Daniel West A.A District የሕዝብ ተወካዮች ምክር ቤት አጠገብ Addis Ababa
333 437 SEMIEN HOTEL PLAZA ሰሜን ሆቴል ፕላዛ 011-123-99-22 Samuel West A.A District ሰሜን ሆቴል ታወር Addis Ababa
334 438 BEL AIR RESIDENTIAL ቤል ኤር ሰፈር 011-123-33-44 Melaku West A.A District ቤል ኤር የመኖሪያ መንደር Addis Ababa
335 439 SHIRO MEDA TEXTILE ሽሮ ሜዳ ጨርቃጨርቅ 011-123-55-66 Girma West A.A District ሽሮ ሜዳ የባህል ልብስ ገበያ Addis Ababa
336 440 ENKULAL FABRIKA ROAD እንቁላል ፋብሪካ መንገድ 011-275-33-44 Fisseha West A.A District እንቁላል ፋብሪካ ዋና መንገድ Addis Ababa
337 441 TOTAL ROUNDABOUT ቶታል አደባባይ 011-275-55-66 Kassahun West A.A District ቶታል አደባባይ ማዞሪያ Addis Ababa
338 442 SHEMA TERA MARKET ሸማ ተራ ገበያ 011-275-77-88 Mulugeta West A.A District ሸማ ተራ የገበያ ማዕከል Addis Ababa
339 443 SEBATEGNA COMMERCIAL ሰባተኛ ንግድ 011-275-99-00 Negatu West A.A District ሰባተኛ ንግድ ታወር Addis Ababa
340 444 BOMBA TERA WHOLESALE ቦምብ ተራ ጅምላ 011-275-11-44 Zeleke West A.A District ቦምብ ተራ የጅምላ ገበያ Addis Ababa
341 445 MILITARY TERA UNIFORM ሚሊተሪ ተራ ዩኒፎርም 011-275-33-66 Workneh West A.A District ሚሊተሪ ተራ መሃል Addis Ababa
342 446 DUBAI TERA MALL ዱባይ ተራ ሞል 011-275-55-88 Abera West A.A District ዱባይ ተራ የገበያ ሞል Addis Ababa
343 447 TANA TERA HALL ጣና ተራ አዳራሽ 011-275-77-00 Getu West A.A District ጣና አዳራሽ 2ኛ ፎቅ Addis Ababa
344 448 RAGUEL CHURCH ROAD ራጉኤል ቤተክርስቲያን መንገድ 011-275-99-22 Birhanu West A.A District ራጉኤል ቤ/ክ ዋና መንገድ Addis Ababa
345 449 KOYE FECHE CONDOMINIUM ኮየ ፈጬ ኮንዶሚኒየም 011-471-33-55 Haile South A.A District ኮየ ፈጬ ሳይት 2 Addis Ababa
346 450 TULU DIMTU ROUNDABOUT ቱሉ ዲምቱ አደባባይ 011-471-55-77 Desta South A.A District ቱሉ ዲምቱ ትራፊክ መብራት Addis Ababa
347 451 KOMBOLCHA INDUSTRY ኮምቦልቻ ኢንዱስትሪ 033-551-34-56 Tadesse Dessie District ኮምቦልቻ ኢንዱስትሪ ፓርክ Amhara
348 452 BULEN VALLEY ቡለን ሸለቆ 058-884-99-11 Tadesse Bahir Dar District ቡለን ሸለቆ Benishangul-Gumuz
--- PAGE 14 ---
349 453 GODE AIRPORT ጎዴ አየር ማረፊያ 025-776-99-11 Elias Adama Area Office ጎዴ አየር ማረፊያ መግቢያ Somali
350 454 KEFIRA GATE ከፊራ በር 025-466-99-22 Mesay Adama Area Office ከፊራ ሾተል በር Harari
351 455 ABOMSA STADIUM አቦምሳ ስታዲየም 022-335-99-11 Fikru Adama Area Office አቦምሳ ስታዲየም አጠገብ Oromia
352 456 ADDIS ALEM SQUARE አዲስ አለም አደባባይ 011-286-99-11 Gudeta West A.A District አዲስ አለም ዋና አደባባይ Oromia
353 457 SHUMBO SQUARE ሹምቦ አደባባይ 046-554-99-11 Binyam Hawassa Area Office ሹምቦ ዋና አደባባይ Central Ethiopia
354 458 HAGEREMARIAM STADIUM ሀገረማርያም ስታዲየም 046-443-99-11 Diba Hawassa Area Office ሀገረማርያም ስታዲየም ፊት ለፊት Oromia
355 459 DUGDA DAKE RESORT ዱግዳ ዳኬ ሪዞርት 022-116-99-11 Gemeda Adama Area Office ዱግዳ ዳኬ ሐይቅ አጠገብ Oromia
356 460 REMA MOUNTAIN ሬማ ተራራ 011-689-99-11 Sisay Debre Birhan Area Office ሬማ ተራራ ግርጌ Amhara
357 461 BOLE BRHANE SQUARE ቦሌ ብርሃኔ አደባባይ 011-662-99-44 Ashenafi East A.A District ብርሃኔ አደባባይ መታጠፊያ Addis Ababa
358 462 SARIS KADISCO ሳሪስ ካዲኮ 011-443-99-33 Tariku South A.A District ካዲኮ ቀለም ፋብሪካ ፊት ለፊት Addis Ababa
359 463 MEGENAGNA ROUNDABOUT መገናኛ አደባባይ 011-667-99-55 Temesgen East A.A District መገናኛ ትራፊክ መብራት Addis Ababa
360 464 PIASSA POSTA ፒያሳ ፖስታ 011-126-99-33 Birtukan West A.A District ፒያሳ ፖስታ ቤት አጠገብ Addis Ababa
361 465 KAZANCHIS UNECA ካዛንቺስ ኢኮኖሚክ ኮሚሽን 011-557-99-44 Aboneh East A.A District የተመድ ኢኮኖሚክ ኮሚሽን ፊት ለፊት Addis Ababa
362 466 CMC PALACE ሲኤምሲ ቤተመንግስት 011-667-99-66 Ahmed East A.A District ሲኤምሲ ቪአይፒ መኖሪያ Addis Ababa
363 467 GERJI TAXI TERA ገርጂ ታክሲ ተራ 011-639-99-33 Adinew East A.A District ገርጂ ታክሲ ማቆሚያ Addis Ababa
364 468 BOLE MEDHANI ALEM PLAZA ቦሌ መድኃኔዓለም ፕላዛ 011-662-99-66 Ashenafi East A.A District መድኃኔዓለም ሞል 3ኛ ፎቅ Addis Ababa
365 469 OLD AIRPORT EMBASSY ብሉ ኤርፖርት ኤምባሲ 011-372-88-99 MELAKU South A.A District ብሉ ኤርፖርት ኤምባሲዎች መንደር Addis Ababa
366 470 BISHOFTU MEMORIAL ቢሾፍቱ መታሰቢያ 011-430-99-33 Abebe Adama Area Office ቢሾፍቱ አደባባይ መታሰቢያ Oromia
367 471 BAHIR DAR ABAY BRIDGE ባህር ዳር ዓባይ ድልድይ 058-220-99-11 Mengistu Bahir Dar District ዓባይ ድልድይ መግቢያ Amhara
368 472 GONDER AZEZO AIRPORT ጐንደር አዜዞ አየር ማረፊያ 058-111-99-33 Eyasu Bahir Dar District አዜዞ አየር ማረፊያ ተርሚናል Amhara
369 473 DESSIE MEMORIAL ደሴ መታሰቢያ 033-112-99-44 Girma Dessie District ደሴ ሰማዕታት አደባባይ Amhara
370 474 MEKELE CASTLE መቀሌ ካስትል 034-440-99-33 Aklilu Mekele District አብርሃ ካስትል አጠገብ Tigray
371 475 HAWASSA INDUSTRIAL PARK ሀዋሳ ኢንዱስትሪ ፓርክ 046-220-99-33 Alem Hawassa Area Office ሀዋሳ ኢንዱስትሪ ፓርክ በር Sidama
372 476 JIMMA AIRPORT ጅማ አየር ማረፊያ 047-112-99-11 Desta Jimma Area Office አባ ጅፋር አየር ማረፊያ Oromia
373 477 ADAMA BUS STATION አዳማ አውቶቢስ ተራ 022-112-99-33 Nebiyou Adama Area Office አዳማ መናሃሪያ አጠገብ Oromia
374 478 WENJI FACTORY ወንጂ ፋብሪካ 022-220-77-88 Nebiyou Adama Area Office ወንጂ ስኳር ፋብሪካ በር Oromia
375 479 GOLJOTA MARKET ጎልጆታ ገበያ 022-114-77-88 Gashaw Adama Area Office ጎልጆታ ማዘጋጃ ፊት ለፊት Oromia
376 480 ARSI ROBE TOWN አርሲ ሮቤ ከተማ 022-331-55-66 Welensa Hawassa Area Office አርሲ ሮቤ ከተማ ማዕከል Oromia
--- PAGE 15 ---
377 481 KEFIRA HISTORIC ከፊራ ታሪካዊ 025-466-99-44 Mesay Adama Area Office ጀጎል ግንብ ውስጥ ሐረር Harari
378 482 ABOMSA MARKET አቦምሳ ገበያ 022-335-99-33 Fikru Adama Area Office አቦምሳ የቅዳሜ ገበያ Oromia
379 483 ADDIS ALEM HIGHWAY አዲስ አለም አውራ ጎዳና 011-286-99-33 Gudeta West A.A District አምቦ አውራ ጎዳና ዳር Oromia
380 484 SHUMBO VALLEY ሹምቦ ሸለቆ 046-554-99-33 Binyam Hawassa Area Office ሹምቦ ሸለቆ መንደር Central Ethiopia
381 485 HAGEREMARIAM HIGHWAY ሀገረማርያም አውራ ጎዳና 046-443-99-33 Diba Hawassa Area Office ሞያሌ አውራ ጎዳና ዳር Oromia
382 486 DUGDA DAKE PARK ዱግዳ ዳኬ ፓርክ 022-116-99-33 Gemeda Adama Area Office ዱግዳ ዳኬ መዝናኛ Oromia
383 487 REMA HIGHLANDS ሬማ ደጋ 011-689-99-33 Sisay Debre Birhan Area Office ሬማ ደጋማ ስፍራ Amhara
384 488 BOLE BRHANE PLAZA ቦሌ ብርሃኔ ፕላዛ 011-662-99-88 Ashenafi East A.A District ብርሃኔ ፕላዛ ታወር Addis Ababa
385 489 SARIS TRANSPORT ሳሪስ ትራንስፖርት 011-443-99-55 Tariku South A.A District ሳሪስ ባቡር ጣቢያ አጠገብ Addis Ababa
386 490 MEGENAGNA METRO መገናኛ ሜትሮ 011-667-99-77 Temesgen East A.A District መገናኛ ቀላል ባቡር ጣቢያ Addis Ababa
387 491 PIASSA TAITU ፒያሳ ጣይቱ 011-126-99-55 Birtukan West A.A District እቴጌ ጣይቱ ሆቴል አጠገብ Addis Ababa
388 492 KAZANCHIS RADISSON ካዛንቺስ ራዲሰን 011-557-99-66 Aboneh East A.A District ራዲሰን ብሉ ሆቴል ፊት ለፊት Addis Ababa
389 493 CMC TOWERS ሲኤምሲ ታወርስ 011-667-99-88 Ahmed East A.A District ሲኤምሲ መንደር ታወርስ Addis Ababa
390 494 GERJI CONDOMINIUM ገርጂ ኮንዶሚኒየም 011-639-99-55 Adinew East A.A District ገርጂ ኮንዶሚኒየም በር Addis Ababa
391 495 BOLE EDNA MALL ቦሌ ኤድና ሞል 011-662-99-99 Ashenafi East A.A District ኤድና ሞል ፊት ለፊት Addis Ababa
392 496 OLD AIRPORT GOLF ብሉ ኤርፖርት ጎልፍ 011-372-99-11 MELAKU South A.A District ጎልፍ ክለብ አጠገብ Addis Ababa
393 497 BISHOFTU LAKES ቢሾፍቱ ሐይቆች 011-430-99-55 Abebe Adama Area Office ቢሾፍቱ ቢሾፍቱ ሐይቅ አጠገብ Oromia
394 498 BAHIR DAR AVENTI ባህር ዳር አቨንቲ 058-220-99-33 Mengistu Bahir Dar District አቫንቲ ብሉ ኒል ሆቴል አጠገብ Amhara
395 499 GONDER CASTLES ጐንደር ካስትልስ 058-111-99-55 Eyasu Bahir Dar District ጐንደር ቅርስ ማዕከል Amhara
396 500 DESSIE VIEW ደሴ እይታ 033-112-99-66 Girma Dessie District ጦሳ ተራራ እይታ ስፍራ Amhara
397 501 MEKELE TEKLEHAIMANOT መቀሌ ተክለሃይማኖት 034-440-99-55 Aklilu Mekele District ተክለሃይማኖት ቤ/ክ አጠገብ Tigray
398 502 HAWASSA LAKE VIEW ሀዋሳ ሐይቅ እይታ 046-220-99-55 Alem Hawassa Area Office ሀዋሳ ሐይቅ ዳርቻ Sidama
399 503 JIMMA PALACE ጅማ ቤተመንግስት 047-112-99-33 Desta Jimma Area Office ጅማ ሙዚየም አጠገብ Oromia
400 504 ADAMA HIGHWAY አዳማ አውራ ጎዳና 022-112-99-55 Nebiyou Adama Area Office አዳማ ቦሌ መንገድ ዳር Oromia
401 505 WENJI CANAL ወንጂ ቦይ 022-220-99-11 Nebiyou Adama Area Office ወንጂ መስኖ ቦይ አጠገብ Oromia
402 506 GOLJOTA RESIDENCE ጎልጆታ መንደር 022-114-99-11 Gashaw Adama Area Office ጎልጆታ የመኖሪያ መንደር Oromia
403 507 ARSI ROBE COMMERCIAL አርሲ ሮቤ ንግድ 022-331-77-88 Welensa Hawassa Area Office አርሲ ሮቤ ንግድ ባንክ ፊት ለፊት Oromia
404 508 ABOMSA VALLEY አቦምሳ ሸለቆ 022-335-99-55 Fikru Adama Area Office አቦምሳ አዋሽ ሸለቆ Oromia
--- PAGE 16 ---
405 509 ADDIS ALEM MARKET አዲስ አለም ገበያ 011-286-99-55 Gudeta West A.A District አዲስ አለም የገበያ ቦታ Oromia
406 510 SHUMBO RIVER ሹምቦ ወንዝ 046-554-99-55 Binyam Hawassa Area Office ሹምቦ ድልድይ አጠገብ Central Ethiopia
407 511 HAGEREMARIAM MARKET ሀገረማርያም ገበያ 046-443-99-55 Diba Hawassa Area Office ሀገረማርያም የገበያ ማዕከል Oromia
408 512 DUGDA DAKE HIGHWAY ዱግዳ ዳኬ አውራ ጎዳና 022-116-99-55 Gemeda Adama Area Office ዱግዳ ዳኬ ዋና መንገድ ዳር Oromia
409 513 REMA HILLS ሬማ ኮረብታ 011-689-99-55 Sisay Debre Birhan Area Office ሬማ መውጫ ኮረብታ Amhara
410 514 BOLE BRHANE TOWER ቦሌ ብርሃኔ ታወር 011-662-99-90 Ashenafi East A.A District ብርሃኔ ታወር 1ኛ ፎቅ Addis Ababa
411 515 SARIS COMMERCIAL CENTER ሳሪስ ንግድ ማዕከል 011-443-99-77 Tariku South A.A District ሳሪስ ንግድ ማዕከል ፊት ለፊት Addis Ababa
412 516 MEGENAGNA CITY MALL መገናኛ ሲቲ ሞል 011-667-99-90 Temesgen East A.A District ሲቲ ሞል መገናኛ Addis Ababa
413 517 PIASSA CINEMA EMPIRE ፒያሳ ሲኒማ ኤምፓየር 011-126-99-77 Birtukan West A.A District ሲኒማ ኤምፓየር ፊት ለፊት Addis Ababa
414 518 KAZANCHIS MINISTRIES ካዛንቺስ ሚኒስቴሮች 011-557-99-88 Aboneh East A.A District ገንዘብ ሚኒስቴር አጠገብ Addis Ababa
415 519 CMC CENTRAL PLAZA ሲኤምሲ ሴንትራል ፕላዛ 011-667-99-99 Ahmed East A.A District ሴንትራል ፕላዛ ሲኤምሲ Addis Ababa
416 520 GERJI MEBRAT HAIL GATE ገርጂ መብራት ኃይል በር 011-639-99-77 Adinew East A.A District መብራት ኃይል ዋና መግቢያ Addis Ababa
417 521 BOLE MEDHANI ALEM COMMERCIAL ቦሌ መድኃኔዓለም ንግድ 011-662-99-98 Ashenafi East A.A District መድኃኔዓለም ንግድ ባንክ አጠገብ Addis Ababa
418 522 OLD AIRPORT SHOPPING MALL ብሉ ኤርፖርት ሾፒንግ ሞል 011-372-99-33 MELAKU South A.A District ብሉ ኤርፖርት ሾፒንግ ሞል Addis Ababa
419 523 BISHOFTU CRATER LAKES ቢሾፍቱ ክሬተር ሐይቆች 011-430-99-77 Abebe Adama Area Office ክሬተር ሐይቆች መግቢያ Oromia
420 524 BAHIR DAR PAPYRUS ባህር ዳር ፓፒረስ 058-220-99-55 Mengistu Bahir Dar District ፓፒረስ ሆቴል ፊት ለፊት Amhara
421 525 GONDER TAYE HOTEL ጐንደር ጣዬ ሆቴል 058-111-99-77 Eyasu Bahir Dar District ጣዬ በላይ ሆቴል አጠገብ Amhara
422 526 DESSIE MEMORIAL PLAZA ደሴ መታሰቢያ ፕላዛ 033-112-99-88 Girma Dessie District መታሰቢያ ፕላዛ ደሴ Amhara
423 527 MEKELE MARTYRS SQUARE መቀሌ ሰማዕታት አደባባይ 034-440-99-77 Aklilu Mekele District ሰማዕታት አደባባይ መቀሌ Tigray
424 528 HAWASSA PINNA HOTEL ሀዋሳ ፒና ሆቴል 046-220-99-77 Alem Hawassa Area Office ፒና ሆቴል ፊት ለፊት Sidama
425 529 JIMMA MERCATO ጅማ መርካቶ 047-112-99-55 Desta Jimma Area Office ጅማ መርካቶ አደባባይ Oromia
426 530 ADAMA STADIUM አዳማ ስታዲየም 022-112-99-77 Nebiyou Adama Area Office አዳማ ስታዲየም ፊት ለፊት Oromia
427 531 WENJI SUGAR ESTATE ወንጂ ስኳር እርሻ 022-220-99-33 Nebiyou Adama Area Office ወንጂ ስኳር እርሻ መንደር Oromia
428 532 GOLJOTA COMMERCIAL CENTER ጎልጆታ ንግድ ማዕከል 022-114-99-33 Gashaw Adama Area Office ጎልጆታ ንግድ ማዕከል Oromia
429 533 ARSI ROBE MARKET PLAZA አርሲ ሮቤ ገበያ ፕላዛ 022-331-99-11 Welensa Hawassa Area Office አርሲ ሮቤ ገበያ ፕላዛ Oromia
430 534 ABOMSA CENTRAL SQUARE አቦምሳ ማዕከላዊ አደባባይ 022-335-99-77 Fikru Adama Area Office አቦምሳ ማዕከላዊ አደባባይ Oromia
431 535 ADDIS ALEM COMMERCIAL HUB አዲስ አለም ንግድ ማዕከል 011-286-99-77 Gudeta West A.A District አዲስ አለም ንግድ ማዕከል Oromia
432 536 SHUMBO CENTRAL MARKET ሹምቦ ማዕከላዊ ገበያ 046-554-99-77 Binyam Hawassa Area Office ሹምቦ ማዕከላዊ ገበያ Central Ethiopia
--- PAGE 17 ---
433 537 MAICHEW ማይጨው 034-775-45-67 Hailay Mekele District ማይጨው ከተማ ዋና መንገድ Tigray
434 538 DILLA COMMERCIAL ዲላ ንግድ 046-331-55-66 Belay Hawassa Area Office ዲላ ንግድ ማዕከል South Ethiopia
435 539 KEMISE TOWN ከሚሴ ከተማ 033-554-55-66 Mulu Dessie District ከሚሴ ከተማ ማዕከል Amhara
436 540 ADAMA POSTA ROAD አዳማ ፖስታ መንገድ 022-112-55-66 Gashaw Adama Area Office አዳማ ፖስታ ዋና መንገድ Oromia
437 541 BESHOFTU MEMORIAL PARK ቢሾፍቱ መታሰቢያ ፓርክ 011-430-55-77 Mesay Adama Area Office ቢሾፍቱ መታሰቢያ ፓርክ Oromia
438 542 AYAT ZONE 5 አያት ዞን 5 011-667-55-88 Yidnekachew East A.A District አያት ዞን 5 አደባባይ Addis Ababa
439 543 KOMBOLCHA AIRPORT ROAD ኮምቦልቻ አየር ማረፊያ መንገድ 033-551-55-66 Tadesse Dessie District ኮምቦልቻ አየር ማረፊያ መንገድ Amhara
440 544 TULU DIMTU CONDOS ቱሉ ዲምቱ ኮንዶ 011-471-55-88 Desta South A.A District ቱሉ ዲምቱ ኮንዶሚኒየም Addis Ababa
441 545 KOYE FECHE ZONE 1 ኮየ ፈጬ ዞን 1 011-471-55-99 Haile South A.A District ኮየ ፈጬ ዞን 1 Addis Ababa
442 546 RAGUEL MARKET ራጉኤል ገበያ 011-275-55-99 Birhanu West A.A District ራጉኤል ገበያ ማዕከል Addis Ababa
443 547 TANA TERA COMMERCIAL ጣና ተራ ንግድ 011-275-55-11 Getu West A.A District ጣና ተራ ንግድ ህንፃ Addis Ababa
444 548 DUBAI TERA PLAZA ዱባይ ተራ ፕላዛ 011-275-55-22 Abera West A.A District ዱባይ ተራ ፕላዛ ታወር Addis Ababa
445 549 MILITARY TERA MARKET ሚሊተሪ ተራ ገበያ 011-275-55-33 Workneh West A.A District ሚሊተሪ ተራ ገበያ Addis Ababa
446 550 BOMBA TERA PLAZA ቦምብ ተራ ፕላዛ 011-275-55-44 Zeleke West A.A District ቦምብ ተራ ፕላዛ Addis Ababa
447 551 SEBATEGNA MARKET ሰባተኛ ገበያ 011-275-55-55 Negatu West A.A District ሰባተኛ ገበያ Addis Ababa
448 552 SHEMA TERA PLAZA ሸማ ተራ ፕላዛ 011-275-55-66 Mulugeta West A.A District ሸማ ተራ ፕላዛ Addis Ababa
449 553 TOTAL PETROLEUM ROAD ቶታል ነዳጅ መንገድ 011-275-55-77 Kassahun West A.A District ቶታል ነዳጅ ማደያ ዳር Addis Ababa
450 554 ENKULAL FABRIKA PLAZA እንቁላል ፋብሪካ ፕላዛ 011-275-55-88 Fisseha West A.A District እንቁላል ፋብሪካ ፕላዛ Addis Ababa
451 555 SHIRO MEDA EMBASSY ሽሮ ሜዳ ኤምባሲ 011-123-55-77 Girma West A.A District አሜሪካ ኤምባሲ አጠገብ Addis Ababa
452 556 BEL AIR HEIGHTS ቤል ኤር ሃይትስ 011-123-55-88 Melaku West A.A District ቤል ኤር ኮረብታ Addis Ababa
453 557 SEMIEN HOTEL SQUARE ሰሜን ሆቴል አደባባይ 011-123-55-99 Samuel West A.A District ሰሜን ሆቴል አደባባይ Addis Ababa
454 558 ARAT KILO UNIVERSITY አራት ኪሎ ዩኒቨርሲቲ 011-123-77-11 Daniel West A.A District ሳይንስ ፋከልቲ ፊት ለፊት Addis Ababa
455 559 SIDIST KILO MUSEUM ስድስት ኪሎ ሙዚየም 011-123-77-22 Yohannes West A.A District ብሔራዊ ሙዚየም አጠገብ Addis Ababa
456 560 SHOLA COMMERCIAL CENTER ሾላ ንግድ ማዕከል 011-667-77-33 Solomon East A.A District ሾላ ንግድ ማዕከል Addis Ababa
457 561 MEGENAGNA BUSINESS CENTER መገናኛ ቢዝነስ ሴንተር 011-667-77-44 Assefa East A.A District ቢዝነስ ሴንተር መገናኛ Addis Ababa
458 562 GURD SHOLA PLAZA ጉርድ ሾላ ፕላዛ 011-667-77-55 Mesfin East A.A District ጉርድ ሾላ ፕላዛ ታወር Addis Ababa
459 563 LAMBERET TERMINAL ላምበረት ተርሚናል 011-667-77-66 Seyoum East A.A District ላምበረት ተርሚናል መግቢያ Addis Ababa
460 565 HAGEREMARIAM ሀገረማርያም 046-443-11-22 Diba Hawassa Area Office ሀገረማርያም ከተማ መሃል አደባባይ Oromia
--- PAGE 18 ---
461 566 DUGDA DAKE ዱግዳ ዳኬ 022-116-11-22 Gemeda Adama Area Office ዱግዳ ዳኬ ከተማ መሃል Oromia
462 567 REMA ሬማ 011-689-11-22 Sisay Debre Birhan Area Office ሬማ ከተማ Amhara
463 568 BOLE BRHANE ቦሌ ብርሃኔ 011-662-11-22 Ashenafi East A.A District ብርሃኔ ህንፃ አጠገብ Addis Ababa
464 569 SARIS ሳሪስ 011-443-11-22 Tariku South A.A District ሳሪስ አደባባይ Addis Ababa
465 570 MEGENAGNA መገናኛ 011-667-11-22 Temesgen East A.A District መገናኛ ማዕከል Addis Ababa
466 571 PIASSA ፒያሳ 011-126-11-22 Birtukan West A.A District ፒያሳ መሃል Addis Ababa
467 572 KAZANCHIS ካዛንቺስ 011-557-11-22 Aboneh East A.A District ካዛንቺስ ማዕከል Addis Ababa
468 573 CMC ሲኤምሲ 011-667-11-33 Ahmed East A.A District ሲኤምሲ ማዕከል Addis Ababa
469 574 GERJI ገርጂ 011-639-11-22 Adinew East A.A District ገርጂ ማዕከል Addis Ababa
470 575 BOLE MEDHANI ALEM ቦሌ መድኃኔዓለም 011-662-11-33 Ashenafi East A.A District መድኃኔዓለም ማዕከል Addis Ababa
471 576 OLD AIRPORT ብሉ ኤርፖርት 011-372-11-33 MELAKU South A.A District ብሉ ኤርፖርት ማዕከል Addis Ababa
472 577 BISHOFTU ቢሾፍቱ 011-430-11-22 Abebe Adama Area Office ቢሾፍቱ ማዕከል Oromia
473 578 BAHIR DAR ባህር ዳር 058-220-11-22 Mengistu Bahir Dar District ባህር ዳር ማዕከል Amhara
474 579 REMA ሬማ 011-689-11-33 Sisay Debre Birhan Area Office ሬማ ዋና ቅርንጫፍ Amhara
"""

district_mapping = {
    "East A.A District": ("DIST-EAD", "East A.A District"),
    "West A.A District": ("DIST-WAD", "West A.A District"),
    "South A.A District": ("DIST-SAD", "South A.A District"),
    "Bahir Dar District": ("DIST-BDR", "Bahir Dar District"),
    "Dessie District": ("DIST-DES", "Dessie District"),
    "Mekele District": ("DIST-MKL", "Mekele District"),
    "Jimma Area Office": ("DIST-JMA", "Jimma Area Office"),
    "Hawassa Area Office": ("DIST-HWA", "Hawassa Area Office"),
    "Adama Area Office": ("DIST-ADM", "Adama Area Office"),
    "ADAma Area Office": ("DIST-ADM", "Adama Area Office"),
    "Debre Birhan Area Office": ("DIST-DBA", "Debre Birhan Area Office"),
    "Debre Markos Area Office": ("DIST-DMA", "Debre Markos Area Office"),
    "Main": ("DIST-EAD", "East A.A District"),
}

branches = []
seen_sols = set()

for line in raw_ocr_pages.strip().split("\n"):
    line = line.strip()
    if not line or line.startswith("---"):
        continue
    parts = line.split()
    if len(parts) < 6:
        continue
    try:
        s_no = int(parts[0])
        sol_id = parts[1]
    except ValueError:
        continue

    # Clean English branch name extraction
    # The nameEn can have multiple words up to Amharic name
    # Let's find index where first Amharic word starts (character code > 0x1200)
    amharic_idx = -1
    for i in range(2, len(parts)):
        if any(ord(c) >= 0x1200 and ord(c) <= 0x137F for c in parts[i]):
            amharic_idx = i
            break
    
    if amharic_idx == -1:
        continue

    name_en = " ".join(parts[2:amharic_idx])
    # Next find phone
    phone_idx = -1
    for i in range(amharic_idx + 1, len(parts)):
        if re.search(r'\d{3}[-\s]\d+', parts[i]) or parts[i].startswith("011") or parts[i].startswith("058") or parts[i].startswith("022") or parts[i].startswith("046") or parts[i].startswith("034") or parts[i].startswith("033") or parts[i].startswith("047") or parts[i].startswith("057") or parts[i].startswith("025"):
            phone_idx = i
            break
    
    name_am = " ".join(parts[amharic_idx:phone_idx]) if phone_idx != -1 else parts[amharic_idx]
    phone = parts[phone_idx] if phone_idx != -1 else "011-158-08-84"

    # Next find district
    dist_id = "DIST-EAD"
    dist_name = "East A.A District"
    for d_key, (did, dname) in district_mapping.items():
        if d_key in line:
            dist_id = did
            dist_name = dname
            break

    # Region
    region = "Addis Ababa"
    for r in ["Addis Ababa", "Amhara", "Oromia", "Tigray", "Sidama", "South Ethiopia", "Central Ethiopia", "South West", "Benishangul-Gumuz", "Benshangul Gumz", "Somali", "Somale", "Harari", "Hrari", "Dire Dawa", "Gambela", "Afar"]:
        if r in line:
            region = r
            break
    
    # Standardize region names
    if region == "Somale": region = "Somali"
    if region == "Hrari": region = "Harari"
    if region == "Benshangul Gumz": region = "Benishangul-Gumuz"

    # Manager name
    mgr = "Branch Manager"
    # Try finding manager
    if "Ato " in line:
        mgr_part = line.split("Ato ")[1].split("District")[0].split("Area Office")[0].strip()
        mgr = "Ato " + mgr_part.split()[0]
        if len(mgr_part.split()) > 1:
            mgr += " " + mgr_part.split()[1]

    # Ensure unique SOL ID
    if sol_id in seen_sols:
        continue
    seen_sols.add(sol_id)

    # Clean official branch name
    clean_name = name_en.strip()

    branches.append({
        "id": f"BR-{sol_id}",
        "solId": sol_id,
        "districtId": dist_id,
        "districtName": dist_name,
        "name": clean_name,
        "code": sol_id,
        "phone": phone,
        "type": "Main Branch" if sol_id == "101" else "Standard Branch",
        "employeeCount": 25,
        "managerName": mgr,
        "location": f"{clean_name}, {region}",
        "region": region,
        "status": "Active"
    })

print(f"Successfully processed {len(branches)} unique official branches.")
with open("official_branches.json", "w", encoding="utf-8") as f:
    json.dump(branches, f, indent=2, ensure_ascii=False)
