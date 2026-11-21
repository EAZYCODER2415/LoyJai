import Background from './components/Background.jsx';
import Lantern from './components/Lantern.jsx';
import LanternForm from './components/LanternForm.jsx';
import Krathong from './components/Krathong.jsx';
import KrathongForm from './components/KrathongForm.jsx';
import Popup from './components/Popup.jsx';
import Celebration from './components/Celebration.jsx';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getHorizontalBounds,
  getLanternBounds,
  getLanternDimensions,
  getLanternInitialY,
  getLanternSpawnY,
  getRiverInitialX,
  getRiverBounds,
  getRiverSpawnY
} from './sceneBounds.js';
const backgroundTrack = `${import.meta.env.BASE_URL}assets/loy-krathong.mp3`;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const SHARE_BASE_URL = (import.meta.env.VITE_SHARE_BASE_URL || API_BASE_URL).replace(/\/+$/, '');
const TRACKED_WISHES_KEY = 'loyJaiMyWishIds';
const LATEST_WISH_ID_KEY = 'loyJaiLatestWishId';
const GUIDE_SEEN_KEY = 'loyJaiGuideSeen';
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

export const getSharedWishId = (location = window.location) => {
  const queryWishId = new URLSearchParams(location.search).get('wish');
  if (queryWishId !== null) return queryWishId || null;

  const encodedPathWishId = location.pathname.match(/^\/w\/([^/]+)\/?$/)?.[1];
  if (!encodedPathWishId) return null;
  try {
    return decodeURIComponent(encodedPathWishId) || null;
  } catch {
    return null;
  }
};

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const readTrackedWishIds = () => {
  const savedIds = localStorage.getItem(TRACKED_WISHES_KEY);
  if (!savedIds) return [];
  try {
    const parsedIds = JSON.parse(savedIds);
    return Array.isArray(parsedIds) ? parsedIds.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const getLanternSpawnPosition = (large = false, featured = false) => {
  const size = getLanternDimensions(large);
  return getLanternSpawnY(size.width, size.height, featured);
};

const createFloatingWish = (wish, index = 0, featured = false) => {
  const isLantern = wish.item_type === 'lantern';
  const id = String(wish.id);
  const isMine = readTrackedWishIds().includes(id);
  const lanternSize = getLanternDimensions();
  const bounds = isLantern ? getLanternBounds(lanternSize.width, lanternSize.height) : getRiverBounds();
  return {
    id: wish.id,
    form: wish.item_type,
    name: wish.sender_name,
    wish: wish.wish_text,
    customization: wish.customization || {},
    phase: 'looping',
    featured,
    isMine,
    xPosition: featured
      ? 50
      : isLantern
        ? bounds.min + Math.random() * (bounds.max - bounds.min)
        : getRiverInitialX(82),
    topOff: isLantern
      ? featured
        ? getLanternSpawnPosition(false, true)
        : getLanternInitialY(lanternSize.width, lanternSize.height)
      : getRiverSpawnY(82),
    animationDelayMs: featured ? 0 : (index % 50) * 35
  };
};

const mergeWishSample = (currentItems, sampledItems) => {
  const current = currentItems.filter(item => !item.retiring);
  const byId = new Map(current.map(item => [String(item.id), item]));
  const incomingIds = new Set(sampledItems.map(item => String(item.id)));
  const featuredItems = current.filter(item => (item.featured || item.isMine) && !incomingIds.has(String(item.id)));
  const next = [...featuredItems, ...sampledItems]
    .slice(0, 50)
    .map(item => {
      const previous = byId.get(String(item.id));
      if (!previous) return item;
      return {
        ...item,
        phase: previous.phase,
        xPosition: previous.xPosition,
        topOff: previous.topOff,
        animationDelayMs: previous.animationDelayMs,
        featured: item.featured || previous.featured,
        isMine: item.isMine || previous.isMine,
        hidden: previous.hidden,
        releaseSize: previous.releaseSize
      };
    });
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
    soundOn: 'Turn music off',
    soundOff: 'Turn music on',
    fxOn: 'Turn sound effects off',
    fxOff: 'Turn sound effects on',
    help: 'Help',
    findMyWish: 'Find my wish',
    wishNotVisible: 'Your wish is not on screen right now. Try again in a little while.',
    guideTitle: 'Welcome to Loy Jai',
    guideBody: 'Release a lantern into the sky or float a krathong on the river. Tap any light or wish to read and share it. You can begin right away.',
    skip: 'Skip',
    start: 'Start',
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
    soundOn: 'ปิดเพลง',
    soundOff: 'เปิดเพลง',
    fxOn: 'ปิดเสียงเอฟเฟกต์',
    fxOff: 'เปิดเสียงเอฟเฟกต์',
    help: 'ช่วยเหลือ',
    findMyWish: 'ค้นหาคำอธิษฐานของฉัน',
    wishNotVisible: 'ตอนนี้คำอธิษฐานของคุณไม่อยู่บนหน้าจอ ลองค้นหาอีกครั้งในอีกสักครู่',
    guideTitle: 'ยินดีต้อนรับสู่ลอยใจ',
    guideBody: 'ปล่อยโคมลอยสู่ท้องฟ้าหรือลอยกระทงไปตามสายน้ำ แตะแสงหรือคำอธิษฐานเพื่ออ่านและแชร์ แล้วเริ่มส่งคำอธิษฐานได้เลย',
    skip: 'ข้าม',
    start: 'เริ่มต้น',
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
    soundOn: '关闭音乐',
    soundOff: '打开音乐',
    fxOn: '关闭音效',
    fxOff: '打开音效',
    help: '帮助',
    findMyWish: '找到我的愿望',
    wishNotVisible: '你的愿望目前不在屏幕上，请稍后再试。',
    guideTitle: '欢迎来到 Loy Jai',
    guideBody: '放飞一盏天灯，或在河上漂放一盏水灯。点击任意灯光或愿望即可阅读和分享。现在就可以开始。',
    skip: '跳过',
    start: '开始',
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

const WISH_LOADING_CAPTIONS = [
  "Loading everyone's wishes...",
  'Taking a little bit longer...',
  'One more push...'
];

const isWishRenderedAndVisible = (element, viewport) => {
  if (!element.isConnected || element.classList.contains('is-retiring') || element.getClientRects().length === 0) {
    return false;
  }

  const bounds = element.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const left = Math.max(bounds.left, viewport.left);
  const right = Math.min(bounds.right, viewport.right);
  const top = Math.max(bounds.top, viewport.top);
  const bottom = Math.min(bounds.bottom, viewport.bottom);
  if (
    bounds.width <= 0
    || bounds.height <= 0
    || right <= left
    || bottom <= top
    || centerX < viewport.left
    || centerX > viewport.right
    || centerY < viewport.top
    || centerY > viewport.bottom
  ) {
    return false;
  }

  let opacity = 1;
  for (let ancestor = element; ancestor instanceof HTMLElement; ancestor = ancestor.parentElement) {
    const style = window.getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    opacity *= Number(style.opacity);
  }
  if (opacity <= 0.05) return false;

  for (const xRatio of [0.25, 0.5, 0.75]) {
    for (const yRatio of [0.25, 0.5, 0.75]) {
      const x = left + (right - left) * xRatio;
      const y = top + (bottom - top) * yRatio;
      const hit = document.elementFromPoint(x, y);
      if (hit && (hit === element || element.contains(hit))) return true;
    }
  }
  return false;
};

const FindWishHighlight = ({ wishId, onComplete }) => {
  const highlightRef = useRef(null);

  useEffect(() => {
    let frameId;
    let startedAt;
    let target;
    const duration = 12_000;

    const updatePosition = (timestamp) => {
      startedAt ??= timestamp;
      if (!target?.isConnected) {
        target = Array.from(document.querySelectorAll('[data-wish-id]'))
          .find(element => element.dataset.wishId === wishId);
      }
      const viewport = window.visualViewport
        ? {
          left: window.visualViewport.offsetLeft,
          top: window.visualViewport.offsetTop,
          right: window.visualViewport.offsetLeft + window.visualViewport.width,
          bottom: window.visualViewport.offsetTop + window.visualViewport.height
        }
        : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
      if (target && highlightRef.current && isWishRenderedAndVisible(target, viewport)) {
        const bounds = target.getBoundingClientRect();
        const diameter = Math.min(
          Math.max(Math.max(bounds.width, bounds.height) * 3, 96),
          Math.max(48, Math.min(window.innerWidth, window.innerHeight) * 0.82)
        );
        highlightRef.current.style.left = `${bounds.left + bounds.width / 2}px`;
        highlightRef.current.style.top = `${bounds.top + bounds.height / 2}px`;
        highlightRef.current.style.width = `${diameter}px`;
        highlightRef.current.style.height = `${diameter}px`;
        highlightRef.current.style.visibility = 'visible';
      } else if (highlightRef.current) {
        highlightRef.current.style.visibility = 'hidden';
      }

      if (timestamp - startedAt >= duration) {
        onComplete();
        return;
      }
      frameId = window.requestAnimationFrame(updatePosition);
    };

    frameId = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frameId);
  }, [wishId, onComplete]);

  return <div ref={highlightRef} className="find-wish-highlight" aria-hidden="true" />;
};

function App() {
  const [lanterns, setLanterns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', wish: '', form: 'lantern', style: 'traditional', glow: 'gold' });
  const [krathongs, setKrathongs] = useState([]);
  const [showKrathongForm, setShowKrathongForm] = useState(false);
  const [krathongFormData, setKrathongFormData] = useState({ name: '', wish: '', form: 'krathong', base: 'banana', candle: 'gold', incense: 'classic', accent: 'pink' });
  const [mineWishIds, setMineWishIds] = useState(readTrackedWishIds);
  const [focusedWishId, setFocusedWishId] = useState(null);
  const [showGuide, setShowGuide] = useState(() => {
    return !getSharedWishId() && localStorage.getItem(GUIDE_SEEN_KEY) !== 'true';
  });
  const [findWishAnimation, setFindWishAnimation] = useState([]);
  const [findWishStatus, setFindWishStatus] = useState('');
  const [hasLoadedWishes, setHasLoadedWishes] = useState(false);
  const [wishLoadingCaptionIndex, setWishLoadingCaptionIndex] = useState(0);
  const [historyRevision, setHistoryRevision] = useState(0);
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
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [showLanguages, setShowLanguages] = useState(false);
  const [celebrations, setCelebrations] = useState([]);
  const nextCelebrationId = useRef(0);
  const focusTimeoutRef = useRef(null);
  const findWishStatusTimeoutRef = useRef(null);
  const findWishAnimationIdRef = useRef(0);
  const languageRef = useRef(null);
  const labels = copy[language];
  const selectedLanguage = languageOptions.find(option => option.code === language) || languageOptions[0];
  const bgAudioRef = useRef(null);
  const ambientAudioRef = useRef([]);
  const soundEffectsRef = useRef(new Map());
  const wishOffsetsRef = useRef({ lantern: 0, krathong: 0 });

  useEffect(() => () => {
    window.clearTimeout(focusTimeoutRef.current);
    window.clearTimeout(findWishStatusTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (hasLoadedWishes) return undefined;
    const interval = window.setInterval(() => {
      setWishLoadingCaptionIndex(index => (index + 1) % WISH_LOADING_CAPTIONS.length);
    }, 120_000);
    return () => window.clearInterval(interval);
  }, [hasLoadedWishes]);

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
      const fxVolume = Number.isFinite(hapticIntensity)
        ? Math.max(0, Math.min(100, hapticIntensity))
        : 0;
      ambientAudioRef.current = ['water-flowing.mp3', 'birds-chirping.mp3'].map(file => {
        const audio = new Audio(`${import.meta.env.BASE_URL}assets/sounds/${file}`);
        audio.loop = true;
        audio.volume = (fxVolume / 100) * (file === 'water-flowing.mp3' ? 0.48 : 0.3);
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
  }, [musicVolume]);

  useEffect(() => {
    const fxVolume = Number.isFinite(hapticIntensity)
      ? Math.max(0, Math.min(100, hapticIntensity))
      : 0;
    ambientAudioRef.current.forEach((audio, index) => {
      audio.volume = (fxVolume / 100) * (index === 0 ? 0.48 : 0.3);
    });
  }, [hapticIntensity]);

  useEffect(() => {
    if (!soundEnabled) {
      bgAudioRef.current?.pause();
      return undefined;
    }

    const startPlayback = () => {
      playBackgroundAudio(getBackgroundAudio());
    };

    document.addEventListener('pointerdown', startPlayback, { once: true });
    document.addEventListener('keydown', startPlayback, { once: true });
    startPlayback();

    return () => {
      document.removeEventListener('pointerdown', startPlayback);
      document.removeEventListener('keydown', startPlayback);
      bgAudioRef.current?.pause();
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (!soundsEnabled) {
      ambientAudioRef.current.forEach(audio => audio.pause());
      return undefined;
    }

    const startAmbientAudio = () => {
      getAmbientAudio().forEach(playBackgroundAudio);
    };

    document.addEventListener('pointerdown', startAmbientAudio, { once: true });
    document.addEventListener('keydown', startAmbientAudio, { once: true });
    startAmbientAudio();

    return () => {
      document.removeEventListener('pointerdown', startAmbientAudio);
      document.removeEventListener('keydown', startAmbientAudio);
      ambientAudioRef.current.forEach(audio => audio.pause());
    };
  }, [soundsEnabled]);

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
    setHasLoadedWishes(true);
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
    const handlePopState = () => setHistoryRevision(revision => revision + 1);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const wishId = getSharedWishId();
    if (!wishId) {
      setShareWish(null);
      setFocusedWishId(null);
      return undefined;
    }

    let active = true;
    setShareWish(null);
    requestApi(`/api/wishes/${encodeURIComponent(wishId)}`)
      .then(wish => {
        if (!active) return;
        const featured = createFloatingWish(wish, 0, true);
        setFocusedWishId(String(featured.id));
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
  }, [historyRevision]);

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
    } else {
      bgAudioRef.current?.pause();
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

  const rememberWish = (id) => {
    const wishId = String(id);
    const nextIds = [wishId, ...new Set(mineWishIds.filter(savedId => savedId !== wishId))];
    setMineWishIds(nextIds);
    try {
      localStorage.setItem(LATEST_WISH_ID_KEY, wishId);
      localStorage.setItem(TRACKED_WISHES_KEY, JSON.stringify(nextIds));
    } catch (error) {
      setApiError(`Your wish was released, but could not be saved on this device: ${error.message}`);
    }
  };

  const handleFindMyWish = () => {
    window.clearTimeout(findWishStatusTimeoutRef.current);
    setFindWishStatus('');
    setFindWishAnimation([]);
    const trackedIds = new Set(readTrackedWishIds());
    if (!trackedIds.size) {
      setFindWishStatus(labels.wishNotVisible);
      findWishStatusTimeoutRef.current = window.setTimeout(() => setFindWishStatus(''), 3800);
      return;
    }
    const viewport = window.visualViewport
      ? {
        left: window.visualViewport.offsetLeft,
        top: window.visualViewport.offsetTop,
        right: window.visualViewport.offsetLeft + window.visualViewport.width,
        bottom: window.visualViewport.offsetTop + window.visualViewport.height
      }
      : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    const visibleWishIds = [...new Set(Array.from(document.querySelectorAll('[data-wish-id]'))
      .filter(element => trackedIds.has(element.dataset.wishId) && isWishRenderedAndVisible(element, viewport))
      .map(element => element.dataset.wishId))];

    if (!visibleWishIds.length) {
      setFindWishStatus(labels.wishNotVisible);
      findWishStatusTimeoutRef.current = window.setTimeout(() => setFindWishStatus(''), 3800);
      return;
    }

    const animationId = ++findWishAnimationIdRef.current;
    setFindWishAnimation(visibleWishIds.map(wishId => ({ wishId, animationId })));
  };

  const handleFindWishAnimationComplete = useCallback((wishId) => {
    setFindWishAnimation(current => current.filter(item => item.wishId !== wishId));
  }, []);

  const dismissGuide = () => {
    localStorage.setItem(GUIDE_SEEN_KEY, 'true');
    setShowGuide(false);
  };

  const handleFadeComplete = useCallback((id) => {
    setLanterns(previousLanterns => previousLanterns.map(item => (
      item.id === id ? {
        ...item,
        phase: 'looping',
        topOff: getLanternSpawnPosition(false, true),
        hidden: false
      } : item
    )));
  }, []);

  const handleKrathongComplete = useCallback((id) => {
    setKrathongs(previousKrathongs => previousKrathongs.map(item => (
      item.id === id
        ? { ...item, phase: 'looping', xPosition: getRiverBounds(82).min }
        : item
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
      rememberWish(savedWish.id);
      const releaseSize = stats.lanterns === 0 ? 'large' : 'small';
      const item = {
        ...createFloatingWish(savedWish, 0, true),
        phase: 'large',
        releaseSize,
        isMine: true,
        topOff: getLanternSpawnPosition(releaseSize === 'large', true),
        xPosition: 50
      };
      setLanterns(current => [item, ...current.filter(existing => !existing.retiring)].slice(0, 50));
      setFocusedWishId(String(item.id));
      window.clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = window.setTimeout(() => setFocusedWishId(null), 6000);
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
      rememberWish(savedWish.id);
      const item = {
        ...createFloatingWish(savedWish, 0, true),
        phase: 'new',
        isMine: true,
        xPosition: 50
      };
      setKrathongs(current => [item, ...current.filter(existing => !existing.retiring)].slice(0, 50));
      setFocusedWishId(String(item.id));
      window.clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = window.setTimeout(() => setFocusedWishId(null), 6000);
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
  const activeFindWishHighlights = Array.isArray(findWishAnimation) ? findWishAnimation : [];

  const renderFestivalItem = (item) => {
    if (item.form === 'krathong') {
      return (
        <Krathong
          key={`krathong-${item.id}`}
          krathong={item}
          isFocused={String(item.id) === focusedWishId}
          onComplete={handleKrathongComplete}
          onShare={handleFestivalItemClick}
        />
      );
    }

    return (
      <Lantern
        key={`lantern-${item.id}`}
        lantern={item}
        isFocused={String(item.id) === focusedWishId}
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

  const getShareCaption = (item) => {
    const itemType = item.form === 'lantern' ? labels.lanternShareType : labels.krathongShareType;
    return `${labels.shareMessageLead.replace('{name}', item.name).replace('{item}', itemType)}\n“${item.wish}”\n\n${labels.shareMessageInvite}`;
  };

  const shareWishLink = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Loy Jai — ${item.name}`,
          text: getShareCaption(item),
          url: getShareUrl(item)
        });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    await copyText(`${getShareCaption(item)}\n${getShareUrl(item)}`);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 1800);
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
      {!hasLoadedWishes && (
        <div className="wish-loading-overlay" role="status" aria-live="polite">
          <div className="wish-loading-content">
            <span className="wish-loading-spinner" aria-hidden="true" />
            <p>{WISH_LOADING_CAPTIONS[wishLoadingCaptionIndex]}</p>
          </div>
        </div>
      )}
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
                <span aria-hidden="true">{soundEnabled ? '♫' : '♪'}</span>
              </button>
              <button
                className="utility-button"
                type="button"
                aria-label={soundsEnabled ? labels.fxOn : labels.fxOff}
                title={soundsEnabled ? labels.fxOn : labels.fxOff}
                aria-pressed={soundsEnabled}
                onClick={togglesounds}
              >
                <span aria-hidden="true">{soundsEnabled ? '🔊' : '🔇'}</span>
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
                aria-label={labels.help}
                title={labels.help}
                onClick={() => setShowGuide(true)}
              >
                <span aria-hidden="true">?</span>
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
          {mineWishIds.length > 0 && (
            <button
              type="button"
              className="find-wish-button"
              onClick={handleFindMyWish}
            >
              <span aria-hidden="true">✧</span>
              {labels.findMyWish}
            </button>
          )}
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
              <div className="detail-kicker">{labels.shareWish}</div>
              <h2 id="share-wish-title">{shareWish.name}</h2>
              <p className="share-wish-text">“{shareWish.wish}”</p>
              <p className="share-wish-intro">{labels.shareText}</p>
              <div className="share-actions">
                <button type="button" className="share-native" onClick={() => shareWishLink(shareWish)}>
                  {copiedLink ? labels.copied : labels.shareNative}
                </button>
                <button type="button" className="share-copy" onClick={() => copyWishLink(shareWish)}>
                  {copiedLink ? labels.copied : labels.copyLink}
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

        <Popup show={showGuide} onClose={dismissGuide} className="lantern-form-overlay guide-overlay">
          <section
            className="guide-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
          >
            <button
              type="button"
              className="share-close"
              aria-label={labels.closeModal}
              onClick={dismissGuide}
            >×</button>
            <div className="share-mini-preview" aria-hidden="true">🏮</div>
            <div className="detail-kicker">{labels.help}</div>
            <h2 id="guide-title">{labels.guideTitle}</h2>
            <p>{labels.guideBody}</p>
            <div className="guide-actions">
              <button type="button" className="share-copy" onClick={dismissGuide}>{labels.skip}</button>
              <button type="button" className="share-native" onClick={dismissGuide}>{labels.start}</button>
            </div>
          </section>
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
        {activeFindWishHighlights.map(({ wishId, animationId }) => (
          <FindWishHighlight
            key={`${animationId}-${wishId}`}
            wishId={wishId}
            onComplete={handleFindWishAnimationComplete}
          />
        ))}
        {findWishStatus && (
          <div className="wish-find-status" role="status" aria-live="polite">
            {findWishStatus}
          </div>
        )}
      </main>
    </>
  );
}

export default App;