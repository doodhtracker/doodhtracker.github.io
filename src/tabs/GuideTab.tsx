import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Home, Plus, BarChart3, Settings, Milk, LogIn, Download, MessageSquare, Cloud, Heart } from 'lucide-react'
import { useLang, useT } from '../i18n'
import { useStore } from '../store'

interface Section {
  title: string
  icon: React.ElementType
  content: string[]
}
const hinglish: Section[] = [
  {
    title: '🥛 Ye website kya hai?',
    icon: Milk,
    content: [
      'Ye ek chhoti si website hai — doodh ka hisaab rakhne ke liye.',
      'Jaise pehle kagaz ki copy mein likhte the, waise hi ab phone mein likho.',
      'Gaay aur bhains ka doodh — subah ka alag, shaam ka alag.',
      'Sab hisaab phone mein hi rehta hai. Koi doosra nahi dekh sakta.',
    ],
  },
  {
    title: '📱 Sabse pehle — bhasha chuno',
    icon: LogIn,
    content: [
      'Upar daahine taraf teen chhote akshar dikhenge: हि , Hg , En',
      'हि = poori Hindi.',
      'Hg = Hindi aur English mila hua.',
      'En = poori English.',
      'Jo tumhe samajh mein aaye, wahi dabao.',
      'Kabhi bhi badal sakte ho — kuch bigdega nahi.',
    ],
  },
  {
    title: '🔐 Khata kholo ya naya banao',
    icon: LogIn,
    content: [
      'Pehli baar aaye ho? "Naya khata banana hai? Yahan dabao" dabao.',
      'Apna naam likho (jaise Ramesh).',
      'Chaar ank ka PIN banao (jaise 1234). PIN yaad rakhna.',
      '"Khata banao" dabao — bas, khul jayega.',
      'Doosri baar se: naam aur PIN daalo, "Login" dabao.',
      'PIN bhool gaye? "PIN bhool gaye? Reset karo" dabao — naya PIN bana lo.',
    ],
  },
  {
    title: '☁️ Google se judna — sabse aasan tarika',
    icon: Cloud,
    content: [
      'Google se judo to doodh ka hisaab Google mein safe rehta hai.',
      'Phone kho gaya, toot gaya, ya naya phone liya — naye phone pe Google se login karo, saara hisaab wapas mil jayega.',
      'Ghar pe entry ki, dukaan pe jaake dekh li — dono jagah same hisaab.',
      'Google se judne ke liye: Settings kholo, "Google se connect karo" dabao, apna Google account chuno.',
      'Sirf naam aur email maangta hai — aur kuch nahi.',
      'Na judo to bhi chalega — par tab hisaab sirf isi phone mein rahega.',
    ],
  },
  {
    title: '🏠 Home — aaj ka hisaab',
    icon: Home,
    content: [
      'Kholte hi aaj ka doodh dikhega — kitne litre.',
      'Subah ka alag, shaam ka alag.',
      'Neeche mahine ka hisaab — kitna doodh, kitna paisa.',
      'Uske neeche "Pichhle 7 din" — ek hafte ka total.',
      '"Naya Doodh Entry" ka peela button dabao — seedha likhne ki jagah khul jayegi.',
      'Neeche aaj ki saari entries dikhengi.',
    ],
  },
  {
    title: '➕ Entry — doodh kaise likhein',
    icon: Plus,
    content: [
      'Entry tab kholo.',
      'Tareekh: aaj ki hai. Pichhle din ka likhna ho to tareekh badlo.',
      'Subah ya Shaam — jo ho, wahi dabao.',
      'Gaay ya Bhains — jo ho, wahi dabao.',
      'Janwar ka naam likhna zaroori nahi. Likhoge to har janwar ka alag hisaab milega.',
      'Kitne litre doodh tha, wo likho (jaise 2.5 ya 3).',
      '"Entry Save Karo" dabao — likh gaya.',
      'Rate laga rakha hai to paisa khud dikh jayega.',
      'Galti ho gayi? Neeche entry ke aage 🗑️ dabao — hat jayegi.',
    ],
  },
  {
    title: '📊 Aankde — poora hisaab',
    icon: BarChart3,
    content: [
      'Yahan poora hisaab ek jagah dikhta hai.',
      '"Se" aur "Tak" tareekh daalo — us beech ka hisaab dekh lo.',
      'Kitna doodh, kitni entry, kitna paisa — sab dikhega.',
      'Neeche chart hai — subah ka peela, shaam ka neela.',
      'Gaay ka doodh aur bhains ka doodh alag alag.',
      'Janwar ka naam likha tha to har janwar ka alag hisaab bhi milega.',
    ],
  },
  {
    title: '⚙️ Setting — rate aur reminder',
    icon: Settings,
    content: [
      'Rate: gaay ka rate likho (jaise 40), bhains ka rate likho (jaise 45).',
      '"Rate Save Karo" dabao — ab har jagah paisa khud dikhega.',
      'Rate 0 chhoda to paisa nahi dikhega.',
      '',
      'Reminder: subah ka time set karo (jaise 06:00) aur toggle chalu karo.',
      'Shaam ka time set karo (jaise 18:00) aur toggle chalu karo.',
      '"Reminder Save Karo" dabao. Phone permission maangega — Allow kar do.',
      'Reminder tabhi aayega jab website phone mein khuli ho.',
    ],
  },
  {
    title: '💾 Hisaab kahin kho na jaye',
    icon: Download,
    content: [
      'Do tarike hain — dono kar lena achha hai.',
      '',
      '1) Google se judo (sabse aasan):',
      '   • Hisaab apne aap Google mein save hota rehta hai.',
      '   • Phone badla to naye phone pe Google se login karo — hisaab wapas.',
      '',
      '2) File nikaal ke rakho (doosra tarika):',
      '   • Settings mein "CSV Download Karo" dabao.',
      '   • Ek file utar jayegi — usko sambhal ke rakho (Google Drive, email).',
      '   • Naye phone pe "CSV Upload Karo" dabao aur wahi file chuno — hisaab wapas.',
    ],
  },
  {
    title: '📝 Review — apni baat likho',
    icon: MessageSquare,
    content: [
      'Koi dikkat aa rahi ho, ya kuch naya chahiye — Review tab mein likho.',
      'Naam likhna zaroori nahi.',
      'Phir "Email se bhejo" dabao — seedha Sheebu ke email par chala jayega.',
      'Pasand aayi ho to bhi do line likh do — Sheebu ko achha lagega.',
      'Sheebu ka plan hai iska app bana ke laane ka.',
    ],
  },
]

const hi: Section[] = [
  {
    title: '🥛 यह वेबसाइट क्या है?',
    icon: Milk,
    content: [
      'यह एक छोटी सी वेबसाइट है — दूध का हिसाब रखने के लिए।',
      'जैसे पहले कागज़ की कॉपी में लिखते थे, वैसे ही अब फ़ोन में लिखो।',
      'गाय और भैंस का दूध — सुबह का अलग, शाम का अलग।',
      'सारा हिसाब फ़ोन में ही रहता है। कोई दूसरा नहीं देख सकता।',
    ],
  },
  {
    title: '📱 सबसे पहले — भाषा चुनो',
    icon: LogIn,
    content: [
      'ऊपर दाहिनी तरफ़ तीन छोटे अक्षर दिखेंगे: हि , Hg , En',
      'हि = पूरी हिंदी।',
      'Hg = हिंदी और अंग्रेज़ी मिला हुआ।',
      'En = पूरी अंग्रेज़ी।',
      'जो तुम्हें समझ में आए, वही दबाओ।',
      'कभी भी बदल सकते हो — कुछ बिगड़ेगा नहीं।',
    ],
  },
  {
    title: '🔐 खाता खोलो या नया बनाओ',
    icon: LogIn,
    content: [
      'पहली बार आए हो? "नया खाता बनाना है? यहाँ दबाओ" दबाओ।',
      'अपना नाम लिखो (जैसे रमेश)।',
      'चार अंक का पिन बनाओ (जैसे 1234)। पिन याद रखना।',
      '"खाता बनाओ" दबाओ — बस, खुल जाएगा।',
      'दूसरी बार से: नाम और पिन डालो, "लॉगिन" दबाओ।',
      'पिन भूल गए? "पिन भूल गए? रीसेट करो" दबाओ — नया पिन बना लो।',
    ],
  },
  {
    title: '☁️ Google से जुड़ना — सबसे आसान तरीका',
    icon: Cloud,
    content: [
      'Google से जुड़ो तो दूध का हिसाब Google में सुरक्षित रहता है।',
      'फ़ोन खो गया, टूट गया, या नया फ़ोन लिया — नए फ़ोन पर Google से लॉगिन करो, सारा हिसाब वापस मिल जाएगा।',
      'घर पर एंट्री की, दुकान पर जाकर देख ली — दोनों जगह एक जैसा हिसाब।',
      'Google से जुड़ने के लिए: सेटिंग खोलो, "Google से कनेक्ट करो" दबाओ, अपना Google खाता चुनो।',
      'सिर्फ़ नाम और ईमेल माँगता है — और कुछ नहीं।',
      'न जुड़ो तो भी चलेगा — पर तब हिसाब सिर्फ़ इसी फ़ोन में रहेगा।',
    ],
  },
  {
    title: '🏠 होम — आज का हिसाब',
    icon: Home,
    content: [
      'खोलते ही आज का दूध दिखेगा — कितने लीटर।',
      'सुबह का अलग, शाम का अलग।',
      'नीचे महीने का हिसाब — कितना दूध, कितना पैसा।',
      'उसके नीचे "पिछले 7 दिन" — एक हफ़्ते का जोड़।',
      '"नई दूध एंट्री" का पीला बटन दबाओ — सीधे लिखने की जगह खुल जाएगी।',
      'नीचे आज की सारी एंट्रीज़ दिखेंगी।',
    ],
  },
  {
    title: '➕ एंट्री — दूध कैसे लिखें',
    icon: Plus,
    content: [
      'एंट्री टैब खोलो।',
      'तारीख़: आज की है। पिछले दिन का लिखना हो तो तारीख़ बदलो।',
      'सुबह या शाम — जो हो, वही दबाओ।',
      'गाय या भैंस — जो हो, वही दबाओ।',
      'जानवर का नाम लिखना ज़रूरी नहीं। लिखोगे तो हर जानवर का अलग हिसाब मिलेगा।',
      'कितने लीटर दूध था, वो लिखो (जैसे 2.5 या 3)।',
      '"एंट्री सेव करो" दबाओ — लिख गया।',
      'रेट लगा रखा है तो पैसा खुद दिख जाएगा।',
      'गलती हो गई? नीचे एंट्री के आगे 🗑️ दबाओ — हट जाएगी।',
    ],
  },
  {
    title: '📊 आँकड़े — पूरा हिसाब',
    icon: BarChart3,
    content: [
      'यहाँ पूरा हिसाब एक जगह दिखता है।',
      '"से" और "तक" तारीख़ डालो — उस बीच का हिसाब देख लो।',
      'कितना दूध, कितनी एंट्री, कितना पैसा — सब दिखेगा।',
      'नीचे चार्ट है — सुबह का पीला, शाम का नीला।',
      'गाय का दूध और भैंस का दूध अलग अलग।',
      'जानवर का नाम लिखा था तो हर जानवर का अलग हिसाब भी मिलेगा।',
    ],
  },
  {
    title: '⚙️ सेटिंग — रेट और रिमाइंडर',
    icon: Settings,
    content: [
      'रेट: गाय का रेट लिखो (जैसे 40), भैंस का रेट लिखो (जैसे 45)।',
      '"रेट सेव करो" दबाओ — अब हर जगह पैसा खुद दिखेगा।',
      'रेट 0 छोड़ा तो पैसा नहीं दिखेगा।',
      '',
      'रिमाइंडर: सुबह का समय सेट करो (जैसे 06:00) और टॉगल चालू करो।',
      'शाम का समय सेट करो (जैसे 18:00) और टॉगल चालू करो।',
      '"रिमाइंडर सेव करो" दबाओ। फ़ोन अनुमति माँगेगा — Allow कर दो।',
      'रिमाइंडर तभी आएगा जब वेबसाइट फ़ोन में खुली हो।',
    ],
  },
  {
    title: '💾 हिसाब कहीं खो न जाए',
    icon: Download,
    content: [
      'दो तरीके हैं — दोनों कर लेना अच्छा है।',
      '',
      '1) Google से जुड़ो (सबसे आसान):',
      '   • हिसाब अपने आप Google में सेव होता रहता है।',
      '   • फ़ोन बदला तो नए फ़ोन पर Google से लॉगिन करो — हिसाब वापस।',
      '',
      '2) फ़ाइल निकाल के रखो (दूसरा तरीका):',
      '   • सेटिंग में "CSV डाउनलोड करो" दबाओ।',
      '   • एक फ़ाइल उतर जाएगी — उसको सँभाल के रखो (Google Drive, ईमेल)।',
      '   • नए फ़ोन पर "CSV अपलोड करो" दबाओ और वही फ़ाइल चुनो — हिसाब वापस।',
    ],
  },
  {
    title: '📝 समीक्षा — अपनी बात लिखो',
    icon: MessageSquare,
    content: [
      'कोई दिक्कत आ रही हो, या कुछ नया चाहिए — समीक्षा टैब में लिखो।',
      'नाम लिखना ज़रूरी नहीं।',
      'फिर "ईमेल से भेजो" दबाओ — सीधे शीबू के ईमेल पर चला जाएगा।',
      'पसंद आई हो तो भी दो लाइन लिख दो — शीबू को अच्छा लगेगा।',
      'शीबू का प्लान है इसका ऐप बना के लाने का।',
    ],
  },
]

const en: Section[] = [
  {
    title: '🥛 What is this website?',
    icon: Milk,
    content: [
      'A small website to keep the milk account.',
      'Just like writing in a paper notebook, now write on the phone.',
      'Cow and buffalo milk — morning separate, evening separate.',
      'Everything stays on your phone. Nobody else can see it.',
    ],
  },
  {
    title: '📱 First — pick your language',
    icon: LogIn,
    content: [
      'At the top right you will see three small buttons: हि , Hg , En',
      'हि = full Hindi.',
      'Hg = Hindi mixed with English.',
      'En = full English.',
      'Tap whichever you understand best.',
      'You can change it any time — nothing breaks.',
    ],
  },
  {
    title: '🔐 Open an account or make a new one',
    icon: LogIn,
    content: [
      'First time here? Tap "Want a new account? Tap here".',
      'Write your name (for example Ramesh).',
      'Make a 4-digit PIN (for example 1234). Remember it.',
      'Tap "Create Account" — that is it, it opens.',
      'Next time: enter name and PIN, tap "Login".',
      'Forgot the PIN? Tap "Forgot PIN? Reset it" and make a new one.',
    ],
  },
  {
    title: '☁️ Connect with Google — the easiest way',
    icon: Cloud,
    content: [
      'If you connect with Google, the milk account stays safe in Google.',
      'Phone lost, broken, or replaced — login with Google on the new phone and everything comes back.',
      'Entered at home, checked at the shop — same account in both places.',
      'To connect: open Settings, tap "Connect with Google", choose your Google account.',
      'It only asks for your name and email — nothing else.',
      'You can skip it too — but then the account stays only on this phone.',
    ],
  },
  {
    title: '🏠 Home — today at a glance',
    icon: Home,
    content: [
      'As soon as you open it, today milk shows — how many litres.',
      'Morning separate, evening separate.',
      'Below is the month account — how much milk, how much money.',
      'Under that, "Last 7 days" — the week total.',
      'Tap the yellow "New Milk Entry" button — the writing screen opens.',
      'All of today entries are listed below.',
    ],
  },
  {
    title: '➕ Entry — how to write milk',
    icon: Plus,
    content: [
      'Open the Entry tab.',
      'Date: today is filled in. Change it for an earlier day.',
      'Morning or Evening — tap the one you need.',
      'Cow or Buffalo — tap the one you need.',
      'Animal name is optional. If you add it, each animal gets its own account.',
      'Write how many litres (for example 2.5 or 3).',
      'Tap "Save Entry" — done.',
      'If a rate is set, the money shows by itself.',
      'Made a mistake? Tap 🗑️ next to the entry — it is removed.',
    ],
  },
  {
    title: '📊 Stats — the full account',
    icon: BarChart3,
    content: [
      'The whole account shows in one place here.',
      'Put "From" and "To" dates — see that period.',
      'How much milk, how many entries, how much money — all visible.',
      'Below is a chart — morning in yellow, evening in blue.',
      'Cow milk and buffalo milk shown separately.',
      'If you added animal names, each animal gets its own total too.',
    ],
  },
  {
    title: '⚙️ Settings — rate and reminder',
    icon: Settings,
    content: [
      'Rate: write the cow rate (for example 40) and the buffalo rate (for example 45).',
      'Tap "Save Rate" — money now shows everywhere by itself.',
      'If the rate is 0, no money is shown.',
      '',
      'Reminder: set the morning time (for example 06:00) and switch the toggle on.',
      'Set the evening time (for example 18:00) and switch the toggle on.',
      'Tap "Save Reminder". The phone asks for permission — tap Allow.',
      'The reminder comes only while the website is open on the phone.',
    ],
  },
  {
    title: '💾 Do not lose the account',
    icon: Download,
    content: [
      'There are two ways — doing both is best.',
      '',
      '1) Connect with Google (easiest):',
      '   • The account saves to Google by itself.',
      '   • Changed the phone? Login with Google on the new phone — it comes back.',
      '',
      '2) Keep a file (the other way):',
      '   • In Settings tap "Download CSV".',
      '   • A file downloads — keep it safe (Google Drive, email).',
      '   • On a new phone tap "Upload CSV" and choose that file — the account comes back.',
    ],
  },
  {
    title: '📝 Review — write your view',
    icon: MessageSquare,
    content: [
      'If something is not working, or you want a new feature — write it in the Review tab.',
      'The name is optional.',
      'Then tap "Send by email" — it goes straight to Sheebu email.',
      'If you liked it, write two lines too — Sheebu will be happy.',
      'Sheebu plans to bring out an app version.',
    ],
  },
]

const guides: Record<string, Section[]> = { hi, hinglish, en }

export default function GuideTab() {
  const lang = useLang()
  const t = useT()
  const setActiveTab = useStore((s) => s.setActiveTab)
  const sections = guides[lang] ?? hinglish
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const headerTitle = lang === 'hi' ? '📖 दूध ट्रैकर गाइड' : '📖 Doodh Tracker Guide'
  const headerSub =
    lang === 'hi'
      ? 'एक बार पढ़ लो — सब समझ आ जाएगा'
      : lang === 'en'
        ? 'Read it once — you will understand everything'
        : 'Ek baar padh lo — sab samajh aa jayega'
  const tipTitle = lang === 'hi' ? '💡 सुझाव' : '💡 Tip'
  const tipText =
    lang === 'hi'
      ? 'कोई बात समझ न आए तो वो हिस्सा फिर से पढ़ो — या समीक्षा में पूछ लो।'
      : lang === 'en'
        ? 'If something is not clear, read that part again — or ask in Review.'
        : 'Koi baat samajh na aaye to wo hissa phir se padho — ya Review mein poochh lo.'

  return (
    <div className="space-y-3">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800 text-center">
        <BookOpen className="text-amber-300 mx-auto mb-2" size={32} />
        <h2 className="text-white text-lg font-bold">{headerTitle}</h2>
        <p className="text-emerald-300 text-sm mt-1">{headerSub}</p>
      </div>


      {/* ─── Sheebu ki taraf se ─── */}
      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">{t('about.title')}</h3>
        </div>
        <p className="text-emerald-300 text-sm leading-relaxed mb-2">{t('about.text')}</p>
        <p className="text-emerald-300 text-sm leading-relaxed mb-3">{t('about.review')}</p>
        <button
          onClick={() => setActiveTab('review')}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <MessageSquare size={16} /> {t('about.btn')}
        </button>
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
