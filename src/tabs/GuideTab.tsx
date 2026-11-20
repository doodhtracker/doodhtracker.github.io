import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Home, Plus, BarChart3, Settings, Milk, LogIn, Download, MessageSquare, Cloud } from 'lucide-react'
import { useLang } from '../i18n'

interface Section {
  title: string
  icon: React.ElementType
  content: string[]
}

const hinglish: Section[] = [
  {
    title: '🥛 Doodh Tracker kya hai?',
    icon: Milk,
    content: [
      'Yeh ek website hai jisme aap apne gaay aur bhains ka doodh hisaab rakh sakte ho.',
      'Subah aur shaam — dono time ka doodh alag se likh sakte ho.',
      'Har aadmi ka apna alag account hota hai. Koi dusra aadmi aapka data nahi dekh sakta.',
      'Saara data aapke browser (phone/computer) mein save hota hai — koi server pe nahi jata.',
      'Website ka naam "Doodh Tracker" hai — na ki kuch aur.',
    ],
  },
  {
    title: '🔐 Login / Account kaise banayein?',
    icon: LogIn,
    content: [
      'Website kholne par pehle Login screen aata hai.',
      'Agar pehle se account hai: Apna Naam aur PIN daal ke "Login" dabao.',
      'Agar naya account banana hai: "Naya account banana hai? Yahan dabao" link pe click karo. Naam aur 4-digit PIN daalo, "Account Banao" dabao.',
      'PIN kam se kam 4 number ka hona chahiye (jaise 1234).',
      'PIN yaad rakho — yeh aapke data ki chaabi hai.',
    ],
  },
  {
    title: '🔑 PIN bhul gaye toh?',
    icon: LogIn,
    content: [
      'Login screen pe "PIN bhul gaye? Reset karo" link dabao.',
      'Apna Naam daalo jo account mein hai.',
      'Naya PIN daalo (4 digit).',
      'Naya PIN dobara se daalo (confirm karne ke liye).',
      '"PIN Badlo" dabao — PIN change ho jayega!',
      'Ab naye PIN se login karo.',
    ],
  },
  {
    title: '🏠 Home Tab — Aaj ka hisaab',
    icon: Home,
    content: [
      'Home tab mein aaj ki date aur aaj ka total doodh dikhta hai (kitne litre).',
      'Subah ka doodh aur shaam ka doodh alag-alag cards mein dikhta hai.',
      '"Aaj ka Hisaab" card mein is mahine ka total doodh aur total paisa dikhta hai (agar rate set kiya hai).',
      '"Pichhle 7 din" mein pichhle ek hafte ka total doodh litre dikhta hai.',
      '"Naya Doodh Entry" button dabane se Entry tab khulta hai.',
      'Neeche aaj ki saari entries ki list dikhti hai — kaunse janwar se, subah ya shaam, kitne litre.',
      'Agar rate set kiya hai toh har entry ke saath paisa bhi dikhega.',
    ],
  },
  {
    title: '📝 Entry Tab — Nai entry kaise daalein',
    icon: Plus,
    content: [
      'Entry tab mein naya doodh entry add karte hain.',
      '📅 Date: Aaj ki date aati hai. Agar pichle din ki entry karni ho toh date change karo.',
      '⏰ Time: "Subah" ya "Shaam" select karo.',
      'Janwar: "🐄 Gaay" ya "🐃 Bhains" select karo — dono options clearly dikhte hain.',
      'Janwar ka Naam (optional): Chaaho toh janwar ka naam daalo (jaise Laxmi, Gauri). Zaroori nahi. Naam daaloge toh Stats mein har janwar ka alag hisaab milega.',
      'Agar pehle koi naam daala tha toh neeche chote buttons mein dikhega — click karke quickly select kar sakte ho.',
      '🥛 Doodh (litre): Kitne litre doodh tha woh daalo (jaise 2.5, 3, 1.5).',
      '💰 Paisa Preview: Agar rate set kiya hai, toh litre daalte hi paisa dikhega (jaise ₹100 = 2.5L × ₹40/L).',
      '📝 Note (optional): Koi khaas baat likhni ho toh (jaise "aadha litre gir gaya").',
      '"Entry Save Karo" dabao — entry save ho jayegi!',
      'Neeche us din ki saari entries dikhti hai. Delete karna ho toh 🗑️ dabao.',
    ],
  },
  {
    title: '📊 Stats Tab — Hisaab aur Charts',
    icon: BarChart3,
    content: [
      'Stats tab mein pura hisaab aur charts dikhte hain.',
      '📅 Date Filter: "Se" aur "Tak" date daal ke kisi bhi time period ka data dekho (jaise 1 Aug se 15 Aug tak).',
      'Kul Doodh: Filter kiye gaye time mein total kitne litre doodh tha.',
      'Kul Entries: Total kitni entries ki hai us period mein.',
      '💰 Kul Paisa: Agar rate set kiya hai toh total paisa dikhega (₹ mein).',
      'CSV Export Karo: Saara data CSV file mein download ho jayega — backup ke liye.',
      '🐄 Gaay / 🐃 Bhains: Alag-alag se total litre dikhta hai.',
      '📊 Pichhle 7 Din Chart: 7 din ka bar chart — subah (amber) aur shaam (blue) alag se.',
      '🥧 Gaay vs Bhains Pie Chart: Kitna percent gaay ka doodh, kitna percent bhains ka.',
      '🐄 Janwar-wise Hisaab: Naam daala tha toh har janwar ka alag total — kitna doodh, kitne entries, kitna paisa.',
    ],
  },
  {
    title: '⚙️ Settings Tab — Rate, Reminder, Export, Import, Account',
    icon: Settings,
    content: [
      'Settings tab mein 5 cheezein hoti hain:',
      '',
      '1️⃣ 💰 Rate Set Karo:',
      '   • Gaay ka rate daalo (₹/litre, jaise 40).',
      '   • Bhains ka rate daalo (₹/litre, jaise 45).',
      '   • "Rate Save Karo" dabao.',
      '   • Ab har entry mein paisa automatic dikhega — Home, Entry, Stats sab jagah.',
      '   • Agar rate 0 chhod diya toh paisa calculation nahi hoga.',
      '',
      '2️⃣ 🔔 Reminder Set Karo:',
      '   • Subah Reminder: Time set karo (jaise 06:00) aur toggle ON karo.',
      '   • Shaam Reminder: Time set karo (jaise 18:00) aur toggle ON karo.',
      '   • "Reminder Save Karo" dabao.',
      '   • Browser notification permission maangega — Allow karo.',
      '   • Reminder tab kaam karega jab website browser mein khuli hogi.',
      '',
      '3️⃣ 📥 Data Export (Backup):',
      '   • Saara doodh data CSV file mein download ho jata hai.',
      '   • Yeh file Excel ya Google Sheets mein khul sakti hai.',
      '   • Phone change hone pe ya data delete ho jaane pe yeh file se wapas data laa sakte ho.',
      '',
      '4️⃣ 📤 Data Import (CSV Upload):',
      '   • Pehle se download ki hui CSV file select karo.',
      '   • "CSV Upload Karo" dabao — purana data wapas aa jayega!',
      '   • Duplicate entries skip ho jayengi (same date+janwar+session+litre).',
      '',
      '5️⃣ 👤 Account:',
      '   • Yahan aapka naam aur total entries dikhte hain.',
      '   • Logout button se bahar aa sakte ho.',
    ],
  },
  {
    title: '💾 Data kahan save hota hai?',
    icon: Milk,
    content: [
      'Saara data aapke browser ke localStorage mein save hota hai.',
      'Yeh data sirf us browser/device mein rahta hai jahan aapne account banaya.',
      'Agar phone change karte ho ya browser clear karte ho toh data delete ho sakta hai.',
      'Isliye samay-samay pe Settings → Data Export se CSV download karke backup rakho.',
      'Naye device pe CSV upload karke purana data wapas laa sakte ho.',
      'Google se login kiya ho toh data cloud pe bhi safe rehta hai.',
    ],
  },
  {
    title: '🔄 Data Backup aur Restore kaise karein?',
    icon: Download,
    content: [
      'BACKUP (Data save karna):',
      '   • Settings tab mein jao.',
      '   • "📥 Data Export (Backup)" section mein "CSV Download Karo" dabao.',
      '   • CSV file download ho jayegi — isse safe jagah rakho (Google Drive, email, etc).',
      '',
      'RESTORE (Data wapas laana):',
      '   • Naye device ya browser mein account banao.',
      '   • Settings tab mein jao.',
      '   • "📤 Data Import (CSV Upload)" section mein "CSV Upload Karo" dabao.',
      '   • Pehle download ki hui CSV file select karo.',
      '   • Purana data wapas aa jayega!',
      '   • Home aur Stats tab mein check karo — saara data dikhega.',
    ],
  },
  {
    title: '📝 Review Tab — Apni problem aur suggestion bhejo',
    icon: MessageSquare,
    content: [
      'Review tab mein tum apni problem ya suggestion likh sakte ho.',
      '📝 Apna naam (optional): Naam likhna zaroori nahi — khaali chhod do to "Anonymous" chala jayega.',
      '⭐ Rating: 5 star mein se jitne chahiye utne dabao (1 = kharab, 5 = badhiya). Dobara dabane par rating hat jayegi.',
      'Kya problem hai?: Jo dikkat aa rahi hai woh likho (jaise "entry save nahi ho rahi").',
      'Kya aur add hona chahiye?: Naya feature ka suggestion likho (jaise "mahine ka PDF report").',
      '"Review Submit Karo" dabao — review is phone pe save ho jayega.',
      'Neeche "Is device ke Reviews" mein tumhare saare reviews dikhte hain — galat likh gaya ho to 🗑️ se delete kar do.',
      '📤 Review developer tak pahunchane ke liye "Email se bhejo" button dabao — email app khulega, bas Send dabana hai.',
    ],
  },
  {
    title: '☁️ Google Login — iske kya fayde hain?',
    icon: Cloud,
    content: [
      'Google se login ka matlab: tumhara doodh ka data tumhare Google account ke saath cloud pe save hota hai.',
      '',
      '1️⃣ Phone gaya, data nahi gaya:',
      '   • Phone kho gaya, toot gaya, ya naya phone liya — naye phone pe Google se login karo, saara hisaab wapas mil jayega.',
      '   • Browser ka data clear ho gaya to bhi kuch nahi jaata — cloud se wapas aa jata hai.',
      '   • PIN wale account mein data sirf usi phone mein rehta tha — phone gaya to data gaya.',
      '',
      '2️⃣ Har device pe same data:',
      '   • Phone, tablet, laptop — jahan login karo, wahi hisaab dikhega.',
      '',
      '3️⃣ Automatic save — alag se backup nahi lena padta:',
      '   • Entry karte ho, apne aap cloud pe chali jaati hai.',
      '',
      '4️⃣ Login aasan:',
      '   • PIN yaad rakhne ki zaroorat nahi — Google account se ek tap.',
      '',
      '5️⃣ Sirf tumhara data, tumhare control mein:',
      '   • Google sirf tumhara naam aur email maangta hai — contacts, photos, kuch bhi nahi.',
      '   • Doosre log tumhara data nahi dekh sakte.',
      '   • Band karna ho to Settings → ☁️ Cloud Sync → "Google se disconnect karo" dabao.',
      '',
      '6️⃣ Free hai:',
      '   • Google ka free plan is app ke liye kaafi se zyada hai — koi paisa nahi lagta.',
      '',
      '💡 Agar tum sirf ek hi phone pe use karte ho aur backup ki fikar nahi, to PIN se bhi kaam chal jayega.',
    ],
  },
]

const hi: Section[] = [
  {
    title: '🥛 दूध ट्रैकर क्या है?',
    icon: Milk,
    content: [
      'यह एक वेबसाइट है जिसमें आप अपनी गाय और भैंस के दूध का हिसाब रख सकते हो।',
      'सुबह और शाम — दोनों समय का दूध अलग-अलग लिख सकते हो।',
      'हर व्यक्ति का अपना अलग खाता होता है। कोई दूसरा आपका डेटा नहीं देख सकता।',
      'सारा डेटा आपके ब्राउज़र (फ़ोन/कंप्यूटर) में सेव होता है — किसी सर्वर पर नहीं जाता।',
      'वेबसाइट का नाम "Doodh Tracker" है।',
    ],
  },
  {
    title: '🔐 लॉगिन / खाता कैसे बनाएँ?',
    icon: LogIn,
    content: [
      'वेबसाइट खोलने पर पहले लॉगिन स्क्रीन आती है।',
      'अगर पहले से खाता है: अपना नाम और पिन डालकर "लॉगिन" दबाओ।',
      'नया खाता बनाना है: "नया खाता बनाना है? यहाँ दबाओ" लिंक दबाओ। नाम और 4 अंकों का पिन डालो, "खाता बनाओ" दबाओ।',
      'पिन कम से कम 4 अंकों का होना चाहिए (जैसे 1234)।',
      'पिन याद रखो — यह आपके डेटा की चाबी है।',
    ],
  },
  {
    title: '🔑 पिन भूल गए तो?',
    icon: LogIn,
    content: [
      'लॉगिन स्क्रीन पर "पिन भूल गए? रीसेट करो" लिंक दबाओ।',
      'अपना नाम डालो जो खाते में है।',
      'नया पिन डालो (4 अंक)।',
      'नया पिन दोबारा डालो (पुष्टि के लिए)।',
      '"पिन बदलो" दबाओ — पिन बदल जाएगा!',
      'अब नए पिन से लॉगिन करो।',
    ],
  },
  {
    title: '🏠 होम टैब — आज का हिसाब',
    icon: Home,
    content: [
      'होम टैब में आज की तारीख़ और आज का कुल दूध दिखता है (कितने लीटर)।',
      'सुबह का दूध और शाम का दूध अलग-अलग कार्ड में दिखता है।',
      'महीने का हिसाब कार्ड में इस महीने का कुल दूध और कुल पैसा दिखता है (अगर रेट सेट किया है)।',
      '"पिछले 7 दिन" में पिछले हफ़्ते का कुल दूध दिखता है।',
      '"नई दूध एंट्री" बटन दबाने से एंट्री टैब खुलता है।',
      'नीचे आज की सारी एंट्रीज़ की सूची दिखती है — किस जानवर से, सुबह या शाम, कितने लीटर।',
      'रेट सेट किया है तो हर एंट्री के साथ पैसा भी दिखेगा।',
    ],
  },
  {
    title: '📝 एंट्री टैब — नई एंट्री कैसे डालें',
    icon: Plus,
    content: [
      'एंट्री टैब में नई दूध एंट्री जोड़ते हैं।',
      '📅 तारीख़: आज की तारीख़ आती है। पिछले दिन की एंट्री करनी हो तो तारीख़ बदलो।',
      '⏰ समय: "सुबह" या "शाम" चुनो।',
      'जानवर: "🐄 गाय" या "🐃 भैंस" चुनो — दोनों विकल्प साफ़ दिखते हैं।',
      'जानवर का नाम (वैकल्पिक): चाहो तो नाम डालो (जैसे लक्ष्मी, गौरी)। ज़रूरी नहीं। नाम डालोगे तो आँकड़ों में हर जानवर का अलग हिसाब मिलेगा।',
      'पहले कोई नाम डाला था तो नीचे छोटे बटन में दिखेगा — दबाकर जल्दी चुन सकते हो।',
      '🥛 दूध (लीटर): कितने लीटर दूध था वो डालो (जैसे 2.5, 3, 1.5)।',
      '💰 पैसा: रेट सेट किया है तो लीटर डालते ही पैसा दिखेगा (जैसे ₹100 = 2.5L × ₹40/L)।',
      '📝 नोट (वैकल्पिक): कोई खास बात लिखनी हो तो।',
      '"एंट्री सेव करो" दबाओ — एंट्री सेव हो जाएगी!',
      'नीचे उस दिन की सारी एंट्रीज़ दिखती हैं। हटानी हो तो 🗑️ दबाओ।',
    ],
  },
  {
    title: '📊 आँकड़े टैब — हिसाब और चार्ट',
    icon: BarChart3,
    content: [
      'आँकड़े टैब में पूरा हिसाब और चार्ट दिखते हैं।',
      '📅 तारीख़ फ़िल्टर: "से" और "तक" तारीख़ डालकर किसी भी अवधि का डेटा देखो।',
      'कुल दूध: चुनी गई अवधि में कुल कितने लीटर दूध था।',
      'कुल एंट्रीज़: उस अवधि में कुल कितनी एंट्रीज़ हैं।',
      '💰 कुल पैसा: रेट सेट किया है तो कुल पैसा दिखेगा (₹ में)।',
      'CSV एक्सपोर्ट करो: सारा डेटा CSV फ़ाइल में डाउनलोड हो जाएगा — बैकअप के लिए।',
      '🐄 गाय / 🐃 भैंस: अलग-अलग कुल लीटर दिखता है।',
      '📊 पिछले 7 दिन का चार्ट: सुबह (पीला) और शाम (नीला) अलग-अलग।',
      '🥧 गाय बनाम भैंस पाई चार्ट: कितना प्रतिशत गाय का दूध, कितना भैंस का।',
      '🐄 जानवर-वार हिसाब: नाम डाला था तो हर जानवर का अलग कुल — कितना दूध, कितनी एंट्रीज़, कितना पैसा।',
    ],
  },
  {
    title: '⚙️ सेटिंग टैब — रेट, रिमाइंडर, एक्सपोर्ट, इम्पोर्ट, खाता',
    icon: Settings,
    content: [
      'सेटिंग टैब में 5 चीज़ें होती हैं:',
      '',
      '1️⃣ 💰 रेट सेट करो:',
      '   • गाय का रेट डालो (₹/लीटर, जैसे 40)।',
      '   • भैंस का रेट डालो (₹/लीटर, जैसे 45)।',
      '   • "रेट सेव करो" दबाओ।',
      '   • अब हर एंट्री में पैसा अपने आप दिखेगा — होम, एंट्री, आँकड़े सब जगह।',
      '   • रेट 0 छोड़ा तो पैसे का हिसाब नहीं होगा।',
      '',
      '2️⃣ 🔔 रिमाइंडर सेट करो:',
      '   • सुबह रिमाइंडर: समय सेट करो (जैसे 06:00) और टॉगल ON करो।',
      '   • शाम रिमाइंडर: समय सेट करो (जैसे 18:00) और टॉगल ON करो।',
      '   • "रिमाइंडर सेव करो" दबाओ।',
      '   • ब्राउज़र नोटिफ़िकेशन की अनुमति माँगेगा — Allow करो।',
      '   • रिमाइंडर तभी काम करेगा जब वेबसाइट ब्राउज़र में खुली होगी।',
      '',
      '3️⃣ 📥 डेटा एक्सपोर्ट (बैकअप):',
      '   • सारा दूध डेटा CSV फ़ाइल में डाउनलोड हो जाता है।',
      '   • यह फ़ाइल Excel या Google Sheets में खुल सकती है।',
      '   • फ़ोन बदलने या डेटा मिटने पर इस फ़ाइल से डेटा वापस ला सकते हो।',
      '',
      '4️⃣ 📤 डेटा इम्पोर्ट (CSV अपलोड):',
      '   • पहले डाउनलोड की हुई CSV फ़ाइल चुनो।',
      '   • "CSV अपलोड करो" दबाओ — पुराना डेटा वापस आ जाएगा!',
      '   • दोहरी एंट्रीज़ छूट जाएँगी (एक ही तारीख़+जानवर+समय+लीटर)।',
      '',
      '5️⃣ 👤 खाता:',
      '   • यहाँ आपका नाम और कुल एंट्रीज़ दिखती हैं।',
      '   • लॉगआउट बटन से बाहर आ सकते हो।',
    ],
  },
  {
    title: '💾 डेटा कहाँ सेव होता है?',
    icon: Milk,
    content: [
      'सारा डेटा आपके ब्राउज़र के localStorage में सेव होता है।',
      'यह डेटा सिर्फ़ उसी ब्राउज़र/डिवाइस में रहता है जहाँ खाता बनाया।',
      'फ़ोन बदला या ब्राउज़र साफ़ किया तो डेटा मिट सकता है।',
      'इसलिए समय-समय पर सेटिंग → डेटा एक्सपोर्ट से CSV डाउनलोड करके बैकअप रखो।',
      'नए डिवाइस पर CSV अपलोड करके पुराना डेटा वापस ला सकते हो।',
      'Google से लॉगिन किया हो तो डेटा क्लाउड पर भी सुरक्षित रहता है।',
    ],
  },
  {
    title: '🔄 डेटा बैकअप और रीस्टोर कैसे करें?',
    icon: Download,
    content: [
      'बैकअप (डेटा सेव करना):',
      '   • सेटिंग टैब में जाओ।',
      '   • "📥 डेटा एक्सपोर्ट (बैकअप)" में "CSV डाउनलोड करो" दबाओ।',
      '   • CSV फ़ाइल डाउनलोड हो जाएगी — इसे सुरक्षित जगह रखो (Google Drive, ईमेल आदि)।',
      '',
      'रीस्टोर (डेटा वापस लाना):',
      '   • नए डिवाइस या ब्राउज़र में खाता बनाओ।',
      '   • सेटिंग टैब में जाओ।',
      '   • "📤 डेटा इम्पोर्ट (CSV अपलोड)" में "CSV अपलोड करो" दबाओ।',
      '   • पहले डाउनलोड की हुई CSV फ़ाइल चुनो।',
      '   • पुराना डेटा वापस आ जाएगा!',
    ],
  },
  {
    title: '📝 समीक्षा टैब — अपनी दिक्कत और सुझाव भेजो',
    icon: MessageSquare,
    content: [
      'समीक्षा टैब में तुम अपनी दिक्कत या सुझाव लिख सकते हो।',
      '📝 अपना नाम (वैकल्पिक): नाम लिखना ज़रूरी नहीं — खाली छोड़ो तो "गुमनाम" चला जाएगा।',
      '⭐ रेटिंग: 5 स्टार में से जितने चाहो दबाओ (1 = खराब, 5 = बढ़िया)। दोबारा दबाने पर हट जाएगी।',
      'क्या दिक्कत है?: जो परेशानी आ रही है वो लिखो।',
      'क्या और जोड़ना चाहिए?: नए फ़ीचर का सुझाव लिखो।',
      '"समीक्षा भेजो" दबाओ — समीक्षा इस फ़ोन पर सेव हो जाएगी।',
      'नीचे "इस डिवाइस की समीक्षाएँ" में सारी समीक्षाएँ दिखती हैं — गलत लिखी हो तो 🗑️ से हटा दो।',
      '📤 डेवलपर तक पहुँचाने के लिए "ईमेल से भेजो" दबाओ — ईमेल ऐप खुलेगा, बस Send दबाना है।',
    ],
  },
  {
    title: '☁️ Google लॉगिन — इसके क्या फ़ायदे हैं?',
    icon: Cloud,
    content: [
      'Google से लॉगिन का मतलब: तुम्हारा दूध का डेटा तुम्हारे Google खाते के साथ क्लाउड पर सेव होता है।',
      '',
      '1️⃣ फ़ोन गया, डेटा नहीं गया:',
      '   • फ़ोन खो गया, टूट गया, या नया फ़ोन लिया — नए फ़ोन पर Google से लॉगिन करो, सारा हिसाब वापस मिल जाएगा।',
      '   • ब्राउज़र का डेटा साफ़ हो गया तो भी कुछ नहीं जाता — क्लाउड से वापस आ जाता है।',
      '   • पिन वाले खाते में डेटा सिर्फ़ उसी फ़ोन में रहता था।',
      '',
      '2️⃣ हर डिवाइस पर एक जैसा डेटा:',
      '   • फ़ोन, टैबलेट, लैपटॉप — जहाँ लॉगिन करो, वही हिसाब दिखेगा।',
      '',
      '3️⃣ अपने आप सेव — अलग से बैकअप नहीं लेना पड़ता:',
      '',
      '4️⃣ लॉगिन आसान:',
      '   • पिन याद रखने की ज़रूरत नहीं — Google खाते से एक टैप।',
      '',
      '5️⃣ सिर्फ़ तुम्हारा डेटा, तुम्हारे कंट्रोल में:',
      '   • Google सिर्फ़ तुम्हारा नाम और ईमेल माँगता है — contacts, photos, कुछ भी नहीं।',
      '   • दूसरे लोग तुम्हारा डेटा नहीं देख सकते।',
      '   • बंद करना हो तो सेटिंग → ☁️ Cloud Sync → "Google से डिसकनेक्ट करो" दबाओ।',
      '',
      '6️⃣ मुफ़्त है — कोई पैसा नहीं लगता।',
      '',
      '💡 अगर सिर्फ़ एक ही फ़ोन पर इस्तेमाल करते हो और बैकअप की चिंता नहीं, तो पिन से भी काम चल जाएगा।',
    ],
  },
]

const en: Section[] = [
  {
    title: '🥛 What is Doodh Tracker?',
    icon: Milk,
    content: [
      'This website lets you keep track of milk from your cows and buffaloes.',
      'Morning and evening — you can record both sessions separately.',
      'Everyone has their own account. Nobody else can see your data.',
      'All data is saved in your browser (phone/computer) — nothing goes to a server.',
      'The website is called "Doodh Tracker".',
    ],
  },
  {
    title: '🔐 How to login / create an account?',
    icon: LogIn,
    content: [
      'The Login screen appears first when you open the website.',
      'If you already have an account: enter your Name and PIN, then tap "Login".',
      'To create one: tap "Want a new account? Tap here", enter a name and a 4-digit PIN, then tap "Create Account".',
      'The PIN must be at least 4 digits (e.g. 1234).',
      'Remember your PIN — it is the key to your data.',
    ],
  },
  {
    title: '🔑 Forgot your PIN?',
    icon: LogIn,
    content: [
      'On the Login screen tap "Forgot PIN? Reset it".',
      'Enter the name used in your account.',
      'Enter a new PIN (4 digits).',
      'Enter the new PIN again to confirm.',
      'Tap "Change PIN" — your PIN is changed!',
      'Now login with the new PIN.',
    ],
  },
  {
    title: '🏠 Home tab — today at a glance',
    icon: Home,
    content: [
      'The Home tab shows today\'s date and today\'s total milk in litres.',
      'Morning milk and evening milk appear in separate cards.',
      'The monthly card shows this month\'s total milk and total money (if a rate is set).',
      '"Last 7 days" shows the total milk for the past week.',
      '"New Milk Entry" opens the Entry tab.',
      'Below is the list of today\'s entries — which animal, morning or evening, how many litres.',
      'If a rate is set, the money for each entry is shown too.',
    ],
  },
  {
    title: '📝 Entry tab — how to add an entry',
    icon: Plus,
    content: [
      'Use the Entry tab to add a new milk entry.',
      '📅 Date: today\'s date is filled in. Change it to record an earlier day.',
      '⏰ Time: choose "Morning" or "Evening".',
      'Animal: choose "🐄 Cow" or "🐃 Buffalo" — both options are clearly visible.',
      'Animal name (optional): you may add a name (e.g. Laxmi, Gauri). Not required. If you add names, Stats will show a separate total for each animal.',
      'Names used before appear as small buttons below — tap to select quickly.',
      '🥛 Milk (litres): enter how many litres (e.g. 2.5, 3, 1.5).',
      '💰 Amount: if a rate is set, the amount appears as you type litres (e.g. ₹100 = 2.5L × ₹40/L).',
      '📝 Note (optional): for anything worth remembering.',
      'Tap "Save Entry" — the entry is saved!',
      'All entries for that day appear below. Tap 🗑️ to delete one.',
    ],
  },
  {
    title: '📊 Stats tab — totals and charts',
    icon: BarChart3,
    content: [
      'The Stats tab shows your full totals and charts.',
      '📅 Date filter: pick "From" and "To" dates to view any period.',
      'Total Milk: litres in the selected period.',
      'Total Entries: how many entries in that period.',
      '💰 Total Money: shown if a rate is set (in ₹).',
      'Export CSV: downloads all data as a CSV file — useful for backup.',
      '🐄 Cow / 🐃 Buffalo: separate totals for each.',
      '📊 Last 7 days chart: a bar chart with morning (amber) and evening (blue).',
      '🥧 Cow vs Buffalo pie chart: what percentage came from each.',
      '🐄 Per-animal summary: if you added names, each animal\'s total milk, entries and money.',
    ],
  },
  {
    title: '⚙️ Settings tab — rate, reminder, export, import, account',
    icon: Settings,
    content: [
      'The Settings tab has 5 sections:',
      '',
      '1️⃣ 💰 Set Rate:',
      '   • Enter the cow rate (₹/litre, e.g. 40).',
      '   • Enter the buffalo rate (₹/litre, e.g. 45).',
      '   • Tap "Save Rate".',
      '   • Money now appears automatically everywhere — Home, Entry and Stats.',
      '   • If the rate is 0, no money is calculated.',
      '',
      '2️⃣ 🔔 Set Reminder:',
      '   • Morning Reminder: set a time (e.g. 06:00) and switch the toggle ON.',
      '   • Evening Reminder: set a time (e.g. 18:00) and switch the toggle ON.',
      '   • Tap "Save Reminder".',
      '   • The browser asks for notification permission — tap Allow.',
      '   • Reminders work only while the website is open in a browser.',
      '',
      '3️⃣ 📥 Data Export (Backup):',
      '   • All milk data downloads as a CSV file.',
      '   • The file opens in Excel or Google Sheets.',
      '   • Use it to restore data after changing phones or clearing the browser.',
      '',
      '4️⃣ 📤 Data Import (CSV Upload):',
      '   • Choose a CSV file you downloaded earlier.',
      '   • Tap "Upload CSV" — your old data comes back!',
      '   • Duplicate entries are skipped (same date + animal + session + litres).',
      '',
      '5️⃣ 👤 Account:',
      '   • Shows your name and total entries.',
      '   • The Logout button signs you out.',
    ],
  },
  {
    title: '💾 Where is the data saved?',
    icon: Milk,
    content: [
      'All data is saved in your browser\'s localStorage.',
      'It stays only in the browser/device where the account was created.',
      'Changing phones or clearing the browser can delete it.',
      'So download a CSV backup from Settings → Data Export now and then.',
      'Upload that CSV on a new device to get your data back.',
      'If you logged in with Google, the data is also safe in the cloud.',
    ],
  },
  {
    title: '🔄 How to back up and restore data?',
    icon: Download,
    content: [
      'BACKUP:',
      '   • Open the Settings tab.',
      '   • In "📥 Data Export (Backup)" tap "Download CSV".',
      '   • The CSV file downloads — keep it somewhere safe (Google Drive, email, etc).',
      '',
      'RESTORE:',
      '   • Create an account on the new device or browser.',
      '   • Open the Settings tab.',
      '   • In "📤 Data Import (CSV Upload)" tap "Upload CSV".',
      '   • Choose the CSV file you downloaded earlier.',
      '   • Your old data comes back!',
    ],
  },
  {
    title: '📝 Review tab — send your problems and suggestions',
    icon: MessageSquare,
    content: [
      'The Review tab lets you write a problem or a suggestion.',
      '📝 Your name (optional): not required — leave it blank to appear as "Anonymous".',
      '⭐ Rating: tap 1–5 stars (1 = bad, 5 = great). Tap the same star again to clear it.',
      'What is the problem?: describe what is going wrong.',
      'What else should be added?: suggest a new feature.',
      'Tap "Submit Review" — the review is saved on this phone.',
      'Below, "Reviews on this device" lists them — tap 🗑️ to delete a wrong one.',
      '📤 To send it to the developer, tap "Send by email" — your email app opens, just tap Send.',
    ],
  },
  {
    title: '☁️ Google Login — what are the benefits?',
    icon: Cloud,
    content: [
      'Logging in with Google means your milk data is saved to the cloud with your Google account.',
      '',
      '1️⃣ Phone gone, data not gone:',
      '   • Phone lost, broken, or replaced — login with Google on the new phone and everything comes back.',
      '   • Clearing browser data does not matter either — it restores from the cloud.',
      '   • With a PIN account the data lived only on that phone.',
      '',
      '2️⃣ Same data on every device:',
      '   • Phone, tablet, laptop — wherever you login, you see the same totals.',
      '',
      '3️⃣ Saved automatically — no separate backup needed.',
      '',
      '4️⃣ Easy login:',
      '   • No PIN to remember — one tap with your Google account.',
      '',
      '5️⃣ Only your data, under your control:',
      '   • Google only asks for your name and email — no contacts, no photos.',
      '   • Others cannot see your data.',
      '   • To stop, go to Settings → ☁️ Cloud Sync → "Disconnect Google".',
      '',
      '6️⃣ Free — no cost at all.',
      '',
      '💡 If you use only one phone and do not care about backups, the PIN account is enough.',
    ],
  },
]

const guides: Record<string, Section[]> = { hi, hinglish, en }

export default function GuideTab() {
  const lang = useLang()
  const sections = guides[lang] ?? hinglish
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const headerTitle = lang === 'hi' ? '📖 दूध ट्रैकर गाइड' : '📖 Doodh Tracker Guide'
  const headerSub =
    lang === 'hi'
      ? 'हर चीज़ विस्तार से समझाई गई है — नीचे से पढ़ो'
      : lang === 'en'
        ? 'Everything explained in detail — read below'
        : 'Har cheez detail se samjha hua — niche se padho'
  const tipTitle = lang === 'hi' ? '💡 सुझाव' : '💡 Tip'
  const tipText =
    lang === 'hi'
      ? 'कोई दिक्कत हो या कुछ समझ न आए, तो गाइड टैब देखो — सब कुछ यहाँ लिखा है!'
      : lang === 'en'
        ? 'If something is unclear or not working, check this Guide tab — it is all written here!'
        : 'Agar koi dikkat ho ya kuch samajh na aaye, toh Guide tab mein dekho — sab kuch yahan likha hai!'

  return (
    <div className="space-y-3">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800 text-center">
        <BookOpen className="text-amber-300 mx-auto mb-2" size={32} />
        <h2 className="text-white text-lg font-bold">{headerTitle}</h2>
        <p className="text-emerald-300 text-sm mt-1">{headerSub}</p>
      </div>

      {sections.map((s, i) => {
        const Icon = s.icon
        const isOpen = openIdx === i
        return (
          <div key={i} className="bg-emerald-900/40 rounded-xl border border-emerald-800 overflow-hidden">
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-emerald-900/30 transition-colors"
            >
              <Icon className="text-amber-300 shrink-0" size={20} />
              <span className="text-white text-sm font-semibold flex-1">{s.title}</span>
              {isOpen ? <ChevronUp className="text-emerald-300" size={18} /> : <ChevronDown className="text-emerald-300" size={18} />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {s.content.map((line, j) => (
                  <p key={j} className={`text-sm ${line.startsWith('   ') ? 'text-emerald-300 pl-4' : line === '' ? 'h-2' : 'text-emerald-300'}`}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-center">
        <p className="text-amber-300 text-sm font-semibold mb-1">{tipTitle}</p>
        <p className="text-emerald-300 text-xs">{tipText}</p>
      </div>
    </div>
  )
}
