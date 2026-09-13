export const SITE = {
  name:     'Rise & Shine Academy',
  tagline:  'Empowering every student with creativity, confidence, and academic excellence.',
  email:    'riseandshine462@gmail.com',
  phones: [
    '+91 90621 41212',
    '+91 77187 18586',
    '+91 80167 39938',
    '+91 94747 94633',
  ],
  phone:    '+91 90621 41212',
  address:  'Station Road, Harish Chandra Pur, Malda, WB — 732125',
  addressKP:'Near NH-31, Kashim Pur, Malda, WB',
  instagram:'https://www.instagram.com/riseandshine_2017',
  facebook: 'https://www.facebook.com/p/Rise-Shine-Academy-HCP-100054533256269/',
  mapHCP:   'https://www.google.com/maps?q=Harishchandrapur,+Malda,+WB+732125',
  mapKSP:   'https://www.google.com/maps?q=Kashimpur,+Harishchandrapur,+Malda,+WB',
};

export const NAV_LINKS = [
  { to: '/',         label: 'Home'         },
  { to: '/why-us',   label: 'Why Us'       },
  { to: '/about',    label: 'About Us'     },
  { to: '/programs', label: 'Programs'     },
  { to: '/fee',      label: 'Fee Structure'},
  { to: '/campus',   label: 'Campuses'     },
  { to: '/contact',  label: 'Contact'      },
];

export const STATS = [
  { num: 1000, suffix: '+', label: 'Learners Annually'          },
  { num: 20,   suffix: '+', label: 'Expert Mentors'             },
  { num: 100,  suffix: '%', label: 'English Environment'        },
  { num: 10,   suffix: '+', label: 'Co-curriculum Activities'   },
  { num: null,  text: '11 May', label: 'Next Batch Starts'      },
];

export const WHY_CARDS = [
  { icon: '📱', title: 'Modern Curriculum',      color: 'c1', desc: 'Balanced academics with technology, arts, and character education — including foundations for competitive exams.' },
  { icon: '🛡️', title: 'Safe Campus',            color: 'c2', desc: 'CCTV-monitored, gated campus where every student feels secure, supported, and inspired.'                       },
  { icon: '🏫', title: 'Offline Coaching',       color: 'c3', desc: 'Extra offline sessions for students who need personalised academic attention and support.'                      },
  { icon: '👩‍🏫', title: 'Experienced Educators', color: 'c4', desc: "Passionate, qualified teachers dedicated to nurturing each child's unique potential every day."                },
  { icon: '🌟', title: 'Holistic Development',   color: 'c5', desc: 'Academics, creativity, physical health, and emotional well-being — all nurtured under one roof.'               },
  { icon: '🏆', title: 'Olympiad Programme',     color: 'c6', desc: 'Designed for Olympiad aspirants — think critically and stand out on a national stage.'                         },
];

// SR Secondary clearly marked as Under Development
export const PROGRAMS = [
  {
    emoji: '🌱', badge: 'eKidz',
    range: 'Nursery to KG2',
    bg: '#FDE68A',
    desc: 'Play-based learning for foundational skills, social growth, strong literacy, and numeracy.',
    status: 'active',
  },
  {
    emoji: '🚀', badge: 'eChamps',
    range: 'Classes 1 to 5',
    bg: '#BBF7D0',
    desc: 'Balanced academics with technology, arts, and character education. Competitive exam foundations built in.',
    status: 'active',
  },
  {
    emoji: '💡', badge: 'eTechno',
    range: 'Classes 6 to 10',
    bg: '#BFDBFE',
    desc: 'Advanced learning — challenge, engage, and develop critical thinking and innovation skills.',
    status: 'active',
  },
  {
    emoji: '🎓', badge: 'SR. Secondary',
    range: 'Classes 11 & 12',
    bg: '#F3F4F6',
    desc: 'We are currently developing our Senior Secondary programme. Classes 11 and 12 will launch very soon with Science and Arts streams.',
    status: 'coming_soon',
  },
];

export const TEACHERS = [
  { avatar: '👩‍🏫', name: 'Ms. Divaprya Misra', subject: 'Biology & Science',             bg: '#FDE68A' },
  { avatar: '👨‍🔬', name: 'Mr. Rameswar',        subject: 'Computer Science & Technology', bg: '#BBF7D0' },
  { avatar: '👨‍🏫', name: 'Mr. Sonu Mandal',      subject: 'Eng. Language & Literature',    bg: '#BFDBFE' },
  { avatar: '👨‍🏫', name: 'Mr. Jeet Banarjee',    subject: 'Mathematics & Olympiad',        bg: '#E9D5FF' },
];

export const EVENTS = [
  { emoji: '🏆', bg: '#C9A84C', date: 'July 15, 2026',   title: 'Annual Sports Day',  desc: 'A full day of games, races, and team competitions for all grades. Parents welcome!' },
  { emoji: '🎨', bg: '#0B1F3A', date: 'August 5, 2026',  title: 'Art & Science Fair', desc: 'Student projects, experiments, and creative exhibitions on display for parents.'    },
  { emoji: '🌟', bg: '#276749', date: 'October 2, 2026', title: 'Olympiad Prep Camp', desc: 'Intensive 3-day workshop for Maths, Science & English Olympiad aspirants.'         },
];

export const ANNOUNCEMENTS = [
  '📢 Admissions Open for 2026–27 — Apply Now!',
  '🎉 Annual Sports Day on July 15, 2026',
  '🖌️ Art & Science Fair on August 5, 2026',
  '🌟 Olympiad Prep Camp — October 2, 2026',
  '🏆 New eKidz batch starting May 11',
  '📚 Free counselling sessions every Saturday',
  '📍 Two campuses — Harish Chandra Pur & Kashim Pur',
  '🎓 SR. Secondary (Classes 11–12) coming soon!',
];

export const CAMPUSES = [
  { name: 'Harish Chandra Pur', address: 'Station Road, Pin-732125, Malda, WB', img: '/assets/H.Cpur.png',    tag: 'Open Now',   tagColor: '#276749', link: '/campus/hcpur'     },
  { name: 'Kashim Pur',         address: 'Near NH-31, Malda, WB',               img: '/assets/KashimPur.png', tag: 'Open Now',   tagColor: '#276749', link: '/campus/kashimpur' },
  { name: 'Coming to Your Area',address: 'Expansion underway — stay tuned!',    img: null,                    tag: 'Stay Tuned!',tagColor: '#6D28D9', link: '/campus'           },
];

export const SLIDERS = [
  '/assets/slider1.jpg',
  '/assets/slider2.jfif',
  '/assets/slider3.jpg',
  '/assets/slider4.jpg',
  '/assets/slider5.jpg',
];

export const FEE_TABLE = [
  { program: 'eKidz (Nursery–KG2)', admission: '₹2,000', monthly: '₹1,200', annual: '₹15,400', note: 'Includes kit'      },
  { program: 'eChamps (Class 1–5)', admission: '₹2,500', monthly: '₹1,500', annual: '₹19,500', note: 'Includes books'    },
  { program: 'eTechno (Class 6–10)',admission: '₹3,000', monthly: '₹1,800', annual: '₹23,600', note: 'Includes lab fees' },
  { program: 'Olympiad Add-on',     admission: '—',       monthly: '₹500',   annual: '₹6,000',  note: 'Optional'         },
  { program: 'SR. Secondary (11–12)',admission: 'TBA',    monthly: 'TBA',    annual: 'TBA',     note: '🚧 Under Development — Launching Soon' },
];
