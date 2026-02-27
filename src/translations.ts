export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn';

export interface Translation {
  welcome: string;
  selectPersona: string;
  delivery: string;
  mobility: string;
  freelance: string;
  walletBalance: string;
  history: string;
  creditScore: string;
  insurance: string;
  requestCredit: string;
  totalEarnings: string;
  recentTransactions: string;
  healthInsurance: string;
  assetInsurance: string;
  dailySachet: string;
  onboardingTitle: string;
  phonePlaceholder: string;
  getOtp: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    welcome: "Welcome to KaamPay",
    selectPersona: "Select your work type",
    delivery: "Instant Delivery",
    mobility: "Mobility",
    freelance: "Freelance",
    walletBalance: "Total Earnings",
    history: "History",
    creditScore: "Gig-Trust Score",
    insurance: "Insurance",
    requestCredit: "Request Credit",
    totalEarnings: "Total Earnings",
    recentTransactions: "Recent Transactions",
    healthInsurance: "Health Insurance",
    assetInsurance: "Asset Insurance",
    dailySachet: "Daily Sachet Deduction",
    onboardingTitle: "Enter Phone Number",
    phonePlaceholder: "98765 43210",
    getOtp: "Get OTP"
  },
  hi: {
    welcome: "KaamPay में आपका स्वागत है",
    selectPersona: "अपना कार्य प्रकार चुनें",
    delivery: "इंस्टेंट डिलीवरी",
    mobility: "मोबिलिटी",
    freelance: "फ्रीलांस",
    walletBalance: "कुल कमाई",
    history: "इतिहास",
    creditScore: "गिग-ट्रస్ట్ स्कोर",
    insurance: "बीमा",
    requestCredit: "क्रेडिट का अनुरोध करें",
    totalEarnings: "कुल कमाई",
    recentTransactions: "हाल के लेनदेन",
    healthInsurance: "स्वास्थ्य बीमा",
    assetInsurance: "संपत्ति बीमा",
    dailySachet: "दैनिक कटौती",
    onboardingTitle: "फ़ोन नंबर दर्ज करें",
    phonePlaceholder: "98765 43210",
    getOtp: "OTP प्राप्त करें"
  },
  mr: {
    welcome: "KaamPay मध्ये आपले स्वागत आहे",
    selectPersona: "तुमचा कामाचा प्रकार निवडा",
    delivery: "इन्स्टंट डिलिव्हरी",
    mobility: "मोबिलिटी",
    freelance: "फ्रीलांस",
    walletBalance: "एकूण कमाई",
    history: "इतिहास",
    creditScore: "गिग-ट्रस्ट स्कोर",
    insurance: "विमा",
    requestCredit: "क्रेडिटची विनंती करा",
    totalEarnings: "एकूण कमाई",
    recentTransactions: "अलीकडील व्यवहार",
    healthInsurance: "आरोग्य विमा",
    assetInsurance: "मालमत्ता विमा",
    dailySachet: "दैनिक कपात",
    onboardingTitle: "फोन नंबर प्रविष्ट करा",
    phonePlaceholder: "98765 43210",
    getOtp: "OTP मिळवा"
  },
  ta: {
    welcome: "GigPay-க்கு வரவேற்கிறோம்",
    selectPersona: "உங்கள் பணி வகையைத் தேர்ந்தெடுக்கவும்",
    delivery: "உடனடி விநியோகம்",
    mobility: "மொபிலிட்டி",
    freelance: "ஃப்ரீலான்ஸ்",
    walletBalance: "மொத்த வருமானம்",
    history: "வரலாறு",
    creditScore: "கிக்-ட்ரஸ்ட் ஸ்கோர்",
    insurance: "காப்பீடு",
    requestCredit: "கடன் கோரிக்கை",
    totalEarnings: "மொத்த வருவாய்",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    healthInsurance: "மருத்துவ காப்பீடு",
    assetInsurance: "சொத்து காப்பீடு",
    dailySachet: "தினசரி பிடித்தம்",
    onboardingTitle: "தொலைபேசி எண்ணை உள்ளிடவும்",
    phonePlaceholder: "98765 43210",
    getOtp: "OTP பெறவும்"
  },
  te: {
    welcome: "GigPay కి స్వాగతం",
    selectPersona: "మీ పని రకాన్ని ఎంచుకోండి",
    delivery: "తక్షణ డెలివరీ",
    mobility: "మొబిలిటీ",
    freelance: "ఫ్రీలాన్స్",
    walletBalance: "మొత్తం సంపాదన",
    history: "చరిత్ర",
    creditScore: "గిగ్-ట్రస్ట్ స్కోర్",
    insurance: "భీమా",
    requestCredit: "క్రెడిట్ అభ్యర్థించండి",
    totalEarnings: "మొత్తం ఆదాయం",
    recentTransactions: "ఇటీవలి లావాదేవీలు",
    healthInsurance: "ఆరోగ్య భీమా",
    assetInsurance: "ఆస్తి భీమా",
    dailySachet: "రోజువారీ తగ్గింపు",
    onboardingTitle: "ఫోన్ నంబర్ నమోదు చేయండి",
    phonePlaceholder: "98765 43210",
    getOtp: "OTP పొందండి"
  },
  bn: {
    welcome: "KaamPay-এ আপনাকে স্বাগতম",
    selectPersona: "আপনার কাজের ধরন নির্বাচন করুন",
    delivery: "ইনস্ট্যান্ট ডেলিভারি",
    mobility: "মোবিলিটি",
    freelance: "ফ্রিল্যান্স",
    walletBalance: "মোট আয়",
    history: "ইতিহাস",
    creditScore: "গিগ-ট্রাস্ট স্কোর",
    insurance: "বীমা",
    requestCredit: "ক্রেডিট অনুরোধ করুন",
    totalEarnings: "মোট আয়",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    healthInsurance: "স্বাস্থ্য বীমা",
    assetInsurance: "সম্পত্তি বীমা",
    dailySachet: "দৈনিক কর্তন",
    onboardingTitle: "ফোন নম্বর লিখুন",
    phonePlaceholder: "98765 43210",
    getOtp: "OTP পান"
  }
};
