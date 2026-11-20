import Background from './components/Background.jsx';
import Lantern from './components/Lantern.jsx';
import LanternForm from './components/LanternForm.jsx';
import Krathong from './components/Krathong.jsx';
import KrathongForm from './components/KrathongForm.jsx';
import Popup from './components/Popup.jsx';
import Celebration from './components/Celebration.jsx';
import { useState, useEffect, useCallback, useRef } from 'react';
const backgroundTrack = `${import.meta.env.BASE_URL}assets/loy-krathong.mp3`;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const SHARE_BASE_URL = (import.meta.env.VITE_SHARE_BASE_URL || API_BASE_URL).replace(/\/+$/, '');
const SOUND_EFFECTS = {
  button: 'switch-sound.mp3',
  builder: 'pop.mp3',
  bananaLeaf: 'banana-leaf.mp3',
  krathongRelease: 'water-splash.mp3',
  lanternRelease: 'lantern-fly.mp3',
  wishView: 'wish.mp3'
};

const requestApi = async (path, options) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || `API request failed (${response.status}).`);
  }
  return response.json();
};

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const createFloatingWish = (wish, index = 0, featured = false) => {
  const isLantern = wish.item_type === 'lantern';
  const skylineHeight = Math.min(Math.max(408, window.innerWidth * 0.28333), window.innerHeight * 0.85);
  const riverHeight = Math.max(1, window.innerHeight - skylineHeight);
  return {
    id: wish.id,
    form: wish.item_type,
    name: wish.sender_name,
    wish: wish.wish_text,
    customization: wish.customization || {},
    phase: 'looping',
    featured,
    xPosition: featured ? 50 : 8 + Math.random() * 84,
    topOff: isLantern
      ? featured ? window.innerHeight * 0.32 : window.innerHeight * (0.12 + Math.random() * 0.32)
      : featured
        ? skylineHeight + riverHeight * 0.48
        : skylineHeight + riverHeight * (0.15 + Math.random() * 0.68),
    animationDelayMs: featured ? 0 : (index % 50) * 35
  };
};

const mergeWishSample = (currentItems, sampledItems) => {
  const current = currentItems.filter(item => !item.retiring);
  const byId = new Map(current.map(item => [String(item.id), item]));
  const incomingIds = new Set(sampledItems.map(item => String(item.id)));
  const featuredItems = current.filter(item => item.featured && !incomingIds.has(String(item.id)));
  const next = [...featuredItems, ...sampledItems]
    .slice(0, 50)
    .map(item => byId.get(String(item.id)) || item);
  const nextIds = new Set(next.map(item => String(item.id)));
  const retiring = current
    .filter(item => !nextIds.has(String(item.id)))
    .map(item => ({ ...item, retiring: true }));
  return [...next, ...retiring];
};

const copy = {
  en: {
    eyebrow: 'A DIGITAL RIVER OF WISHES',
    title: 'Loy Jai',
    creatorCredit: 'Created by student @th4mez_.adv',
    intro: 'Release a little light and share a wish.',
    wishesTonight: 'wishes floating tonight',
    release: 'Release a lantern',
    create: 'Create a krathong',
    soundOn: 'Turn sound off',
    soundOff: 'Turn sound on',
    language: 'Language',
    lanternFormTitle: 'Send a wish into the night',
    lanternFormIntro: 'Your light will join the skyline above.',
    krathongFormTitle: 'Float a krathong',
    krathongFormIntro: 'Carry your wish gently across the river.',
    namePlaceholder: 'Name',
    wishPlaceholder: 'State your wish!',
    lanternSubmit: 'Release lantern',
    krathongSubmit: 'Float krathong',
    quickRelease: 'Quick Release',
    customization: 'Customize',
    krathongBase: 'Banana-leaf base',
    candle: 'Candle',
    incense: 'Incense',
    accent: 'Floral accent',
    lanternStyle: 'Lantern style',
    lanternGlow: 'Lantern glow',
    baseNotes: {
      banana: 'The banana-leaf raft symbolizes letting go of troubles and carrying good wishes.',
      lotus: 'Lotus petals represent purity and rising toward goodness.'
    },
    candleNotes: 'The candle flame represents wisdom and the light of a sincere wish.',
    incenseNotes: 'Incense represents prayer rising upward and respect for the Buddha.',
    accentNotes: 'Flowers express beauty and the offering of good intentions.',
    lanternStyleNotes: 'A traditional lantern carries hopes upward, like a small star joining the night.',
    lanternGlowNotes: 'A warm glow symbolizes warmth, remembrance, and peaceful wishes.',
    cancel: 'Cancel',
    detailKicker: 'A wish carried by light',
    close: 'Close',
    settings: 'Settings',
    profile: 'Profile',
    music: 'Music',
    sounds: 'Sound effects',
    musicVolume: 'Music volume',
    hapticIntensity: 'FX volume',
    profileName: 'About the Creator',
    profileDescription: "Made with care by a student living abroad in Singapore (@th4mez_.adv).\nBeing away from home makes it easy to miss quiet family traditions.\nLoy Jai (ลอยใจ) was built as a calm, welcoming digital river—with no sign-up, no app download, and simple controls—so family members and friends across places and generations can release a wish and feel connected.",
    closeModal: 'Close modal',
    shareWish: 'Share my wish',
    shareText: 'Invite someone to add a wish to Loy Jai',
    copyLink: 'Copy link',
    copyMessage: 'Copy invite',
    shareLink: 'Shareable wish link',
    shareMessage: 'Ready-to-send message',
    openDirectApp: 'Open the wish in the app',
    shareNative: 'Share',
    copied: 'Link copied',
    messageCopied: 'Message copied',
    lanternShareType: 'lantern',
    krathongShareType: 'krathong',
    shareMessageLead: '{name} released a {item} with this wish:',
    shareMessageInvite: 'See their wish and add your own on Loy Jai:',
    releaseOwnWish: 'Release your own wish'
  },
  th: {
    eyebrow: 'สายน้ำแห่งความหวังออนไลน์',
    title: 'ลอยใจ',
    creatorCredit: 'สร้างโดยนักศึกษา @th4mez_.adv',
    intro: 'ปล่อยแสงเล็กน้อยและแบ่งปันคำอธิษฐาน',
    wishesTonight: 'ความหวังลอยอยู่คืนนี้',
    release: 'ปล่อยโคมลอย',
    create: 'สร้างกระทง',
    soundOn: 'ปิดเสียง',
    soundOff: 'เปิดเสียง',
    language: 'ภาษา',
    lanternFormTitle: 'ส่งคำอธิษฐานสู่นภา',
    lanternFormIntro: 'แสงของคุณจะร่วมลอยขึ้นบนนภาลัย',
    krathongFormTitle: 'ส่งคำอธิษฐานบนสายน้ำ',
    krathongFormIntro: 'ส่งคำอธิษฐานของคุณลอยไปตามสายน้ำ',
    namePlaceholder: 'ชื่อ',
    wishPlaceholder: 'เขียนคำอธิษฐาน',
    lanternSubmit: 'ปล่อยโคมลอย',
    krathongSubmit: 'ลอยกระทง',
    quickRelease: 'ปล่อยด่วน',
    customization: 'ปรับแต่ง',
    krathongBase: 'ฐานใบกล้วย',
    candle: 'เทียน',
    incense: 'ธูป',
    accent: 'ดอกไม้ประดับ',
    lanternStyle: 'รูปแบบโคม',
    lanternGlow: 'แสงโคม',
    baseNotes: {
      banana: 'กระทงใบกล้วยสื่อถึงการปล่อยวางความทุกข์และพาคำอธิษฐานดีไป',
      lotus: 'กลีบบัวสื่อถึงความบริสุทธิ์และความดีที่งอกงาม'
    },
    candleNotes: 'เปลวเทียนสื่อถึงปัญญาและแสงแห่งคำอธิษฐานอันจริงใจ',
    incenseNotes: 'ธูปสื่อถึงคำภาวนาที่ลอยขึ้นสู่อากาศและความเคารพต่อพระพุทธ',
    accentNotes: 'ดอกไม้สื่อถึงความงดงามและการมอบความตั้งใจดี',
    lanternStyleNotes: 'โคมลอยแบบดั้งเดิมพาความหวังขึ้นไปเหมือนดวงดาวเล็ก ๆ ในค่ำคืน',
    lanternGlowNotes: 'แสงอบอุ่นสื่อถึงความอบอุ่น การระลึกถึง และคำอธิษฐานอันสงบ',
    cancel: 'ยกเลิก',
    detailKicker: 'คำอธิษฐานที่ลอยไปกับแสง',
    close: 'ปิด',
    settings: 'การตั้งค่า',
    profile: 'โปรไฟล์',
    music: 'เพลง',
    sounds: 'เสียง',
    musicVolume: 'ระดับเสียงเพลง',
    hapticIntensity: 'ระดับเสียงเอฟเฟกต์',
    profileName: 'เกี่ยวกับผู้สร้าง',
    profileDescription: "สร้างด้วยความตั้งใจโดยนักศึกษาชาวไทยที่กำลังเรียนอยู่ต่างประเทศในสิงคโปร์ (@th4mez_.adv)\nหลายครั้งที่อยู่ไกลบ้านและไม่ได้กลับไปร่วมเทศกาลกับครอบครัว ทำให้คิดถึงบรรยากาศเรียบง่ายที่ได้อธิษฐานร่วมกัน\nลอยใจ (Loy Jai) จึงถูกสร้างขึ้นเป็นพื้นที่สงบๆ ที่ไม่ต้องสมัครสมาชิก ไม่ต้องโหลดแอป และใช้ได้ทั้งบนมือถือและแท็บเล็ต\nเพื่อให้ทุกคนไม่ว่าจะอยู่ที่ไหน สามารถส่งคำอธิษฐานถึงคนที่รักและแบ่งปันความหวังให้กันได้ง่ายๆ",
    closeModal: 'ปิดหน้าต่าง',
    shareWish: 'แชร์คำอธิษฐาน',
    shareText: 'เชิญคนใกล้ชิดมาร่วมตั้งคำอธิษฐานบนลอยใจ',
    copyLink: 'คัดลอกลิงก์',
    copyMessage: 'คัดลอกข้อความเชิญ',
    shareLink: 'ลิงก์คำอธิษฐาน',
    shareMessage: 'ข้อความพร้อมส่ง',
    openDirectApp: 'เปิดคำอธิษฐานในแอป',
    shareNative: 'แชร์',
    copied: 'คัดลอกลิงก์แล้ว',
    messageCopied: 'คัดลอกข้อความแล้ว',
    lanternShareType: 'โคมลอย',
    krathongShareType: 'กระทง',
    shareMessageLead: '{name} ปล่อย{item}พร้อมคำอธิษฐานนี้:',
    shareMessageInvite: 'มาร่วมชมคำอธิษฐานและส่งคำอธิษฐานของคุณบนลอยใจ:',
    releaseOwnWish: 'ส่งคำอธิษฐานของคุณ'
  },
  zh: {
    eyebrow: '承载愿望的数字河流',
    title: '水灯节',
    creatorCredit: '由学生 @th4mez_.adv 创作',
    intro: '释放一缕微光，分享一个心愿。',
    wishesTonight: '愿望今晚漂浮中',
    lanterns: '已放飞天灯',
    krathongs: '已创建水灯',
    release: '放飞天灯',
    create: '创建水灯',
    soundOn: '关闭声音',
    soundOff: '打开声音',
    language: '语言',
    lanternFormTitle: '把愿望送入夜色',
    lanternFormIntro: '让你的灯光加入夜空。',
    krathongFormTitle: '放一盏水灯',
    krathongFormIntro: '让你的愿望沿着河流漂流。',
    namePlaceholder: '姓名',
    wishPlaceholder: '写下你的愿望',
    lanternSubmit: '放飞天灯',
    krathongSubmit: '放水灯',
    quickRelease: '快速放飞',
    customization: '自定义',
    krathongBase: '香蕉叶底座',
    candle: '蜡烛',
    incense: '香',
    accent: '花饰',
    lanternStyle: '灯笼样式',
    lanternGlow: '灯光',
    baseNotes: {
      banana: '香蕉叶底座象征放下烦恼，让美好愿望随水漂流。',
      lotus: '莲花花瓣象征纯洁与向善。'
    },
    candleNotes: '烛光象征智慧和真挚愿望的光芒。',
    incenseNotes: '香象征祈愿升起，也表达对佛陀的敬意。',
    accentNotes: '鲜花表达美丽与善意。',
    lanternStyleNotes: '传统灯笼将希望带向夜空，如同一颗小星加入夜色。',
    lanternGlowNotes: '温暖的灯光象征温情、纪念与平安的心愿。',
    cancel: '取消',
    detailKicker: '随灯光漂流的愿望',
    close: '关闭',
    settings: '设置',
    profile: '个人资料',
    music: '音乐',
    sounds: '音效',
    musicVolume: '音乐音量',
    hapticIntensity: '音效音量',
    profileName: '关于创作者',
    profileDescription: "由旅居新加坡的留学生用心制作（@th4mez_.adv）。\n身在异乡时，总更容易想念那些安静温暖的家庭传统。\nLoy Jai（ลอยใจ） 是一条宁静而包容的数字许愿河——无需注册账号，无需下载应用，操作简单直观——让身处不同地方、\n跨越不同代际的家人和朋友，都能轻松放下一盏心愿，彼此牵挂与连接。",
    closeModal: '关闭窗口',
    shareWish: '分享我的愿望',
    shareText: '邀请亲友在 Loy Jai 添加他们的愿望',
    copyLink: '复制链接',
    copyMessage: '复制邀请内容',
    shareLink: '愿望分享链接',
    shareMessage: '可直接发送的邀请',
    openDirectApp: '在应用中打开这份愿望',
    shareNative: '分享',
    copied: '链接已复制',
    messageCopied: '邀请内容已复制',
    lanternShareType: '天灯',
    krathongShareType: '水灯',
    shareMessageLead: '{name} 放飞了一盏{item}，并许下心愿：',
    shareMessageInvite: '来看看这份心愿，也在 Loy Jai 写下你的愿望：',
    releaseOwnWish: '许下你自己的愿望'
  }
};

const languageOptions = [
  { code: 'en', label: 'English', icon: 'EN' },
  { code: 'th', label: 'ไทย', icon: 'TH' },
  { code: 'zh', label: '中文', icon: 'CN' }
];

function App() {
  const [lanterns, setLanterns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', wish: '', form: 'lantern', style: 'traditional', glow: 'gold' });
  const [krathongs, setKrathongs] = useState([]);
  const [showKrathongForm, setShowKrathongForm] = useState(false);
  const [krathongFormData, setKrathongFormData] = useState({ name: '', wish: '', form: 'krathong', base: 'banana', candle: 'gold', incense: 'classic', accent: 'pink' });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const savedPreference = localStorage.getItem('soundEnabled');
    return savedPreference === null || savedPreference === 'true';
  });
  const [musicVolume, setMusicVolume] = useState(() => Number(localStorage.getItem('musicVolume') ?? 70));
  const [soundsEnabled, setsoundsEnabled] = useState(() => localStorage.getItem('soundsEnabled') !== 'false');
  const [hapticIntensity, setHapticIntensity] = useState(() => Number(localStorage.getItem('hapticIntensity') ?? 75));
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState({ total: 0, lanterns: 0, krathongs: 0 });
  const [shareWish, setShareWish] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [showLanguages, setShowLanguages] = useState(false);
  const [celebrations, setCelebrations] = useState([]);
  const nextCelebrationId = useRef(0);
  const languageRef = useRef(null);
  const labels = copy[language];
  const selectedLanguage = languageOptions.find(option => option.code === language) || languageOptions[0];
  const bgAudioRef = useRef(null);
  const ambientAudioRef = useRef([]);
  const soundEffectsRef = useRef(new Map());
  const wishOffsetsRef = useRef({ lantern: 0, krathong: 0 });

  const refreshStats = useCallback(async () => {
    const nextStats = await requestApi('/api/stats');
    setStats(nextStats);
  }, []);

  const getBackgroundAudio = () => {
    if (!bgAudioRef.current) {
      bgAudioRef.current = new Audio(backgroundTrack);
    }
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = musicVolume / 100;
    return bgAudioRef.current;
  };

  const getAmbientAudio = () => {
    if (!ambientAudioRef.current.length) {
      ambientAudioRef.current = ['water-flowing.mp3', 'birds-chirping.mp3'].map(file => {
        const audio = new Audio(`${import.meta.env.BASE_URL}assets/sounds/${file}`);
        audio.loop = true;
        return audio;
      });
    }
    return ambientAudioRef.current;
  };

  const playBackgroundAudio = (audio) => {
    audio.play().catch(error => {
      if (error.name !== 'NotAllowedError') {
        console.error('Background audio could not be played:', error);
      }
    });
  };

  const playSound = (sound, volumeMultiplier = 1) => {
    const fxVolume = Number.isFinite(hapticIntensity)
      ? Math.max(0, Math.min(100, hapticIntensity))
      : 0;
    if (!soundsEnabled || fxVolume === 0) return;
    const file = SOUND_EFFECTS[sound];
    if (!file) return;

    let audio = soundEffectsRef.current.get(sound);
    if (!audio) {
      audio = new Audio(`${import.meta.env.BASE_URL}assets/sounds/${file}`);
      soundEffectsRef.current.set(sound, audio);
    }
    audio.volume = Math.min(1, (fxVolume / 100) * volumeMultiplier);
    audio.currentTime = 0;
    audio.play().catch(error => {
      if (error.name !== 'NotAllowedError') {
        console.error(`Sound effect "${sound}" could not be played:`, error);
      }
    });
  };

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('musicVolume', String(musicVolume));
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume / 100;
    ambientAudioRef.current.forEach((audio, index) => {
      audio.volume = (musicVolume / 100) * (index === 0 ? 0.48 : 0.3);
    });
  }, [musicVolume]);

  useEffect(() => {
    if (!soundEnabled) {
      bgAudioRef.current?.pause();
      ambientAudioRef.current.forEach(audio => audio.pause());
      return undefined;
    }

    const startPlayback = () => {
      playBackgroundAudio(getBackgroundAudio());
      getAmbientAudio().forEach((audio, index) => {
        audio.volume = (musicVolume / 100) * (index === 0 ? 0.48 : 0.3);
        playBackgroundAudio(audio);
      });
    };

    document.addEventListener('pointerdown', startPlayback, { once: true });
    document.addEventListener('keydown', startPlayback, { once: true });
    startPlayback();

    return () => {
      document.removeEventListener('pointerdown', startPlayback);
      document.removeEventListener('keydown', startPlayback);
      bgAudioRef.current?.pause();
      ambientAudioRef.current.forEach(audio => audio.pause());
    };
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('soundsEnabled', String(soundsEnabled));
  }, [soundsEnabled]);

  useEffect(() => {
    localStorage.setItem('hapticIntensity', String(hapticIntensity));
  }, [hapticIntensity]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const refreshWishes = useCallback(async () => {
    const offsets = wishOffsetsRef.current;
    const [krathongRows, lanternRows, nextStats] = await Promise.all([
      requestApi(`/api/wishes?item_type=krathong&limit=50&offset=${offsets.krathong}`),
      requestApi(`/api/wishes?item_type=lantern&limit=50&offset=${offsets.lantern}`),
      requestApi('/api/stats')
    ]);

    wishOffsetsRef.current = {
      krathong: (offsets.krathong + 50) % (Math.ceil(nextStats.krathongs / 50) * 50 || 50),
      lantern: (offsets.lantern + 50) % (Math.ceil(nextStats.lanterns / 50) * 50 || 50)
    };
    setKrathongs(current => mergeWishSample(current, shuffle(krathongRows).slice(0, 50).map((wish, index) => createFloatingWish(wish, index))));
    setLanterns(current => mergeWishSample(current, shuffle(lanternRows).slice(0, 50).map((wish, index) => createFloatingWish(wish, index))));
    setStats(nextStats);
    setApiError('');
  }, []);

  useEffect(() => {
    let active = true;
    let requestPending = false;
    const refresh = () => {
      if (!active || document.hidden || requestPending) return;
      requestPending = true;
      refreshWishes().catch(error => {
        if (active) setApiError(error.message);
      }).finally(() => {
        requestPending = false;
      });
    };

    refresh();
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [refreshWishes]);

  useEffect(() => {
    const retiringLanternIds = lanterns.filter(item => item.retiring).map(item => String(item.id));
    const retiringKrathongIds = krathongs.filter(item => item.retiring).map(item => String(item.id));
    if (!retiringLanternIds.length && !retiringKrathongIds.length) return undefined;

    const timeout = window.setTimeout(() => {
      setLanterns(current => current.filter(item => !item.retiring || !retiringLanternIds.includes(String(item.id))));
      setKrathongs(current => current.filter(item => !item.retiring || !retiringKrathongIds.includes(String(item.id))));
    }, 750);
    return () => window.clearTimeout(timeout);
  }, [lanterns, krathongs]);

  useEffect(() => {
    const wishId = new URLSearchParams(window.location.search).get('wish');
    if (!wishId) return;
    let active = true;
    requestApi(`/api/wishes/${encodeURIComponent(wishId)}`)
      .then(wish => {
        if (!active) return;
        const featured = createFloatingWish(wish, 0, true);
        if (wish.item_type === 'lantern') {
          setLanterns(current => [featured, ...current.filter(item => String(item.id) !== String(featured.id))].slice(0, 50));
        } else {
          setKrathongs(current => [featured, ...current.filter(item => String(item.id) !== String(featured.id))].slice(0, 50));
        }
        setShareWish(featured);
      })
      .catch(error => {
        if (active) setApiError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguages(false);
      }
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const toggleSound = () => {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);
    if (nextValue) {
      playBackgroundAudio(getBackgroundAudio());
      getAmbientAudio().forEach((audio, index) => {
        audio.volume = (musicVolume / 100) * (index === 0 ? 0.48 : 0.3);
        playBackgroundAudio(audio);
      });
    } else {
      bgAudioRef.current?.pause();
      ambientAudioRef.current.forEach(audio => audio.pause());
    }
  };

  const playButtonSound = (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('button, input[type="submit"]')
      : null;
    if (!target || target.disabled) return;
    playSound(target.dataset.sound || 'button');
  };

  const triggerCelebration = () => {
    const id = ++nextCelebrationId.current;
    setCelebrations(previous => [...previous.slice(-2), id]);
  };

  const handleCelebrationComplete = useCallback((id) => {
    setCelebrations(previous => previous.filter(item => item !== id));
  }, []);

  const handleFestivalItemClick = (item) => {
    setShareWish(item);
    playSound('wishView');
    triggerCelebration();
  };

  const handleFadeComplete = useCallback((id) => {
    setLanterns(previousLanterns => previousLanterns.map(item => (
      item.id === id ? {
        ...item,
        phase: 'looping',
        topOff: Math.round(window.innerHeight * 0.42),
        hidden: false
      } : item
    )));
  }, []);

  const handleKrathongComplete = useCallback((id) => {
    setKrathongs(previousKrathongs => previousKrathongs.map(item => (
      item.id === id ? { ...item, phase: 'looping', xPosition: -12 } : item
    )));
  }, []);

  const handleReleaseLantern = async (name, wish, customization = {}) => {
    setSubmitting(true);
    setSubmissionError('');
    try {
      const savedWish = await requestApi('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: 'lantern',
          sender_name: name,
          wish_text: wish,
          customization
        })
      });
      const item = {
        ...createFloatingWish(savedWish, 0, true),
        phase: 'large',
        releaseSize: stats.lanterns === 0 ? 'large' : 'small',
        topOff: Math.round(window.innerHeight * 0.54),
        xPosition: 50
      };
      setLanterns(current => [item, ...current.filter(existing => !existing.retiring)].slice(0, 50));
      setShowForm(false);
      setFormData({ name: '', wish: '', form: 'lantern', style: 'traditional', glow: 'gold' });
      setShareWish(item);
      playSound('lanternRelease');
      triggerCelebration();
      refreshStats().catch(error => setApiError(error.message));
    } catch (error) {
      setSubmissionError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
  };

  const handleToggleKrathongForm = () => {
    setShowKrathongForm(!showKrathongForm);
  };

  const handleCreateKrathong = async (name, wish, customization = {}) => {
    setSubmitting(true);
    setSubmissionError('');
    try {
      const savedWish = await requestApi('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: 'krathong',
          sender_name: name,
          wish_text: wish,
          customization
        })
      });
      const item = {
        ...createFloatingWish(savedWish, 0, true),
        phase: 'new',
        xPosition: 50
      };
      setKrathongs(current => [item, ...current.filter(existing => !existing.retiring)].slice(0, 50));
      setShowKrathongForm(false);
      setKrathongFormData({ name: '', wish: '', form: 'krathong', base: 'banana', candle: 'gold', incense: 'classic', accent: 'pink' });
      setShareWish(item);
      playSound('krathongRelease');
      triggerCelebration();
      refreshStats().catch(error => setApiError(error.message));
    } catch (error) {
      setSubmissionError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const festivalItems = [
    ...lanterns.filter(lantern => !lantern.hidden),
    ...krathongs
  ];
  const lanternItems = festivalItems.filter(item => item.form === 'lantern');
  const krathongItems = festivalItems.filter(item => item.form === 'krathong');

  const renderFestivalItem = (item) => {
    if (item.form === 'krathong') {
      return (
        <Krathong
          key={`krathong-${item.id}`}
          krathong={item}
          onComplete={handleKrathongComplete}
          onShare={handleFestivalItemClick}
        />
      );
    }

    return (
      <Lantern
        key={`lantern-${item.id}`}
        lantern={item}
        onFadeComplete={handleFadeComplete}
        onLanternClick={handleFestivalItemClick}
      />
    );
  };

  const getShareUrl = (item) => {
    if (!item.id) throw new Error('This wish has no shareable ID.');
    return SHARE_BASE_URL
      ? `${SHARE_BASE_URL}/w/${encodeURIComponent(item.id)}`
      : getFallbackShareUrl(item);
  };

  const getFallbackShareUrl = (item) => {
    if (!item.id) throw new Error('This wish has no shareable ID.');
    const url = new URL(window.location.origin);
    url.searchParams.set('wish', item.id);
    return url.toString();
  };

  const getShareMessage = (item) => {
    const itemType = item.form === 'lantern' ? labels.lanternShareType : labels.krathongShareType;
    return `${labels.shareMessageLead.replace('{name}', item.name).replace('{item}', itemType)}\n“${item.wish}”\n\n${labels.shareMessageInvite}\n${getShareUrl(item)}`;
  };

  const shareWishLink = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Loy Jai — ${item.name}`,
          text: getShareMessage(item)
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    await copyShareMessage(item);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (clipboardError) {
      const input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) throw clipboardError;
    }
  };

  const copyWishLink = async (item) => {
    const url = getShareUrl(item);
    await copyText(url);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 1800);
  };

  const copyShareMessage = async (item) => {
    await copyText(getShareMessage(item));
    setCopiedMessage(true);
    window.setTimeout(() => setCopiedMessage(false), 1800);
  };

  const togglesounds = () => {
    const nextValue = !soundsEnabled;
    setsoundsEnabled(nextValue);
    if (nextValue && 'vibrate' in navigator) {
      navigator.vibrate(Math.max(10, Math.round(hapticIntensity * 0.8)));
    }
  };

  return (
    <>
      <Background />
      {apiError && (
        <div className="api-error" role="status">
          <span>{apiError}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setApiError('')}>×</button>
        </div>
      )}
      {celebrations.map(id => (
        <Celebration
          key={id}
          id={id}
          onComplete={handleCelebrationComplete}
        />
      ))}
      <main className="app-container" onClickCapture={playButtonSound}>
        <header className="app-header">
          <div className="top-vignette">
            <div className="wish-counter">
              <strong>{stats.total}</strong>
              <span>{labels.wishesTonight}</span>
            </div>
            <div className="site-title-group">
              <h1 className="site-title">{labels.title}</h1>
              <p className="creator-credit">{labels.creatorCredit}</p>
            </div>
            <div className="header-controls">
              <button
                className="utility-button"
                type="button"
                aria-label={soundEnabled ? labels.soundOn : labels.soundOff}
                title={soundEnabled ? labels.soundOn : labels.soundOff}
                aria-pressed={soundEnabled}
                onClick={toggleSound}
              >
                <span aria-hidden="true">{soundEnabled ? '◖))' : '◖×)'}</span>
              </button>
              <div className="language-control" ref={languageRef}>
                <button
                  className="utility-button"
                  type="button"
                  aria-label={labels.language}
                  title={labels.language}
                  aria-expanded={showLanguages}
                  onClick={() => setShowLanguages(previous => !previous)}
                >
                  <span aria-hidden="true">{selectedLanguage.icon}</span>
                </button>
                {showLanguages && (
                  <div className="language-menu" role="menu" aria-label={labels.language}>
                    {languageOptions.map(option => (
                      <button
                        key={option.code}
                        type="button"
                        role="menuitem"
                        className={language === option.code ? 'selected' : ''}
                        onClick={() => { setLanguage(option.code); setShowLanguages(false); }}
                      >
                        <span className="language-icon" aria-hidden="true">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="utility-button"
                type="button"
                aria-label={labels.settings}
                title={labels.settings}
                onClick={() => setShowSettings(true)}
              >
                <span aria-hidden="true">⚙</span>
              </button>
              <button
                className="utility-button"
                type="button"
                aria-label={labels.profile}
                title={labels.profile}
                onClick={() => setShowProfile(true)}
              >
                <span aria-hidden="true">i</span>
              </button>
            </div>
          </div>
        </header>

        <div className="large-lantern-layer">
          {festivalItems
            .filter(item => item.form === 'lantern' && item.phase === 'large')
            .map(renderFestivalItem)}
        </div>

        <div className="lanterns-container">
          {lanternItems
            .filter(item => item.phase !== 'large')
            .map(renderFestivalItem)}
        </div>

        <div className="krathong-layer">
          {krathongItems.map(renderFestivalItem)}
        </div>

        <div className="ui-controls">
          <div className="bridge" aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}images/bridge.png`} alt="" />
          </div>
          <div className="start-buttons">
            <button
              onClick={handleToggleForm}
              className="lantern-button"
            >
              <span className="button-icon" aria-hidden="true">↑</span>
              <span>{labels.release}</span>
            </button>
            <button
              className="krathong-button"
              onClick={handleToggleKrathongForm}
            >
              <span className="button-icon" aria-hidden="true">✦</span>
              <span>{labels.create}</span>
            </button>
          </div>
        </div>

        <Popup show={showForm} onClose={handleToggleForm} className="lantern-form-overlay">
            <div className="lantern-form">
              <LanternForm
                showForm={showForm}
                onToggleForm={handleToggleForm}
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleReleaseLantern}
                labels={labels}
                language={language}
                submitting={submitting}
                error={submissionError}
              />
            </div>
        </Popup>

        <Popup show={showKrathongForm} onClose={handleToggleKrathongForm} className="lantern-form-overlay">
            <div className="lantern-form">
              <KrathongForm
                formData={krathongFormData}
                onFormChange={setKrathongFormData}
                onSubmit={handleCreateKrathong}
                onToggleForm={handleToggleKrathongForm}
                labels={labels}
                language={language}
                submitting={submitting}
                error={submissionError}
              />
            </div>
        </Popup>

        <Popup show={Boolean(shareWish)} onClose={() => setShareWish(null)} className="lantern-form-overlay share-overlay">
          {shareWish && (
            <section
              className="share-wish-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-wish-title"
            >
              <button
                type="button"
                className="share-close"
                aria-label={labels.closeModal}
                onClick={() => setShareWish(null)}
              >×</button>
              <div className="share-mini-preview" aria-hidden="true">
                {shareWish.form === 'lantern' ? '🏮' : '🪷'}
              </div>
              <img
                className="share-card-image"
                src={`${import.meta.env.BASE_URL}assets/images/og-preview.png`}
                alt=""
              />
              <div className="detail-kicker">{labels.shareWish}</div>
              <h2 id="share-wish-title">{shareWish.name}</h2>
              <p className="share-wish-text">“{shareWish.wish}”</p>
              <p className="share-wish-intro">{labels.shareText}</p>
              <label className="share-field">
                {labels.shareLink}
                <input readOnly value={getShareUrl(shareWish)} onFocus={event => event.target.select()} />
              </label>
              <label className="share-field">
                {labels.shareMessage}
                <textarea readOnly rows="5" value={getShareMessage(shareWish)} onFocus={event => event.target.select()} />
              </label>
              <a className="share-fallback-link" href={getFallbackShareUrl(shareWish)}>
                {labels.openDirectApp}
              </a>
              <div className="share-actions">
                <button type="button" className="share-native" onClick={() => shareWishLink(shareWish)}>
                  {labels.shareNative}
                </button>
                <button type="button" className="share-copy" onClick={() => copyWishLink(shareWish)}>
                  {copiedLink ? labels.copied : labels.copyLink}
                </button>
                <button type="button" className="share-copy" onClick={() => copyShareMessage(shareWish)}>
                  {copiedMessage ? labels.messageCopied : labels.copyMessage}
                </button>
              </div>
              <button
                type="button"
                className="share-own-wish"
                onClick={() => {
                  const isLantern = shareWish.form === 'lantern';
                  setShareWish(null);
                  setSubmissionError('');
                  if (isLantern) setShowForm(true);
                  else setShowKrathongForm(true);
                }}
              >{labels.releaseOwnWish}</button>
            </section>
          )}
        </Popup>

        <Popup show={showSettings} onClose={() => setShowSettings(false)} className="lantern-form-overlay">
            <section
              className="settings-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
            >
              <div className="modal-heading">
                <h2 id="settings-title">{labels.settings}</h2>
                <button type="button" aria-label={labels.closeModal} onClick={() => setShowSettings(false)}>×</button>
              </div>
              <div className="setting-row">
                <div>
                  <span>{labels.music}</span>
                  <button
                    type="button"
                    className={`toggle ${soundEnabled ? 'active' : ''}`}
                    role="switch"
                    aria-checked={soundEnabled}
                    onClick={toggleSound}
                  ><span /></button>
                </div>
                <label htmlFor="music-volume">{labels.musicVolume}</label>
                <input
                  id="music-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={event => setMusicVolume(Number(event.target.value))}
                />
              </div>
              <div className="setting-row">
                <div>
                  <span>{labels.sounds}</span>
                  <button
                    type="button"
                    className={`toggle ${soundsEnabled ? 'active' : ''}`}
                    role="switch"
                    aria-checked={soundsEnabled}
                    onClick={togglesounds}
                  ><span /></button>
                </div>
                <label htmlFor="haptic-intensity">{labels.hapticIntensity}</label>
                <input
                  id="haptic-intensity"
                  type="range"
                  min="0"
                  max="100"
                  value={hapticIntensity}
                  onChange={event => setHapticIntensity(Number(event.target.value))}
                />
              </div>
            </section>
        </Popup>

        <Popup show={showProfile} onClose={() => setShowProfile(false)} className="lantern-form-overlay">
            <section
              className="profile-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-name"
            >
              <button
                className="profile-close"
                type="button"
                aria-label={labels.closeModal}
                onClick={() => setShowProfile(false)}
              >×</button>
              <div className="profile-picture">
                <img
                  src={`${import.meta.env.BASE_URL}assets/images/profile.png`}
                  alt={labels.profileName}
                />
              </div>
              <h2 id="profile-name">{labels.profileName}</h2>
              <p>{labels.profileDescription}</p>
            </section>
        </Popup>
      </main>
    </>
  );
}

export default App;