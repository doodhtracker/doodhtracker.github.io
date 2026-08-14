import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Home, Plus, BarChart3, Settings, Milk, LogIn, Wallet, Bell, Download, Upload } from 'lucide-react'

interface Section {
  title: string
  icon: React.ElementType
  content: string[]
}

const sections: Section[] = [
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
      'PIN yaad rakho — yeh aapke data ki chhabi hai.',
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
      '⏰ Time: "Subah" ya "Shaam" select karo. Subah = morning, Shaam = evening.',
      'Janwar: "🐄 Gaay" ya "🐃 Bhains" select karo — dono options clearly dikhte hain.',
      'Janwar ka Naam (optional): Agar chaaho toh janwar ka naam daal sakte ho (jaise Laxmi, Gauri). Zaroori nahi hai. Agar naam daaloge toh Stats mein har janwar ka alag se hisaab milega.',
      'Agar pehle koi naam daala tha toh neeche chote buttons mein dikhega — click karke quickly select kar sakte ho.',
      '🥛 Doodh (litre): Kitne litre doodh tha woh daalo (jaise 2.5, 3, 1.5).',
      '💰 Paisa Preview: Agar rate set kiya hai Settings mein, toh litre daalte hi paisa dikhega (jaise ₹100 = 2.5L × ₹40/L).',
      '📝 Note (optional): Koi khaat baat likhna ho toh (jaise "aadha litre gir gaya").',
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
      'CSV Export Karo: Yeh button dabane se saara data CSV file mein download ho jayega — backup ke liye.',
      '🐄 Gaay / 🐃 Bhains: Alag-alag se total litre dikhta hai.',
      '📊 Pichhle 7 Din Chart: 7 din ka bar chart — subah (amber) aur shaam (blue) alag se.',
      '🥧 Gaay vs Bhains Pie Chart: Kitna percent gaay ka doodh, kitna percent bhains ka.',
      '🐄 Janwar-wise Hisaab: Agar naam daala tha entry mein toh har janwar ka alag se total — kaunse janwar se kitna doodh mila, kitne entries, kitna paisa.',
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
      '   • Agar koi entry pehle se hai toh duplicate nahi hoga (same date+janwar+session+litre wali entry skip ho jayegi).',
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
      'Data kisi server pe nahi jata — bilkul private hai.',
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
]

export default function GuideTab() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800 text-center">
        <BookOpen className="text-amber-300 mx-auto mb-2" size={32} />
        <h2 className="text-white text-lg font-bold">📖 Doodh Tracker Guide</h2>
        <p className="text-emerald-400 text-sm mt-1">Har cheez Hindi mein detail se samjha hua — niche se padho</p>
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
              {isOpen ? <ChevronUp className="text-emerald-400" size={18} /> : <ChevronDown className="text-emerald-400" size={18} />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {s.content.map((line, j) => (
                  <p key={j} className={`text-sm ${line.startsWith('   ') ? 'text-emerald-400 pl-4' : line === '' ? 'h-2' : 'text-emerald-300'}`}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-center">
        <p className="text-amber-300 text-sm font-semibold mb-1">💡 Tip</p>
        <p className="text-emerald-300 text-xs">
          Agar koi dikkat ho ya kuch samajh na aaye, toh Guide tab mein dekho — sab kuch yahan likha hai!
        </p>
      </div>
    </div>
  )
}
