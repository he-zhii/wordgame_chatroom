import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2, Trophy, ArrowRight, Sparkles, Star, Home, ArrowLeft,
  BookOpen, Users, PawPrint, Apple, Palette, Hash, Eye, Ear,
  HelpCircle, Lightbulb, BookX, Heart, GraduationCap,
  Gamepad2, Save, RotateCcw, Play, Pause, Music, Mic, Edit3,
  Settings, Check, X
} from 'lucide-react';

// --- 1. 数据准备区 ---

const getColor = (index) => {
  const colors = [
    "text-pink-500", "text-blue-500", "text-green-500",
    "text-purple-500", "text-orange-500", "text-teal-600",
    "text-indigo-500", "text-rose-500", "text-cyan-600"
  ];
  return colors[index % colors.length];
};

// 洗牌算法 (Fisher-Yates) - 保证真随机
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// 律动小剧场数据 (Chants) - Unit 5 专属
// 新增 cn (中文翻译) 和 phrase (核心词组拼写任务)
const CHANT_DATA = [
  {
    id: "c1",
    sentence: "Black, black, sit down.",
    cn: "黑色，黑色，坐下。",
    emoji: "⚫🪑",
    color: "bg-slate-800 text-white",
    phrase: { word: "sit down", cn: "坐下" }
  },
  {
    id: "c2",
    sentence: "White, white, turn around.",
    cn: "白色，白色，转个圈。",
    emoji: "⚪🔄",
    color: "bg-slate-100 text-slate-800 border-2 border-slate-200",
    phrase: { word: "turn around", cn: "转圈" }
  },
  {
    id: "c3",
    sentence: "Pink and red, touch the ground.",
    cn: "粉色和红色，摸摸地面。",
    emoji: "💗🔴👇",
    color: "bg-pink-100 text-pink-600",
    phrase: { word: "touch the ground", cn: "摸地面" }
  },
  {
    id: "c4",
    sentence: "Orange and red, jump up and down.",
    cn: "橙色和红色，跳上跳下。",
    emoji: "🟧🔴🦘",
    color: "bg-orange-100 text-orange-600",
    phrase: { word: "jump up and down", cn: "跳上跳下" }
  }
];

const UNIT_DATA = [
  {
    id: 1,
    title: "Unit 1 身体部位",
    subtitle: "Body Parts",
    themeColor: "bg-rose-100 border-rose-300 text-rose-600",
    icon: <Users />,
    words: [
      { word: "name", cn: "名字", emoji: "📛", syllables: ["name"] },
      { word: "nice", cn: "友好的", emoji: "😊", syllables: ["nice"] },
      { word: "ear", cn: "耳朵", emoji: "👂", syllables: ["ear"] },
      { word: "hand", cn: "手", emoji: "✋", syllables: ["hand"] },
      { word: "eye", cn: "眼睛", emoji: "👁️", syllables: ["eye"] },
      { word: "mouth", cn: "嘴", emoji: "👄", syllables: ["mouth"] },
      { word: "arm", cn: "胳膊", emoji: "💪", syllables: ["arm"] },
      { word: "can", cn: "可以", emoji: "🆗", syllables: ["can"] },
      { word: "share", cn: "分享", emoji: "🍰", syllables: ["share"] },
      { word: "smile", cn: "微笑", emoji: "😄", syllables: ["smile"] },
      { word: "listen", cn: "听", emoji: "🎧", syllables: ["lis", "ten"] },
      { word: "help", cn: "帮助", emoji: "🤝", syllables: ["help"] },
      { word: "say", cn: "说", emoji: "🗣️", syllables: ["say"] },
      { word: "and", cn: "和", emoji: "➕", syllables: ["and"] },
      { word: "goodbye", cn: "再见", emoji: "👋", syllables: ["good", "bye"] },
      { word: "toy", cn: "玩具", emoji: "🧸", syllables: ["toy"] },
      { word: "friend", cn: "朋友", emoji: "👭", syllables: ["friend"] },
      { word: "good", cn: "好的", emoji: "👍", syllables: ["good"] },
    ]
  },
  {
    id: 2,
    title: "Unit 2 家庭关系",
    subtitle: "Family",
    themeColor: "bg-orange-100 border-orange-300 text-orange-600",
    icon: <Home />,
    words: [
      { word: "mum", cn: "妈妈", emoji: "👩", syllables: ["mum"] },
      { word: "dad", cn: "爸爸", emoji: "👨", syllables: ["dad"] },
      { word: "mother", cn: "妈妈", emoji: "👩", syllables: ["moth", "er"] },
      { word: "father", cn: "爸爸", emoji: "👨", syllables: ["fa", "ther"] },
      { word: "me", cn: "我", emoji: "🙋", syllables: ["me"] },
      { word: "sister", cn: "姐妹", emoji: "👧", syllables: ["sis", "ter"] },
      { word: "family", cn: "家", emoji: "👨‍👩‍👧‍👦", syllables: ["fam", "i", "ly"] },
      { word: "have", cn: "有", emoji: "🈶", syllables: ["have"] },
      { word: "cousin", cn: "堂兄/弟", emoji: "👫", syllables: ["cous", "in"] },
      { word: "brother", cn: "兄弟", emoji: "👦", syllables: ["broth", "er"] },
      { word: "baby", cn: "宝宝", emoji: "👶", syllables: ["ba", "by"] },
      { word: "big", cn: "大", emoji: "🐘", syllables: ["big"] },
      { word: "uncle", cn: "叔叔", emoji: "🤵", syllables: ["un", "cle"] },
      { word: "aunt", cn: "伯母", emoji: "👩", syllables: ["aunt"] },
      { word: "some", cn: "一些", emoji: "🍬", syllables: ["some"] },
      { word: "small", cn: "小的", emoji: "🐜", syllables: ["small"] },
      { word: "grandma", cn: "奶奶", emoji: "👵", syllables: ["grand", "ma"] },
      { word: "grandpa", cn: "爷爷", emoji: "👴", syllables: ["grand", "pa"] },
      { word: "grandfather", cn: "外祖父", emoji: "👴", syllables: ["grand", "fa", "ther"] },
      { word: "grandmother", cn: "外祖母", emoji: "👵", syllables: ["grand", "moth", "er"] },
    ]
  },
  {
    id: 3,
    title: "Unit 3 认识动物",
    subtitle: "Animals",
    themeColor: "bg-green-100 border-green-300 text-green-600",
    icon: <PawPrint />,
    words: [
      { word: "like", cn: "喜欢", emoji: "❤️", syllables: ["like"] },
      { word: "dog", cn: "狗", emoji: "🐶", syllables: ["dog"] },
      { word: "pet", cn: "宠物", emoji: "🐈", syllables: ["pet"] },
      { word: "cat", cn: "猫", emoji: "🐱", syllables: ["cat"] },
      { word: "fish", cn: "鱼", emoji: "🐟", syllables: ["fish"] },
      { word: "bird", cn: "鸟", emoji: "🐦", syllables: ["bird"] },
      { word: "rabbit", cn: "兔", emoji: "🐰", syllables: ["rab", "bit"] },
      { word: "go", cn: "走", emoji: "🚶", syllables: ["go"] },
      { word: "zoo", cn: "动物园", emoji: "🦁", syllables: ["zoo"] },
      { word: "fox", cn: "狐狸", emoji: "🦊", syllables: ["fox"] },
      { word: "Miss", cn: "女士", emoji: "👩‍🏫", syllables: ["Miss"] },
      { word: "panda", cn: "大熊猫", emoji: "🐼", syllables: ["pan", "da"] },
      { word: "cute", cn: "可爱的", emoji: "😽", syllables: ["cute"] },
      { word: "monkey", cn: "猴子", emoji: "🐒", syllables: ["mon", "key"] },
      { word: "tiger", cn: "老虎", emoji: "🐯", syllables: ["ti", "ger"] },
      { word: "elephant", cn: "大象", emoji: "🐘", syllables: ["el", "e", "phant"] },
      { word: "lion", cn: "狮子", emoji: "🦁", syllables: ["li", "on"] },
      { word: "animal", cn: "动物", emoji: "🐾", syllables: ["an", "i", "mal"] },
      { word: "giraffe", cn: "长颈鹿", emoji: "🦒", syllables: ["gi", "raffe"] },
      { word: "tall", cn: "高的", emoji: "🗼", syllables: ["tall"] },
      { word: "fast", cn: "快的", emoji: "🐆", syllables: ["fast"] },
    ]
  },
  {
    id: 4,
    title: "Unit 4 认识水果",
    subtitle: "Fruits",
    themeColor: "bg-yellow-100 border-yellow-300 text-yellow-700",
    icon: <Apple />,
    words: [
      { word: "apple", cn: "苹果", emoji: "🍎", syllables: ["ap", "ple"] },
      { word: "banana", cn: "香蕉", emoji: "🍌", syllables: ["ba", "na", "na"] },
      { word: "farm", cn: "农场", emoji: "🚜", syllables: ["farm"] },
      { word: "air", cn: "空气", emoji: "💨", syllables: ["air"] },
      { word: "orange", cn: "橙子", emoji: "🍊", syllables: ["or", "ange"] },
      { word: "grape", cn: "葡萄", emoji: "🍇", syllables: ["grape"] },
      { word: "school", cn: "学校", emoji: "🏫", syllables: ["school"] },
      { word: "garden", cn: "花园", emoji: "🌻", syllables: ["gar", "den"] },
      { word: "need", cn: "需要", emoji: "🤲", syllables: ["need"] },
      { word: "water", cn: "水", emoji: "💧", syllables: ["wa", "ter"] },
      { word: "flower", cn: "花朵", emoji: "🌺", syllables: ["flow", "er"] },
      { word: "grass", cn: "草", emoji: "🌿", syllables: ["grass"] },
      { word: "plant", cn: "植物", emoji: "🪴", syllables: ["plant"] },
      { word: "new", cn: "新的", emoji: "🆕", syllables: ["new"] },
      { word: "tree", cn: "树", emoji: "🌳", syllables: ["tree"] },
      { word: "sun", cn: "太阳", emoji: "☀️", syllables: ["sun"] },
      { word: "give", cn: "给", emoji: "🎁", syllables: ["give"] },
      { word: "them", cn: "他们", emoji: "👥", syllables: ["them"] },
      { word: "us", cn: "我们", emoji: "🧑‍🤝‍🧑", syllables: ["us"] },
    ]
  },
  {
    id: 5,
    title: "Unit 5 颜色与动作",
    subtitle: "Colors & Actions",
    themeColor: "bg-indigo-100 border-indigo-300 text-indigo-600",
    icon: <Palette />,
    hasChant: true, // 标记该单元有律动模式
    words: [
      { word: "colour", cn: "颜色", emoji: "🎨", syllables: ["col", "our"] },
      { word: "orange", cn: "橙红色", emoji: "🟧", syllables: ["or", "ange"] },
      { word: "green", cn: "绿色", emoji: "🟩", syllables: ["green"] },
      { word: "red", cn: "红色", emoji: "🟥", syllables: ["red"] },
      { word: "blue", cn: "蓝色", emoji: "🟦", syllables: ["blue"] },
      { word: "make", cn: "做", emoji: "🔨", syllables: ["make"] },
      { word: "purple", cn: "紫色", emoji: "🟪", syllables: ["pur", "ple"] },
      { word: "brown", cn: "棕色", emoji: "🟫", syllables: ["brown"] },
      { word: "bear", cn: "熊", emoji: "🐻", syllables: ["bear"] },
      { word: "yellow", cn: "黄色", emoji: "🟨", syllables: ["yel", "low"] },
      { word: "duck", cn: "鸭子", emoji: "🦆", syllables: ["duck"] },
      { word: "sea", cn: "海洋", emoji: "🌊", syllables: ["sea"] },
      { word: "pink", cn: "粉色", emoji: "💗", syllables: ["pink"] },
      { word: "draw", cn: "画", emoji: "🖍️", syllables: ["draw"] },
      { word: "white", cn: "白色", emoji: "⬜", syllables: ["white"] },
      { word: "black", cn: "黑色", emoji: "⬛", syllables: ["black"] },
      { word: "quiet", cn: "安静的", emoji: "🤫", syllables: ["qui", "et"] },
      { word: "queen", cn: "女王", emoji: "👸", syllables: ["queen"] },
      { word: "ruler", cn: "尺子", emoji: "📏", syllables: ["rul", "er"] },
      { word: "see", cn: "看见", emoji: "👀", syllables: ["see"] },
      { word: "bus", cn: "公交车", emoji: "🚌", syllables: ["bus"] },
      { word: "ted", cn: "泰德", emoji: "🧸", syllables: ["ted"] },
      { word: "sit", cn: "坐", emoji: "🪑", syllables: ["sit"] },
      { word: "down", cn: "下", emoji: "⬇️", syllables: ["down"] },
      { word: "up", cn: "上", emoji: "⬆️", syllables: ["up"] },
      { word: "stand", cn: "站", emoji: "🧍", syllables: ["stand"] },
      { word: "run", cn: "跑", emoji: "🏃", syllables: ["run"] },
    ]
  },
  {
    id: 6,
    title: "Unit 6 认识数字",
    subtitle: "Numbers",
    themeColor: "bg-sky-100 border-sky-300 text-sky-600",
    icon: <Hash />,
    words: [
      { word: "old", cn: "年纪", emoji: "👴", syllables: ["old"] },
      { word: "year", cn: "年", emoji: "📅", syllables: ["year"] },
      { word: "one", cn: "一", emoji: "1️⃣", syllables: ["one"] },
      { word: "two", cn: "二", emoji: "2️⃣", syllables: ["two"] },
      { word: "three", cn: "三", emoji: "3️⃣", syllables: ["three"] },
      { word: "four", cn: "四", emoji: "4️⃣", syllables: ["four"] },
      { word: "five", cn: "五", emoji: "5️⃣", syllables: ["five"] },
      { word: "six", cn: "六", emoji: "6️⃣", syllables: ["six"] },
      { word: "seven", cn: "七", emoji: "7️⃣", syllables: ["sev", "en"] },
      { word: "eight", cn: "八", emoji: "8️⃣", syllables: ["eight"] },
      { word: "nine", cn: "九", emoji: "9️⃣", syllables: ["nine"] },
      { word: "o'clock", cn: "点钟", emoji: "⏰", syllables: ["o'", "clock"] },
      { word: "cut", cn: "切", emoji: "✂️", syllables: ["cut"] },
      { word: "eat", cn: "吃", emoji: "🍽️", syllables: ["eat"] },
      { word: "cake", cn: "蛋糕", emoji: "🎂", syllables: ["cake"] },
    ]
  }
];

// --- 2. 存储管理 ---

const MISTAKE_KEY = 'spellingGame_mistakes_v4';
const BRAWL_KEY = 'spellingGame_brawl_progress_v1';
const SCORE_KEY = 'spellingGame_totalScore_v1';
const SETTINGS_KEY = 'spellingGame_settings_v1';

const getGlobalScore = () => {
  try {
    const score = localStorage.getItem(SCORE_KEY);
    return score ? parseInt(score, 10) : 0;
  } catch (e) { return 0; }
};

const saveGlobalScore = (score) => {
  localStorage.setItem(SCORE_KEY, score.toString());
};

const updateGlobalScore = (delta) => {
  const current = getGlobalScore();
  const newScore = current + delta;
  saveGlobalScore(newScore);
  return newScore;
};

const getMistakes = () => {
  try {
    const data = localStorage.getItem(MISTAKE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) { return {}; }
};

const saveMistakes = (mistakes) => {
  localStorage.setItem(MISTAKE_KEY, JSON.stringify(mistakes));
};

const addMistake = (wordObj) => {
  const db = getMistakes();
  if (!db[wordObj.word]) {
    db[wordObj.word] = { ...wordObj, hearts: 0, timestamp: Date.now() };
    saveMistakes(db);
  }
};

const updateMistakeProgress = (wordStr, isCorrect) => {
  const db = getMistakes();
  if (!db[wordStr]) return null;

  if (isCorrect) {
    db[wordStr].hearts = (db[wordStr].hearts || 0) + 1;
    if (db[wordStr].hearts >= 3) {
      delete db[wordStr];
      saveMistakes(db);
      return 'graduated';
    } else {
      saveMistakes(db);
      return 'improved';
    }
  } else {
    db[wordStr].hearts = 0;
    saveMistakes(db);
    return 'reset';
  }
};

const getBrawlProgress = () => {
  try {
    const data = localStorage.getItem(BRAWL_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) { return null; }
};

const saveBrawlProgress = (state) => {
  localStorage.setItem(BRAWL_KEY, JSON.stringify(state));
};

const clearBrawlProgress = () => {
  localStorage.removeItem(BRAWL_KEY);
};

// 设置管理
const getSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { enableHints: true }; // 默认开启
  } catch (e) { return { enableHints: true }; }
};

const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};


// --- 3. [新] 律动小剧场 (Sentence Builder + Phrase Spelling) ---

function SentenceGameScreen({ onBack, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState('sentence'); 
  
  // --- Sentence Builder State ---
  const [placedWords, setPlacedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [sentenceStructure, setSentenceStructure] = useState([]);
  const [isSentenceCompleted, setIsSentenceCompleted] = useState(false);
  
  // --- Spelling State ---
  const [spellingShuffledLetters, setSpellingShuffledLetters] = useState([]);
  const [spellingPlacedLetters, setSpellingPlacedLetters] = useState([]);
  const [isSpellingCompleted, setIsSpellingCompleted] = useState(false);
  const [spellingShake, setSpellingShake] = useState(false);

  const [showCelebration, setShowCelebration] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentChant = CHANT_DATA[currentIndex];

  useEffect(() => {
    initLevel(currentIndex);
  }, [currentIndex]);

  const initLevel = (idx) => {
    const chant = CHANT_DATA[idx];
    setGamePhase('sentence');
    
    // 1. 初始化组句逻辑
    const tokens = chant.sentence.split(/([a-zA-Z]+)/).filter(t => t);
    const structure = [];
    const wordsPool = [];

    tokens.forEach((token, i) => {
      if (/^[a-zA-Z]+$/.test(token)) {
        structure.push({ type: 'word', id: `slot-${i}`, target: token });
        wordsPool.push({ id: `word-${i}-${token}`, text: token, isUsed: false });
      } else {
        if(token.trim() === '' && token.length > 0) {
           // space handling
        } else {
            structure.push({ type: 'punct', content: token });
        }
      }
    });

    setSentenceStructure(structure);
    setPlacedWords(new Array(structure.filter(t => t.type === 'word').length).fill(null));
    setAvailableWords(shuffleArray(wordsPool));
    setIsSentenceCompleted(false);
    
    // 2. 初始化拼写逻辑
    const phrase = chant.phrase.word;
    const lettersOnly = phrase.replace(/\s/g, '').split(''); 
    
    const letterObjs = lettersOnly.map((char, i) => ({
      id: `spell-${char}-${i}-${Math.random()}`,
      char: char,
      isUsed: false
    }));
    
    setSpellingShuffledLetters(shuffleArray(letterObjs));
    
    const initialSpellingPlaced = phrase.split('').map((char, i) => {
       if (char === ' ') return { char: ' ', isSpace: true, id: `space-${i}` };
       return null;
    });
    setSpellingPlacedLetters(initialSpellingPlaced);
    setIsSpellingCompleted(false);

    setShowCelebration(false);
    
    setTimeout(() => playAudio(chant.sentence), 800);
  };

  const playAudio = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    u.pitch = 1.1;
    u.onstart = () => setIsPlayingAudio(true);
    u.onend = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(u);
  };

  const playSuccessSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // --- Sentence Builder Logic ---

  const handleSentenceWordClick = (wordObj) => {
    if (isSentenceCompleted || wordObj.isUsed) return;
    const emptyIndex = placedWords.findIndex(w => w === null);
    if (emptyIndex === -1) return;

    const newPlaced = [...placedWords];
    newPlaced[emptyIndex] = wordObj;
    setPlacedWords(newPlaced);

    const newAvailable = availableWords.map(w => w.id === wordObj.id ? { ...w, isUsed: true } : w);
    setAvailableWords(newAvailable);

    if (newPlaced.every(w => w !== null)) {
      checkSentenceAnswer(newPlaced);
    }
  };

  const handleSentenceSlotClick = (slotIndex) => {
    if (isSentenceCompleted || !placedWords[slotIndex]) return;
    const wordToReturn = placedWords[slotIndex];
    const newPlaced = [...placedWords];
    newPlaced[slotIndex] = null;
    setPlacedWords(newPlaced);
    const newAvailable = availableWords.map(w => w.id === wordToReturn.id ? { ...w, isUsed: false } : w);
    setAvailableWords(newAvailable);
  };

  const checkSentenceAnswer = (finalPlaced) => {
    const userWords = finalPlaced.map(w => w.text);
    const targetWords = sentenceStructure.filter(s => s.type === 'word').map(s => s.target);
    const isCorrect = userWords.join('') === targetWords.join('');

    if (isCorrect) {
      setIsSentenceCompleted(true);
      playSuccessSound();
      playAudio(currentChant.sentence);
    } else {
      alert("Oops! 顺序不对哦，再试一次！");
      setPlacedWords(new Array(finalPlaced.length).fill(null));
      setAvailableWords(availableWords.map(w => ({ ...w, isUsed: false })));
    }
  };

  // --- Spelling Logic ---
  
  const handleSpellingLetterClick = (letterObj) => {
    if (isSpellingCompleted || letterObj.isUsed) return;
    const firstEmptyIndex = spellingPlacedLetters.findIndex(l => l === null);
    if (firstEmptyIndex === -1) return;

    const newShuffled = spellingShuffledLetters.map(l => l.id === letterObj.id ? { ...l, isUsed: true } : l);
    const newPlaced = [...spellingPlacedLetters];
    newPlaced[firstEmptyIndex] = letterObj;

    setSpellingShuffledLetters(newShuffled);
    setSpellingPlacedLetters(newPlaced);

    if (newPlaced.every(l => l !== null)) {
      checkSpellingAnswer(newPlaced);
    }
  };

  const handleSpellingSlotClick = (index) => {
    if (isSpellingCompleted || !spellingPlacedLetters[index] || spellingPlacedLetters[index].isSpace) return;
    const letterToReturn = spellingPlacedLetters[index];
    const newPlaced = [...spellingPlacedLetters];
    newPlaced[index] = null;
    const newShuffled = spellingShuffledLetters.map(l => l.id === letterToReturn.id ? { ...l, isUsed: false } : l);
    setSpellingPlacedLetters(newPlaced);
    setSpellingShuffledLetters(newShuffled);
  };

  const checkSpellingAnswer = (finalPlaced) => {
    const userPhrase = finalPlaced.map(l => l.char).join('');
    if (userPhrase === currentChant.phrase.word) {
        setIsSpellingCompleted(true);
        setShowCelebration(true);
        playSuccessSound();
        updateGlobalScore(30); 
        playAudio(currentChant.phrase.word);
    } else {
        setSpellingShake(true);
        setTimeout(() => setSpellingShake(false), 500);
        const userChars = finalPlaced.filter(l => l && !l.isSpace).map(l => l.id);
        const resetPlaced = finalPlaced.map(l => (l && l.isSpace) ? l : null);
        const resetShuffled = spellingShuffledLetters.map(l => userChars.includes(l.id) ? { ...l, isUsed: false } : l);
        
        setSpellingPlacedLetters(resetPlaced);
        setSpellingShuffledLetters(resetShuffled);
    }
  };

  // 提示功能
  const handleSpellingHint = () => {
    if (isSpellingCompleted) return;
    const emptyIndex = spellingPlacedLetters.findIndex(l => l === null);
    if (emptyIndex === -1) return;
    const correctChar = currentChant.phrase.word[emptyIndex];
    const letterToAutoFill = spellingShuffledLetters.find(l => l.char === correctChar && !l.isUsed);
    if (letterToAutoFill) {
      handleSpellingLetterClick(letterToAutoFill);
    } else {
        console.warn("Hint: No matching letter found in pool.");
    }
  };

  // --- Navigation ---
  
  const startSpellingPhase = () => {
    setGamePhase('spelling');
    playAudio(currentChant.phrase.word);
  };

  const nextLevel = () => {
    if (currentIndex < CHANT_DATA.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      alert("🎉 太棒了！你已经完成了所有律动挑战！");
      onBack();
    }
  };

  // Render Helpers
  let wordSlotCounter = 0;

  return (
    <div className={`flex flex-col min-h-[100dvh] w-full overflow-x-hidden overscroll-none select-none ${currentChant.color} transition-colors duration-500`}>
      <div className="p-4 flex justify-between items-center bg-black/10 text-white backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-1 font-bold hover:bg-white/20 px-3 py-1 rounded-full active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" /> <span className="hidden md:inline">退出剧场</span>
        </button>
        <span className="font-bold tracking-wider flex items-center gap-2 text-sm md:text-base">
            <Music className="w-5 h-5 animate-bounce" /> 律动小剧场 ({currentIndex + 1}/{CHANT_DATA.length})
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-4 md:p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden transition-all">
          
          {/* Phase 1: Sentence Builder */}
          {gamePhase === 'sentence' && (
            <div className="w-full flex flex-col items-center animate-fade-in-up">
               <div className="mb-6 md:mb-10 text-center">
                   <h2 className="text-2xl md:text-4xl font-extrabold text-slate-700 tracking-wide mb-2">
                       {currentChant.cn}
                   </h2>
                   <p className="text-slate-400 text-xs md:text-sm">请将下方的单词归位</p>
               </div>
               
               <div className="flex flex-wrap items-end justify-center gap-2 mb-8 md:mb-12 min-h-[60px] md:min-h-[80px]">
                 {sentenceStructure.map((item, idx) => {
                   if (item.type === 'punct') {
                     return <span key={idx} className="text-3xl md:text-4xl font-bold text-slate-400 mb-2">{item.content}</span>;
                   }
                   const currentSlotIndex = wordSlotCounter++;
                   const filledWord = placedWords[currentSlotIndex];
                   return (
                     <div 
                        key={idx}
                        onClick={() => handleSentenceSlotClick(currentSlotIndex)}
                        className={`
                           min-w-[60px] md:min-w-[80px] h-10 md:h-14 px-2 md:px-4 flex items-center justify-center rounded-xl border-b-4 text-lg md:text-2xl font-bold cursor-pointer transition-all active:scale-95
                           ${filledWord 
                             ? (isSentenceCompleted ? 'bg-green-100 border-green-400 text-green-600 scale-110' : 'bg-white border-indigo-200 text-indigo-600 shadow-lg') 
                             : 'bg-slate-100 border-slate-200 border-dashed text-slate-300'
                           }
                        `}
                     >
                        {filledWord ? filledWord.text : ''}
                     </div>
                   );
                 })}
               </div>

               <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                 {!isSentenceCompleted ? (
                    availableWords.map((word) => (
                        <button
                            key={word.id}
                            onClick={() => handleSentenceWordClick(word)}
                            disabled={word.isUsed}
                            className={`
                               px-4 md:px-6 py-2 md:py-3 rounded-2xl text-lg md:text-xl font-bold border-b-4 transition-all transform touch-manipulation
                               ${word.isUsed 
                                 ? 'opacity-0 scale-50' 
                                 : 'bg-white border-slate-200 text-slate-700 hover:-translate-y-1 hover:shadow-lg active:scale-95'
                               }
                            `}
                        >
                            {word.text}
                        </button>
                    ))
                 ) : (
                    <div className="flex flex-col items-center animate-bounce">
                        <p className="text-green-600 font-bold mb-2 text-sm md:text-base">句子组装完成！下一步 ⬇️</p>
                        <button onClick={startSpellingPhase} className="bg-indigo-500 hover:bg-indigo-600 text-white text-lg md:text-xl font-bold py-3 px-8 md:px-12 rounded-full shadow-lg flex items-center gap-2 active:scale-95">
                             <Edit3 className="w-5 h-5 md:w-6 md:h-6" /> 拼写核心词组
                        </button>
                    </div>
                 )}
               </div>
            </div>
          )}

          {/* Phase 2: Phrase Spelling */}
          {gamePhase === 'spelling' && (
             <div className="w-full flex flex-col items-center animate-fade-in-up">
                <div className="mb-6 md:mb-8 text-center">
                    <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">核心词组挑战</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1">{currentChant.phrase.cn}</h2>
                    <button onClick={() => playAudio(currentChant.phrase.word)} className="mx-auto flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-600 active:scale-95 p-2">
                        <Volume2 className="w-4 h-4" /> 听发音
                    </button>
                </div>

                <div className={`flex flex-wrap justify-center gap-2 mb-8 md:mb-10 min-h-[3rem] md:min-h-[4rem] ${spellingShake ? 'animate-shake' : ''}`}>
                   {spellingPlacedLetters.map((letter, idx) => {
                     if (letter && letter.isSpace) return <div key={`space-${idx}`} className="w-2 md:w-6 h-10 md:h-12 flex-shrink-0"></div>;
                     return (
                       <div
                         key={idx} onClick={() => handleSpellingSlotClick(idx)}
                         className={`w-10 h-12 md:w-14 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-xl border-b-4 transition-all cursor-pointer select-none active:scale-95
                           ${letter ? `bg-white border-blue-200 shadow-md text-blue-600` : 'bg-slate-100 border-slate-200'}
                           ${isSpellingCompleted && letter ? 'bg-green-100 border-green-400 text-green-600' : ''}
                         `}
                       >
                         {letter ? letter.char : ''}
                       </div>
                     );
                   })}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                   <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                       {!isSpellingCompleted ? (
                           spellingShuffledLetters.map((item) => (
                            <button
                              key={item.id} onClick={() => handleSpellingLetterClick(item)} disabled={item.isUsed}
                              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-2xl font-bold rounded-xl transition-all transform duration-200 touch-manipulation
                                ${item.isUsed ? 'opacity-0 scale-50 cursor-default' : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900 shadow-[0_4px_0_rgb(161,98,7)] active:scale-90'}
                              `}
                            >
                              {item.char}
                            </button>
                           ))
                       ) : (
                           <button onClick={nextLevel} className="bg-green-500 hover:bg-green-600 text-white text-lg md:text-xl font-bold py-3 px-8 md:px-12 rounded-full shadow-lg animate-bounce flex items-center gap-2 active:scale-95">
                               {currentIndex < CHANT_DATA.length - 1 ? '下一句 ➡️' : '全部通关! 🏆'}
                           </button>
                       )}
                   </div>
                   
                   {!isSpellingCompleted && settings?.enableHints && (
                      <button 
                          onClick={handleSpellingHint}
                          className="w-10 h-10 md:w-14 md:h-14 bg-white border-4 border-amber-200 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all group touch-manipulation"
                          title="提示"
                      >
                          <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-amber-400 fill-amber-400 group-hover:animate-pulse" />
                      </button>
                   )}
                </div>

                {showCelebration && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-20">
                        <span className="text-9xl animate-ping">🌟</span>
                    </div>
                )}
             </div>
          )}

        </div>
      </div>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

// --- 4. 单词拼写游戏主组件 (GameScreen) ---

function GameScreen({
  words,          
  mode,           
  onBack,
  isMistakeMode = false,
  initialIndex = 0,
  initialScore = 0,
  preShuffled = false, 
  onProgressUpdate = null,
  settings 
}) {
  const workingWords = useMemo(() => {
    if (preShuffled) return words;
    if (Array.isArray(words)) return shuffleArray(words);
    return shuffleArray(Object.values(words));
  }, [words, preShuffled]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [placedLetters, setPlacedLetters] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(initialScore);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHearts, setCurrentHearts] = useState(0);
  const [graduatedAnimation, setGraduatedAnimation] = useState(false);
  const audioPlayedRef = useRef(false);

  const currentWordObj = workingWords[currentIndex];

  useEffect(() => {
    if (mode === 'brawl' && onProgressUpdate) {
      onProgressUpdate({
        words: workingWords, 
        currentIndex,
        score
      });
    }
  }, [currentIndex, score, mode, workingWords, onProgressUpdate]);

  useEffect(() => {
    if (currentWordObj) {
      initWord(currentWordObj);
      audioPlayedRef.current = false;
      if (isMistakeMode) {
        setCurrentHearts(currentWordObj.hearts || 0);
      }
    }
  }, [currentIndex, currentWordObj]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!audioPlayedRef.current && currentWordObj && !graduatedAnimation) {
        playAudio();
        audioPlayedRef.current = true;
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [currentIndex, currentWordObj, graduatedAnimation]);

  const initWord = (wordObj) => {
    const phrase = wordObj.word;
    const lettersOnly = phrase.replace(/\s/g, '').split('');
    const letterObjs = lettersOnly.map((char, i) => ({
      id: `${char}-${i}-${Math.random()}`,
      char: char,
      isUsed: false
    }));
    const shuffled = shuffleArray(letterObjs);

    setShuffledLetters(shuffled);
    const initialPlaced = phrase.split('').map((char, i) => {
      if (char === ' ') return { char: ' ', isSpace: true, id: `space-${i}` };
      return null;
    });
    setPlacedLetters(initialPlaced);
    setIsCompleted(false);
    setShowCelebration(false);
    setShowHint(false);
    setGraduatedAnimation(false);
  };

  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.6);
      });
    } catch (e) { }
  };

  const playAudio = () => {
    if (!currentWordObj) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWordObj.word);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en-US'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleLetterClick = (letterObj) => {
    if (isCompleted || letterObj.isUsed) return;
    const firstEmptyIndex = placedLetters.findIndex(l => l === null);
    if (firstEmptyIndex === -1) return;

    const newShuffled = shuffledLetters.map(l => l.id === letterObj.id ? { ...l, isUsed: true } : l);
    const newPlaced = [...placedLetters];
    newPlaced[firstEmptyIndex] = letterObj;

    setShuffledLetters(newShuffled);
    setPlacedLetters(newPlaced);

    if (newPlaced.every(l => l !== null)) {
      checkAnswer(newPlaced);
    }
  };
  
  const handleSmartHint = () => {
    if (isCompleted) return;
    const emptyIndex = placedLetters.findIndex(l => l === null);
    if (emptyIndex === -1) return;
    const correctChar = currentWordObj.word[emptyIndex];
    const letterToAutoFill = shuffledLetters.find(l => l.char === correctChar && !l.isUsed);
    if (letterToAutoFill) {
      handleLetterClick(letterToAutoFill);
    } else {
        console.warn("Hint: No matching letter found in pool.");
    }
  };

  const handleSlotClick = (index) => {
    if (isCompleted || !placedLetters[index] || placedLetters[index].isSpace) return;
    const letterToReturn = placedLetters[index];
    const newPlaced = [...placedLetters];
    newPlaced[index] = null;
    const newShuffled = shuffledLetters.map(l => l.id === letterToReturn.id ? { ...l, isUsed: false } : l);
    setPlacedLetters(newPlaced);
    setShuffledLetters(newShuffled);
  };

  const checkAnswer = (finalPlaced) => {
    const userPhrase = finalPlaced.map(l => l.char).join('');

    if (userPhrase === currentWordObj.word) {
      setIsCompleted(true);
      playSuccessSound();

      if (isMistakeMode) {
        const result = updateMistakeProgress(currentWordObj.word, true);
        if (result === 'graduated') {
          setGraduatedAnimation(true);
        } else {
          setCurrentHearts(h => h + 1);
          setShowCelebration(true);
          setScore(s => s + 10);
          updateGlobalScore(10);
        }
      } else {
        setShowCelebration(true);
        setScore(s => s + 10);
        setShowHint(true);
        updateGlobalScore(10);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (isMistakeMode) {
        updateMistakeProgress(currentWordObj.word, false);
        setCurrentHearts(0);
      } else {
        addMistake(currentWordObj);
      }
    }
  };

  const nextLevel = () => {
    if (currentIndex < workingWords.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      if (mode === 'brawl') {
        clearBrawlProgress();
        alert(`🏆 全明星大乱斗通关！太厉害了！总分：${score}`);
      } else {
        alert(`太棒了！本轮挑战完成啦！总分：${score}`);
      }
      onBack();
    }
  };

  const handleHint = () => {
    setShowHint(true);
    if (!isMistakeMode) {
      addMistake(currentWordObj);
    } else {
      updateMistakeProgress(currentWordObj.word, false);
      setCurrentHearts(0);
    }
  };

  const effectiveMode = mode === 'brawl' ? 'visual' : mode;
  const shouldShowVisuals = effectiveMode === 'visual' || effectiveMode === 'notebook' || showHint || isCompleted;

  if (!currentWordObj) return <div className="text-center p-10">加载中...</div>;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden overscroll-none select-none bg-slate-50">
      <div className={`p-4 flex justify-between items-center shadow-md relative z-10 transition-colors duration-500 
        ${isMistakeMode ? 'bg-red-500 text-white' : (mode === 'brawl' ? 'bg-violet-600 text-white' : 'bg-indigo-500 text-white')}`}>
        
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1 font-bold hover:bg-white/20 px-3 py-1 rounded-full transition active:scale-95">
            <ArrowLeft className="w-5 h-5" /> 返回
          </button>
          <span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded-lg border border-white/30 hidden md:inline-block">
            {isMistakeMode ? '📕 单词加油站' : (mode === 'brawl' ? '⚔️ 全明星大乱斗' : (mode === 'blind' ? '🎧 听音挑战' : '👀 看图练习'))}
          </span>
        </div>

        {mode === 'brawl' && (
           <div className="flex-1 mx-4 max-w-xs hidden md:flex flex-col gap-1">
             <div className="flex justify-between text-xs opacity-90">
               <span>进度</span>
               <span>{currentIndex + 1} / {workingWords.length}</span>
             </div>
             <div className="h-2 bg-black/20 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-yellow-400 transition-all duration-500"
                 style={{ width: `${((currentIndex + 1) / workingWords.length) * 100}%` }}
               ></div>
             </div>
           </div>
        )}

        {isMistakeMode ? (
          <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
            {[0, 1, 2].map(i => (
              <Heart key={i} className={`w-5 h-5 ${i < currentHearts ? 'fill-red-300 text-red-300' : 'text-white/30'}`} />
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span className="font-bold text-lg">{score}</span>
            {mode === 'brawl' && <Save className="w-4 h-4 text-white/50 ml-2" />}
          </div>
        )}
      </div>

      <div className={`flex-1 flex items-center justify-center p-4 pb-20 ${mode === 'brawl' ? 'bg-violet-50' : ''}`}>
        <div className={`bg-white max-w-2xl w-full rounded-3xl shadow-xl border-4 overflow-hidden relative min-h-[400px] flex flex-col
          ${isMistakeMode ? 'border-red-100' : (mode === 'brawl' ? 'border-violet-200' : 'border-slate-100')}
        `}>
          {graduatedAnimation && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in-up">
              <GraduationCap className="w-24 h-24 text-yellow-500 mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">太棒了！彻底掌握！</h2>
              <p className="text-gray-500 mb-6">这个词已经从错题本移除咯~</p>
              <button onClick={nextLevel} className="bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 transition active:scale-95">
                下一关
              </button>
            </div>
          )}

          <div className="p-4 md:p-10 flex flex-col items-center flex-1">
            <div className="relative mb-6 text-center h-32 md:h-40 flex flex-col justify-center items-center w-full">
              {shouldShowVisuals ? (
                <div className="transition-all duration-500 animate-fade-in-up">
                  <div className={`text-6xl md:text-8xl mb-2 md:mb-4 transition-transform duration-300 ${isCompleted ? 'scale-110 rotate-6' : ''}`}>
                    {currentWordObj.emoji}
                  </div>
                  <h2 className={`text-xl md:text-3xl font-bold tracking-widest ${getColor(currentIndex)}`}>
                    {currentWordObj.cn}
                  </h2>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center animate-pulse group">
                  <div
                    className="w-24 h-24 md:w-32 md:h-32 bg-indigo-100 rounded-3xl flex items-center justify-center border-4 border-indigo-200 mb-2 cursor-pointer hover:bg-indigo-200 transition-colors shadow-inner active:scale-95"
                    onClick={handleHint}
                  >
                    <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs md:text-sm text-indigo-400 font-medium">听不出来？点我看看</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <button onClick={playAudio} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 md:px-5 py-2 rounded-full transition-all font-bold shadow-sm active:scale-95 text-sm md:text-base">
                <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> 听听看
              </button>
              {!shouldShowVisuals && (
                <button onClick={handleHint} className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 md:px-4 py-2 rounded-full transition-all font-bold shadow-sm active:scale-95 text-sm md:text-base">
                  <Lightbulb className="w-4 h-4 md:w-5 md:h-5" /> 偷看一眼
                </button>
              )}
            </div>

            <div className={`flex flex-wrap justify-center gap-2 px-2 min-h-[3rem] md:min-h-[4rem] ${shake ? 'animate-shake' : ''}`}>
              {placedLetters.map((letter, idx) => {
                if (letter && letter.isSpace) return <div key={`space-${idx}`} className="w-2 md:w-6 h-10 md:h-12 flex-shrink-0"></div>;
                return (
                  <div
                    key={idx} onClick={() => handleSlotClick(idx)}
                    className={`w-10 h-12 md:w-14 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-xl border-b-4 transition-all cursor-pointer select-none active:scale-95
                      ${letter ? `bg-white border-blue-200 shadow-md text-blue-600` : 'bg-slate-100 border-slate-200'}
                      ${isCompleted && letter ? 'bg-green-100 border-green-400 text-green-600' : ''}
                    `}
                  >
                    {letter ? letter.char : ''}
                  </div>
                );
              })}
            </div>

            <div className="h-6 md:h-8 mb-4 md:mb-6 mt-2 flex items-center justify-center gap-1">
              {isCompleted && currentWordObj.syllables && currentWordObj.syllables.map((syl, i) => (
                <React.Fragment key={i}>
                  <span className="text-sm md:text-base font-medium text-green-500 animate-fade-in-up">
                    {syl}
                  </span>
                  {i < currentWordObj.syllables.length - 1 && <span className="text-green-300 mx-0.5">·</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 min-h-[4.5rem]">
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {!isCompleted ? (
                  shuffledLetters.map((item) => (
                    <button
                      key={item.id} onClick={() => handleLetterClick(item)} disabled={item.isUsed}
                      className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-xl md:text-2xl font-bold rounded-xl transition-all transform duration-200 touch-manipulation
                        ${item.isUsed ? 'opacity-0 scale-50 cursor-default' : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900 shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1 active:scale-90'}
                      `}
                    >
                      {item.char}
                    </button>
                  ))
                ) : (
                  !graduatedAnimation && (
                    <div className="animate-fade-in-up">
                      <button onClick={nextLevel} className="bg-green-500 hover:bg-green-600 text-white text-lg md:text-xl font-bold py-3 px-8 md:px-10 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 active:scale-95">
                        {currentIndex < workingWords.length - 1 ? '下一关 ➡️' : '完成挑战! 🏆'}
                      </button>
                    </div>
                  )
                )}
              </div>

               {!isCompleted && settings?.enableHints && (
                  <button 
                      onClick={handleSmartHint}
                      className="w-10 h-10 md:w-14 md:h-14 bg-white border-4 border-amber-200 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all group touch-manipulation"
                      title="提示"
                  >
                      <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-amber-400 fill-amber-400 group-hover:animate-pulse" />
                  </button>
               )}
            </div>
            
            {mode === 'brawl' && !isCompleted && (
                <div className="mt-4 md:mt-6 text-xs text-gray-400 flex items-center gap-1">
                    <Save className="w-3 h-3" /> 进度自动保存中
                </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

// --- 5. 模式选择弹窗 ---

function ModeSelectionModal({ unit, onSelectMode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-br ${unit.themeColor.split(' ')[0].replace('bg-', 'from-').replace('100', '200')} to-white opacity-50`}></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 active:scale-95"><ArrowLeft className="w-6 h-6" /></button>
        <div className="relative text-center mb-8 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">选择挑战模式</h2>
          <p className="text-gray-500 text-sm">当前单元: {unit.subtitle}</p>
        </div>
        <div className="space-y-4">
          <button onClick={() => onSelectMode('visual')} className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-2xl flex items-center gap-4 transition-all group shadow-sm hover:shadow-md active:scale-95 touch-manipulation">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Eye className="w-6 h-6" /></div>
            <div className="text-left flex-1"><h3 className="font-bold text-gray-800">👀 看图练习</h3><p className="text-xs text-gray-500">看图片记单词，轻松入门</p></div>
          </button>
          <button onClick={() => onSelectMode('blind')} className="w-full bg-white border-2 border-rose-100 hover:border-rose-400 hover:bg-rose-50 p-4 rounded-2xl flex items-center gap-4 transition-all group shadow-sm hover:shadow-md active:scale-95 touch-manipulation">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Ear className="w-6 h-6" /></div>
            <div className="text-left flex-1"><h3 className="font-bold text-gray-800">👂 听音挑战</h3><p className="text-xs text-gray-500">不看图片，只听声音拼写</p></div>
            <div className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">进阶</div>
          </button>

          {unit.hasChant && (
            <button onClick={() => onSelectMode('chant')} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-4 rounded-2xl flex items-center gap-4 transition-all group shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 touch-manipulation">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:animate-spin"><Music className="w-6 h-6" /></div>
                <div className="text-left flex-1">
                    <h3 className="font-bold text-white text-lg">🎵 律动小剧场</h3>
                    <p className="text-xs text-white/80">跟着节奏，组装魔法句子！</p>
                </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 6. 设置弹窗组件 ---
function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 active:scale-95">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Settings className="w-6 h-6" /> 游戏设置
          </h2>
        </div>
        
        <div className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                    <Lightbulb className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <h3 className="font-bold text-gray-700">拼写提示</h3>
                    <p className="text-xs text-gray-400">遇到困难时显示灯泡按钮</p>
                 </div>
              </div>
              <button 
                 onClick={() => onUpdateSettings({ ...settings, enableHints: !settings.enableHints })}
                 className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${settings.enableHints ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                 <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.enableHints ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
           </div>
        </div>
        
        <div className="mt-8">
           <button onClick={onClose} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition active:scale-95">
              完成
           </button>
        </div>
      </div>
    </div>
  );
}

// --- 7. 主入口 (Dashboard) ---

export default function App() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [mistakeData, setMistakeData] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  
  const [settings, setSettings] = useState(getSettings());
  const [showSettings, setShowSettings] = useState(false);
  
  const [brawlState, setBrawlState] = useState(null);

  useEffect(() => {
    const checkMistakes = () => {
      const db = getMistakes();
      setMistakeCount(Object.keys(db).length);
    };
    checkMistakes();
    const interval = setInterval(checkMistakes, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalScore(getGlobalScore());
  }, [gameMode]); 
  
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setGameMode(null);
  };

  const startNotebookMode = () => {
    const db = getMistakes();
    if (Object.keys(db).length === 0) {
      alert("太棒了！你暂时没有错题需要复习哦！");
      return;
    }
    setMistakeData(db);
    setGameMode('notebook');
  };
  
  const handleBrawlClick = () => {
    const saved = getBrawlProgress();
    if (saved) {
      if(window.confirm(`发现上次大乱斗进度（第 ${saved.currentIndex + 1} 关），是否继续？\n点击【确定】继续，点击【取消】重新开始`)) {
        setBrawlState(saved);
        setGameMode('brawl');
      } else {
        startNewBrawl();
      }
    } else {
      startNewBrawl();
    }
  };

  const startNewBrawl = () => {
    const allWords = UNIT_DATA.flatMap(u => u.words);
    const shuffled = shuffleArray(allWords);
    
    const newState = {
      words: shuffled,
      currentIndex: 0,
      score: 0
    };
    
    saveBrawlProgress(newState);
    setBrawlState(newState);
    setGameMode('brawl');
  };

  const handleBack = () => {
    setSelectedUnit(null);
    setGameMode(null);
    setBrawlState(null);
  };

  if (gameMode === 'chant') {
      return <SentenceGameScreen onBack={handleBack} settings={settings} />;
  }

  if (gameMode === 'notebook') {
    return <GameScreen words={mistakeData} mode="notebook" isMistakeMode={true} onBack={handleBack} settings={settings} />;
  }
  
  if (gameMode === 'brawl' && brawlState) {
    return (
      <GameScreen 
        words={brawlState.words} 
        mode="brawl" 
        onBack={handleBack} 
        initialIndex={brawlState.currentIndex}
        initialScore={brawlState.score}
        preShuffled={true} 
        onProgressUpdate={saveBrawlProgress}
        settings={settings}
      />
    );
  }

  if (selectedUnit && gameMode) {
    return <GameScreen words={selectedUnit.words} mode={gameMode} onBack={handleBack} settings={settings} />;
  }

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden overscroll-none select-none bg-sky-50 p-6 pb-20 font-sans">
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {selectedUnit && !gameMode && (
        <ModeSelectionModal
          unit={selectedUnit}
          onSelectMode={setGameMode}
          onClose={() => setSelectedUnit(null)}
        />
      )}

      <div className="fixed top-4 left-4 z-50 md:absolute">
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold shadow-sm border-2 border-yellow-200 cursor-help" title="这是你赢得的所有奖杯！">
              <Trophy className="w-5 h-5 fill-yellow-500 text-yellow-600" />
              <span>{totalScore}</span>
          </div>
      </div>
      
      <div className="fixed top-4 right-4 z-50 md:absolute">
          <button 
             onClick={() => setShowSettings(true)}
             className="bg-white text-slate-500 p-2 rounded-full shadow-sm border hover:bg-slate-50 transition active:scale-95"
          >
              <Settings className="w-6 h-6" />
          </button>
      </div>

      <header className="max-w-4xl mx-auto mb-8 relative pt-12 md:pt-0">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-sky-600 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10" />
            英语单词大冒险
          </h1>
          <p className="text-sky-800 text-lg">三年级上册 (Book 3A)</p>
        </div>

        <div className="absolute top-0 right-14 hidden md:block">
          <button
            onClick={startNotebookMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm transition-all
               ${mistakeCount > 0 ? 'bg-white text-red-500 hover:shadow-md hover:scale-105' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
             `}
          >
            <BookX className="w-5 h-5" />
            📕 单词加油站
            {mistakeCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{mistakeCount}</span>
            )}
          </button>
        </div>
      </header>

      <div className="md:hidden mb-6 flex justify-center">
        <button
          onClick={startNotebookMode}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold shadow-sm transition-all border-2 active:scale-95
               ${mistakeCount > 0 ? 'bg-white border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-400'}
             `}
        >
          <BookX className="w-5 h-5" />
          复习错题 ({mistakeCount})
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up">
        <div 
           onClick={handleBrawlClick}
           className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-200 cursor-pointer transform transition hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group active:scale-95"
        >
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">New</span>
                    <span className="flex items-center gap-1 text-violet-200 text-xs font-medium"><Save className="w-3 h-3"/> 支持自动存档</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-2">
                    <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-yellow-300" />
                    全明星大乱斗
                 </h2>
                 <p className="text-indigo-100 opacity-90 max-w-lg text-sm md:text-base">
                    挑战 Unit 1-6 所有单词！混合乱序排列，考验真实力。
                 </p>
              </div>
              <div className="hidden md:flex items-center justify-center bg-white/20 w-16 h-16 rounded-full group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                 <Play className="w-8 h-8 text-white fill-white" />
              </div>
           </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UNIT_DATA.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleUnitClick(unit)}
            className={`
              group cursor-pointer rounded-3xl p-6 shadow-lg border-b-8 transition-all hover:-translate-y-2 hover:shadow-xl relative
              bg-white ${unit.themeColor.split(' ')[1]} active:scale-95
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner
                ${unit.themeColor.split(' ')[0]} 
                ${unit.themeColor.split(' ')[2]}
              `}>
                {React.cloneElement(unit.icon, { className: "w-7 h-7" })}
              </div>
              <span className="text-xs font-bold bg-white/50 text-gray-600 px-2 py-1 rounded-lg">
                第 {unit.id} 单元
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-current transition-colors">
              {unit.title.split(' ')[2] ? unit.title.split(' ')[2] : unit.title.replace(/Unit \d /, '')}
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-4">{unit.subtitle}</p>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5">
              <div className="flex gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-gray-400">准备出发!</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-current group-hover:bg-gray-50 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </main>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-sky-300 text-sm">
        V6.4 - 专为聪明的小朋友设计
      </footer>
    </div>
  );
}
