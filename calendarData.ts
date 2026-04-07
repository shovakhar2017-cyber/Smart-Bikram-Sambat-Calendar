import { Holiday, Quote } from '../types';

export const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

export const BS_MONTHS_EN = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export const AD_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS_NP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
export const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Major public holidays of Nepali year 2083 from official Nepal Rajpatra
export const HOLIDAYS_2083: Holiday[] = [
  { 
    date: '2083-01-01', 
    nameNp: 'नयाँ वर्ष', 
    nameEn: 'New Year', 
    descriptionNp: 'विक्रम संवत २०८३ को पहिलो दिन।',
    descriptionEn: 'First day of the Bikram Sambat year 2083.',
    isPublic: true 
  },
  { 
    date: '2083-01-18', 
    nameNp: 'बुद्ध जयन्ती / उभौली पर्व / चण्डी पूर्णिमा / विश्व मजदुर दिवस', 
    nameEn: 'Buddha Jayanti / Ubhauli Parva / Chandi Purnima / May Day', 
    descriptionNp: 'भगवान बुद्धको जन्मजयन्ती र अन्तर्राष्ट्रिय मजदुर दिवस।',
    descriptionEn: 'Birth anniversary of Lord Buddha and International Workers\' Day.',
    isPublic: true 
  },
  { 
    date: '2083-02-15', 
    nameNp: 'गणतन्त्र दिवस', 
    nameEn: 'Republic Day', 
    descriptionNp: 'नेपालमा गणतन्त्र स्थापना भएको दिन।',
    descriptionEn: 'Day celebrating the establishment of Republic in Nepal.',
    isPublic: true 
  },
  { 
    date: '2083-05-12', 
    nameNp: 'रक्षाबन्धन', 
    nameEn: 'Rakshabandhan', 
    isPublic: true 
  },
  { 
    date: '2083-05-13', 
    nameNp: 'गाईजात्रा', 
    nameEn: 'Gaijatra', 
    descriptionEn: 'Kathmandu Valley & Newar Community only',
    isPublic: true 
  },
  { 
    date: '2083-05-19', 
    nameNp: 'श्रीकृष्ण जन्माष्टमी / गौरा पर्व', 
    nameEn: 'Shree Krishna Janmashtami / Gaura Parva', 
    isPublic: true 
  },
  { 
    date: '2083-05-29', 
    nameNp: 'हरितालिका (तीज)', 
    nameEn: 'Haritalika (Teej)', 
    descriptionEn: 'Women only',
    isPublic: true 
  },
  { 
    date: '2083-06-03', 
    nameNp: 'संविधान दिवस', 
    nameEn: 'Constitution Day', 
    isPublic: true 
  },
  { 
    date: '2083-06-09', 
    nameNp: 'इन्द्रजात्रा', 
    nameEn: 'Indrajatra', 
    descriptionEn: 'Kathmandu Valley only',
    isPublic: true 
  },
  { 
    date: '2083-06-18', 
    nameNp: 'जितिया पर्व', 
    nameEn: 'Jitiya Parva', 
    descriptionEn: 'Women only',
    isPublic: true 
  },
  { 
    date: '2083-06-25', 
    nameNp: 'घटस्थापना', 
    nameEn: 'Ghatasthapana', 
    isPublic: true 
  },
  { 
    date: '2083-06-31', 
    nameNp: 'दशैँ बिदा (फूलपाती)', 
    nameEn: 'Dashain Holiday (Phulpati)', 
    isPublic: true 
  },
  { 
    date: '2083-07-01', 
    nameNp: 'दशैँ बिदा (महाअष्टमी)', 
    nameEn: 'Dashain Holiday (Maha Ashtami)', 
    isPublic: true 
  },
  { 
    date: '2083-07-02', 
    nameNp: 'दशैँ बिदा (महानवमी)', 
    nameEn: 'Dashain Holiday (Maha Navami)', 
    isPublic: true 
  },
  { 
    date: '2083-07-03', 
    nameNp: 'दशैँ बिदा (विजया दशमी)', 
    nameEn: 'Dashain Holiday (Vijaya Dashami)', 
    isPublic: true 
  },
  { 
    date: '2083-07-04', 
    nameNp: 'दशैँ बिदा (एकादशी)', 
    nameEn: 'Dashain Holiday (Ekadashi)', 
    isPublic: true 
  },
  { 
    date: '2083-07-05', 
    nameNp: 'दशैँ बिदा (द्वादशी)', 
    nameEn: 'Dashain Holiday (Dwadashi)', 
    isPublic: true 
  },
  { 
    date: '2083-07-22', 
    nameNp: 'तिहार बिदा (लक्ष्मी पूजा)', 
    nameEn: 'Tihar Holiday (Laxmi Puja)', 
    isPublic: true 
  },
  { 
    date: '2083-07-23', 
    nameNp: 'तिहार बिदा (गाइपूजा/गोवर्धन पूजा)', 
    nameEn: 'Tihar Holiday (Gai Puja/Govardhan Puja)', 
    isPublic: true 
  },
  { 
    date: '2083-07-24', 
    nameNp: 'तिहार बिदा (भाइटीका)', 
    nameEn: 'Tihar Holiday (Bhai Tika)', 
    isPublic: true 
  },
  { 
    date: '2083-07-25', 
    nameNp: 'तिहार बिदा / फाल्गुनन्द जयन्ती', 
    nameEn: 'Tihar Holiday / Falgunanda Jayanti', 
    isPublic: true 
  },
  { 
    date: '2083-07-26', 
    nameNp: 'तिहार बिदा', 
    nameEn: 'Tihar Holiday', 
    isPublic: true 
  },
  { 
    date: '2083-07-29', 
    nameNp: 'छठ पर्व', 
    nameEn: 'Chhath Parva', 
    isPublic: true 
  },
  { 
    date: '2083-09-09', 
    nameNp: 'धान्य पूर्णिमा / उधौली पर्व / योमरी पुन्ही / ज्यापू दिवस', 
    nameEn: 'Dhanya Purnima / Udhauli Parva / Yomari Punhi / Jyapu Diwas', 
    isPublic: true 
  },
  { 
    date: '2083-09-10', 
    nameNp: 'क्रिसमस डे', 
    nameEn: 'Christmas Day', 
    isPublic: true 
  },
  { 
    date: '2083-09-15', 
    nameNp: 'तमू ल्होसार / दुरा म्हेयु नकुमा', 
    nameEn: 'Tamu Lhosar / Dura Mhyu Nakuma', 
    isPublic: true 
  },
  { 
    date: '2083-09-27', 
    nameNp: 'पृथ्वी जयन्ती', 
    nameEn: 'Prithvi Jayanti', 
    isPublic: true 
  },
  { 
    date: '2083-10-01', 
    nameNp: 'माघी पर्व / माघे संक्रान्ति', 
    nameEn: 'Maghi Parva / Maghe Sankranti', 
    isPublic: true 
  },
  { 
    date: '2083-10-16', 
    nameNp: 'शहीद दिवस', 
    nameEn: 'Sahid Diwas', 
    isPublic: true 
  },
  { 
    date: '2083-10-24', 
    nameNp: 'सोनम ल्होसार', 
    nameEn: 'Sonam Lhosar', 
    isPublic: true 
  },
  { 
    date: '2083-10-28', 
    nameNp: 'वसन्त पञ्चमी', 
    nameEn: 'Basant Panchami', 
    descriptionEn: 'Educational Institutions only',
    isPublic: true 
  },
  { 
    date: '2083-11-07', 
    nameNp: 'राष्ट्रिय प्रजातन्त्र दिवस', 
    nameEn: 'National Democracy Day', 
    isPublic: true 
  },
  { 
    date: '2083-11-22', 
    nameNp: 'महाशिवरात्रि', 
    nameEn: 'Mahashivaratri', 
    isPublic: true 
  },
  { 
    date: '2083-11-24', 
    nameNp: 'अन्तर्राष्ट्रिय महिला दिवस', 
    nameEn: 'International Women\'s Day', 
    isPublic: true 
  },
  { 
    date: '2083-11-25', 
    nameNp: 'ग्याल्पो ल्होसार', 
    nameEn: 'Gyalpo Lhosar', 
    isPublic: true 
  },
  { 
    date: '2083-12-07', 
    nameNp: 'फागु पूर्णिमा (पहाडी जिल्ला)', 
    nameEn: 'Fagu Purnima (Hilly Districts)', 
    isPublic: true 
  },
  { 
    date: '2083-12-08', 
    nameNp: 'फागु पूर्णिमा (तराई जिल्ला)', 
    nameEn: 'Fagu Purnima (Terai Districts)', 
    isPublic: true 
  },
  { 
    date: '2083-12-23', 
    nameNp: 'घोडेजात्रा', 
    nameEn: 'Ghodejatra', 
    descriptionEn: 'Kathmandu Valley only',
    isPublic: true 
  },
];

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    textNp: "सफलताको रहस्य भनेको काम सुरु गर्नु हो।",
    textEn: "The secret of getting ahead is getting started.",
    authorNp: "मार्क ट्वेन",
    authorEn: "Mark Twain"
  },
  {
    textNp: "जहाँ इच्छा हुन्छ, त्यहाँ उपाय हुन्छ।",
    textEn: "Where there's a will, there's a way.",
    authorNp: "नेपाली उखान",
    authorEn: "Nepali Proverb"
  },
  {
    textNp: "समय नै धन हो।",
    textEn: "Time is money.",
    authorNp: "बेन्जामिन फ्र्याङ्कलिन",
    authorEn: "Benjamin Franklin"
  },
  {
    textNp: "कडा परिश्रमको विकल्प छैन।",
    textEn: "There is no substitute for hard work.",
    authorNp: "थोमस एडिसन",
    authorEn: "Thomas Edison"
  }
];

export const NEPAL_THEMED_IMAGES = [
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop', // Everest
  'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000&auto=format&fit=crop', // Boudhanath
  'https://images.unsplash.com/photo-1623492701902-47dc207df5dc?q=80&w=1000&auto=format&fit=crop', // Pokhara
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop', // Kathmandu Durbar Square
  'https://images.unsplash.com/photo-1526716173434-a2b566c666df?q=80&w=1000&auto=format&fit=crop', // Annapurna
  'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=1000&auto=format&fit=crop', // Temple
];
