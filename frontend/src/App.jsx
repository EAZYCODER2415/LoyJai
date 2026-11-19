import Background from './components/Background.jsx';
import Lantern from './components/Lantern.jsx';
import LanternForm from './components/LanternForm.jsx';
import Krathong from './components/Krathong.jsx';
import KrathongForm from './components/KrathongForm.jsx';
import { useState, useEffect, useCallback, useRef } from 'react';
const backgroundTrack = `${import.meta.env.BASE_URL}assets/loy-krathong.mp3`;

const copy = {
  en: {
    eyebrow: 'A DIGITAL RIVER OF WISHES',
    title: 'Loy Jai',
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
    profileDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    closeModal: 'Close modal'
    ,shareWish: 'Share my wish'
    ,shareText: 'Invite someone to add a wish to Loy Jai'
    ,copyLink: 'Copy link'
    ,shareNative: 'Share'
    ,copied: 'Link copied'
  },
  th: {
    eyebrow: 'สายน้ำแห่งความหวังออนไลน์',
    title: 'ลอยใจ',
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
    profileDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    closeModal: 'ปิดหน้าต่าง'
    ,shareWish: 'แชร์คำอธิษฐาน'
    ,shareText: 'เชิญคนใกล้ชิดมาร่วมตั้งคำอธิษฐานบนลอยใจ'
    ,copyLink: 'คัดลอกลิงก์'
    ,shareNative: 'แชร์'
    ,copied: 'คัดลอกลิงก์แล้ว'
  },
  zh: {
    eyebrow: '承载愿望的数字河流',
    title: '水灯节',
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
    sounds: '触觉反馈',
    musicVolume: '音乐音量',
    hapticIntensity: '触觉强度',
    profileDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    closeModal: '关闭窗口',
    shareWish: '分享我的愿望',
    shareText: '邀请亲友在 Loy Jai 添加他们的愿望',
    copyLink: '复制链接',
    shareNative: '分享',
    copied: '链接已复制'
  }
};

const languageOptions = [
  { code: 'en', label: 'English', icon: 'EN' },
  { code: 'th', label: 'ไทย', icon: 'TH' },
  { code: 'zh', label: '中文', icon: 'CN' }
];

function App() {
  const [lanterns, setLanterns] = useState([]);
  const [lanternCount, setLanternCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', wish: '', form: 'lantern', style: 'traditional', glow: 'gold' });
  const [selectedLantern, setSelectedLantern] = useState(null);
  const [krathongs, setKrathongs] = useState([]);
  const [krathongCount, setKrathongCount] = useState(0);
  const [showKrathongForm, setShowKrathongForm] = useState(false);
  const [krathongFormData, setKrathongFormData] = useState({ name: '', wish: '', form: 'krathong', base: 'banana', candle: 'gold', incense: 'classic', accent: 'pink' });
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('soundEnabled') !== 'false');
  const [musicVolume, setMusicVolume] = useState(() => Number(localStorage.getItem('musicVolume') ?? 70));
  const [soundsEnabled, setsoundsEnabled] = useState(() => localStorage.getItem('soundsEnabled') !== 'false');
  const [hapticIntensity, setHapticIntensity] = useState(() => Number(localStorage.getItem('hapticIntensity') ?? 50));
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [shareWish, setShareWish] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [showLanguages, setShowLanguages] = useState(false);
  const languageRef = useRef(null);
  const labels = copy[language];
  const selectedLanguage = languageOptions.find(option => option.code === language) || languageOptions[0];
  const bgAudioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('musicVolume', String(musicVolume));
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume / 100;
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('soundsEnabled', String(soundsEnabled));
  }, [soundsEnabled]);

  useEffect(() => {
    localStorage.setItem('hapticIntensity', String(hapticIntensity));
  }, [hapticIntensity]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const wishId = new URLSearchParams(window.location.search).get('wish');
    if (!wishId) return;
    const savedLanterns = JSON.parse(localStorage.getItem('lanterns')) || [];
    const savedKrathongs = JSON.parse(localStorage.getItem('krathongs')) || [];
    const match = [...savedLanterns, ...savedKrathongs].find(item =>
      String(item.id) === wishId || item.shareId === wishId
    );
    if (match) setShareWish(match);
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
    if (nextValue && 'AudioContext' in window) {
      if (!bgAudioRef.current) {
        // Initialize the audio instance only once
        bgAudioRef.current = new Audio(backgroundTrack);
        bgAudioRef.current.loop = true;
        bgAudioRef.current.volume = musicVolume / 100;
      }
    bgAudioRef.current.play().catch(err => console.log("Playback blocked:", err));
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.05, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.16);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.16);
    } else {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    }
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

  // Load from localStorage on initial render
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('lanternCount')) || 0;
    const savedLanterns = JSON.parse(localStorage.getItem('lanterns')) || [];
    const loopingLanterns = savedLanterns.map(lantern => ({
      ...lantern,
      form: lantern.form || 'lantern',
      phase: 'looping',
      topOff: Math.round(window.innerHeight * 0.42),
      hidden: false,
      xPosition: lantern.xPosition ?? Math.floor(Math.random() * 70) + 15
    }));
    const savedKrathongs = JSON.parse(localStorage.getItem('krathongs')) || [];
    const loopingKrathongs = savedKrathongs.map(krathong => ({
      ...krathong,
      form: krathong.form || 'krathong',
      phase: 'looping'
    }));

    setLanternCount(savedCount);
    setLanterns(loopingLanterns);
    setKrathongCount(parseInt(localStorage.getItem('krathongCount')) || loopingKrathongs.length);
    setKrathongs(loopingKrathongs);
  }, []);

  // Save to localStorage whenever lanterns or count change
  useEffect(() => {
    localStorage.setItem('lanternCount', lanternCount);
    localStorage.setItem('lanterns', JSON.stringify(lanterns));
  }, [lanternCount, lanterns]);

  useEffect(() => {
    localStorage.setItem('krathongCount', krathongCount);
    localStorage.setItem('krathongs', JSON.stringify(krathongs));
  }, [krathongCount, krathongs]);

  const handleReleaseLantern = (name, wish, customization = {}) => {
    const newId = lanternCount + 1;
    const shareId = `lantern-${newId}-${Date.now().toString(36)}`;
    const newLantern = {
      id: newId,
      shareId,
      name: name,
      wish: wish,
      form: 'lantern',
      customization: {
        style: customization.style || 'traditional',
        glow: customization.glow || 'gold'
      },
      topOff: Math.round(window.innerHeight * 0.54),
      xPosition: 50,
      phase: 'large',
      hidden: false
    };

    setLanterns(previousLanterns => [...previousLanterns, newLantern]);
    setLanternCount(newId);
    setShowForm(false);
    setFormData({ name: '', wish: '', form: 'lantern', style: 'traditional', glow: 'gold' });
    setShareWish(newLantern);
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
  };

  const handleToggleKrathongForm = () => {
    setShowKrathongForm(!showKrathongForm);
  };

  const handleCreateKrathong = (name, wish, customization = {}) => {
    const newId = krathongCount + 1;
    const shareId = `krathong-${newId}-${Date.now().toString(36)}`;
    setKrathongs(previousKrathongs => [...previousKrathongs, {
      id: newId,
      shareId,
      name,
      wish,
      form: 'krathong',
      customization: {
        base: customization.base || 'banana',
        candle: customization.candle || 'gold',
        incense: customization.incense || 'classic',
        accent: customization.accent || 'pink'
      },
      phase: 'new'
    }]);
    setKrathongCount(newId);
    setShowKrathongForm(false);
    setKrathongFormData({ name: '', wish: '', form: 'krathong', base: 'banana', candle: 'gold', incense: 'classic', accent: 'pink' });
    setShareWish({
      id: newId,
      shareId,
      name,
      wish,
      form: 'krathong',
      customization,
      phase: 'new'
    });
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
          onShare={setShareWish}
        />
      );
    }

    return (
      <Lantern
        key={`lantern-${item.id}`}
        lantern={item}
        onFadeComplete={handleFadeComplete}
        onLanternClick={setShareWish}
        onShare={setShareWish}
      />
    );
  };

  const wishesFloating = lanternCount + krathongCount;

  const getShareUrl = (item) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('wish', item.shareId || String(item.id));
    return url.toString();
  };

  const shareWishLink = async (item) => {
    const url = getShareUrl(item);
    const text = item.wish ? `${item.wish} — Loy Jai` : 'Loy Jai';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Loy Jai', text, url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    await copyWishLink(item);
  };

  const copyWishLink = async (item) => {
    const url = getShareUrl(item);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('textarea');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
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
      <main className="app-container">
        <header className="app-header">
          <div className="top-vignette">
            <div className="wish-counter">
              <strong>{wishesFloating}</strong>
              <span>{labels.wishesTonight}</span>
            </div>
            <h1 className="site-title">{labels.title}</h1>
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

        {showForm && (
          <div className="lantern-form-overlay" onClick={handleToggleForm}>
            <div className="lantern-form" onClick={e => e.stopPropagation()}>
              <LanternForm
                showForm={showForm}
                onToggleForm={handleToggleForm}
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleReleaseLantern}
                labels={labels}
                language={language}
              />
            </div>
          </div>
        )}

        {showKrathongForm && (
          <div className="lantern-form-overlay" onClick={handleToggleKrathongForm}>
            <div className="lantern-form" onClick={event => event.stopPropagation()}>
              <KrathongForm
                formData={krathongFormData}
                onFormChange={setKrathongFormData}
                onSubmit={handleCreateKrathong}
                onToggleForm={handleToggleKrathongForm}
                labels={labels}
                language={language}
              />
            </div>
          </div>
        )}

        {shareWish && (
          <div className="lantern-form-overlay share-overlay" onClick={() => setShareWish(null)}>
            <section
              className="share-wish-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-wish-title"
              onClick={event => event.stopPropagation()}
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
                  {labels.shareNative}
                </button>
                <button type="button" className="share-copy" onClick={() => copyWishLink(shareWish)}>
                  {copiedLink ? labels.copied : labels.copyLink}
                </button>
              </div>
            </section>
          </div>
        )}

        {showSettings && (
          <div className="lantern-form-overlay" onClick={() => setShowSettings(false)}>
            <section
              className="settings-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              onClick={event => event.stopPropagation()}
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
          </div>
        )}

        {showProfile && (
          <div className="lantern-form-overlay" onClick={() => setShowProfile(false)}>
            <section
              className="profile-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-name"
              onClick={event => event.stopPropagation()}
            >
              <button
                className="profile-close"
                type="button"
                aria-label={labels.closeModal}
                onClick={() => setShowProfile(false)}
              >×</button>
              <div className="profile-picture" aria-label="Profile picture">
                <span>T</span>
              </div>
              <h2 id="profile-name">@th4mez_.adv</h2>
              <p>{labels.profileDescription}</p>
            </section>
          </div>
        )}
      </main>
    </>
  );
}

export default App;