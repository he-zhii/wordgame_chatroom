import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2, Trophy, ArrowRight, Sparkles, Star, Home, ArrowLeft,
  BookOpen, Users, PawPrint, Apple, Palette, Hash, Eye, Ear,
  HelpCircle, Lightbulb, BookX, Heart, GraduationCap
} from 'lucide-react';

// --- 1. 数据准备区 ---
// (数据保持不变，颜色类名不仅用于样式，也用于确保 Tailwind 不会清理掉它们)

const getColor = (index) => {
  const colors = [
    "text-pink-500", "text-blue-500", "text-green-500",
    "text-purple-500", "text-orange-500", "text-teal-600",
    "text-indigo-500", "text-rose-500", "text-cyan-600"
  ];
  return colors[index % colors.length];
};

const UNIT_DATA = [
  {
    id: 1,
    title: "Unit 1 身体部位",
    subtitle: "Body Parts",
    themeColor: "bg-rose-100 border-rose-300 text-rose-600",
    icon: <Users />, // 图标组件这里只传引用，样式在渲染时动态加
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
    title: "Unit 5 认识颜色",
    subtitle: "Colors",
    themeColor: "bg-indigo-100 border-indigo-300 text-indigo-600",
    icon: <Palette />,
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

// --- 2. 错题本管理 ---

const STORAGE_KEY = 'spellingGame_mistakes_v4';

const getMistakes = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) { return {}; }
};

const saveMistakes = (mistakes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
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

// --- 3. 游戏主组件 ---

function GameScreen({ words, mode, onBack, isMistakeMode = false }) {
  const workingWords = useMemo(() => {
    if (Array.isArray(words)) return words;
    return Object.values(words).sort(() => Math.random() - 0.5);
  }, [words]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [placedLetters, setPlacedLetters] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHearts, setCurrentHearts] = useState(0);
  const [graduatedAnimation, setGraduatedAnimation] = useState(false);
  const audioPlayedRef = useRef(false);

  const currentWordObj = workingWords[currentIndex];

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
    const shuffled = lettersOnly.sort(() => Math.random() - 0.5).map((char, i) => ({
      id: `${char}-${i}-${Math.random()}`,
      char: char,
      isUsed: false
    }));
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
        }
      } else {
        setShowCelebration(true);
        setScore(s => s + 10);
        setShowHint(true);
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
      alert(`太棒了！本轮挑战完成啦！总分：${score}`);
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

  const shouldShowVisuals = mode === 'visual' || showHint || isCompleted;

  if (!currentWordObj) return <div className="text-center p-10">暂时没有内容哦</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className={`p-4 flex justify-between items-center shadow-md relative z-10 ${isMistakeMode ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white'}`}>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1 font-bold hover:bg-white/20 px-3 py-1 rounded-full transition">
            <ArrowLeft className="w-5 h-5" /> 返回
          </button>
          <span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded-lg border border-white/30">
            {isMistakeMode ? '📕 单词加油站' : (mode === 'blind' ? '🎧 听音挑战' : '👀 看图练习')}
          </span>
        </div>
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
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`bg-white max-w-2xl w-full rounded-3xl shadow-xl border-4 overflow-hidden relative min-h-[500px] flex flex-col
          ${isMistakeMode ? 'border-red-100' : 'border-slate-100'}
        `}>
          {graduatedAnimation && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in-up">
              <GraduationCap className="w-24 h-24 text-yellow-500 mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">太棒了！彻底掌握！</h2>
              <p className="text-gray-500 mb-6">这个词已经从错题本移除咯~</p>
              <button onClick={nextLevel} className="bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 transition">
                下一关
              </button>
            </div>
          )}

          <div className="p-6 md:p-10 flex flex-col items-center flex-1">
            <div className="relative mb-6 text-center h-40 flex flex-col justify-center items-center w-full">
              {shouldShowVisuals ? (
                <div className="transition-all duration-500 animate-fade-in-up">
                  <div className={`text-8xl mb-4 transition-transform duration-300 ${isCompleted ? 'scale-110 rotate-6' : ''}`}>
                    {currentWordObj.emoji}
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-bold tracking-widest ${getColor(currentIndex)}`}>
                    {currentWordObj.cn}
                  </h2>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center animate-pulse group">
                  <div
                    className="w-32 h-32 bg-indigo-100 rounded-3xl flex items-center justify-center border-4 border-indigo-200 mb-2 cursor-pointer hover:bg-indigo-200 transition-colors shadow-inner"
                    onClick={handleHint}
                  >
                    <HelpCircle className="w-16 h-16 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm text-indigo-400 font-medium">听不出来？点我看看</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <button onClick={playAudio} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-5 py-2 rounded-full transition-colors font-bold shadow-sm">
                <Volume2 className="w-5 h-5" /> 听听看
              </button>
              {!shouldShowVisuals && (
                <button onClick={handleHint} className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 px-4 py-2 rounded-full transition-colors font-bold shadow-sm">
                  <Lightbulb className="w-5 h-5" /> 偷看一眼
                </button>
              )}
            </div>

            <div className={`flex flex-wrap justify-center gap-2 px-2 min-h-[4rem] ${shake ? 'animate-shake' : ''}`}>
              {placedLetters.map((letter, idx) => {
                if (letter && letter.isSpace) return <div key={`space-${idx}`} className="w-4 md:w-6 h-12 flex-shrink-0"></div>;
                return (
                  <div
                    key={idx} onClick={() => handleSlotClick(idx)}
                    className={`w-12 h-14 md:w-14 md:h-16 flex items-center justify-center text-3xl font-bold rounded-xl border-b-4 transition-all cursor-pointer select-none
                      ${letter ? `bg-white border-blue-200 shadow-md text-blue-600 active:scale-95` : 'bg-slate-100 border-slate-200'}
                      ${isCompleted && letter ? 'bg-green-100 border-green-400 text-green-600' : ''}
                    `}
                  >
                    {letter ? letter.char : ''}
                  </div>
                );
              })}
            </div>

            {/* 修复：透题问题解决！只有 isCompleted 为 true 时才显示音节提示 */}
            <div className="h-8 mb-6 mt-2 flex items-center justify-center gap-1">
              {isCompleted && currentWordObj.syllables && currentWordObj.syllables.map((syl, i) => (
                <React.Fragment key={i}>
                  <span className="text-sm md:text-base font-medium text-green-500 animate-fade-in-up">
                    {syl}
                  </span>
                  {i < currentWordObj.syllables.length - 1 && <span className="text-green-300 mx-0.5">·</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 min-h-[4.5rem]">
              {!isCompleted ? (
                shuffledLetters.map((item) => (
                  <button
                    key={item.id} onClick={() => handleLetterClick(item)} disabled={item.isUsed}
                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl font-bold rounded-xl transition-all transform duration-200
                      ${item.isUsed ? 'opacity-0 scale-50 cursor-default' : 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900 shadow-[0_4px_0_rgb(161,98,7)] active:translate-y-1'}
                    `}
                  >
                    {item.char}
                  </button>
                ))
              ) : (
                !graduatedAnimation && (
                  <div className="animate-fade-in-up">
                    <button onClick={nextLevel} className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2">
                      下一关 ➡️
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}</style>
    </div>
  );
}

// --- 4. 模式选择弹窗 ---

function ModeSelectionModal({ unit, onSelectMode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-br ${unit.themeColor.split(' ')[0].replace('bg-', 'from-').replace('100', '200')} to-white opacity-50`}></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><ArrowLeft className="w-6 h-6" /></button>
        <div className="relative text-center mb-8 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">选择挑战模式</h2>
          <p className="text-gray-500 text-sm">当前单元: {unit.subtitle}</p>
        </div>
        <div className="space-y-4">
          <button onClick={() => onSelectMode('visual')} className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 p-4 rounded-2xl flex items-center gap-4 transition-all group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Eye className="w-6 h-6" /></div>
            <div className="text-left flex-1"><h3 className="font-bold text-gray-800">👀 看图练习</h3><p className="text-xs text-gray-500">看图片记单词，轻松入门</p></div>
          </button>
          <button onClick={() => onSelectMode('blind')} className="w-full bg-white border-2 border-rose-100 hover:border-rose-400 hover:bg-rose-50 p-4 rounded-2xl flex items-center gap-4 transition-all group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Ear className="w-6 h-6" /></div>
            <div className="text-left flex-1"><h3 className="font-bold text-gray-800">👂 听音挑战</h3><p className="text-xs text-gray-500">不看图片，只听声音拼写</p></div>
            <div className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">进阶</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 5. 主入口 (Dashboard) ---

export default function App() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [mistakeData, setMistakeData] = useState({});

  useEffect(() => {
    const checkMistakes = () => {
      const db = getMistakes();
      setMistakeCount(Object.keys(db).length);
    };
    checkMistakes();
    const interval = setInterval(checkMistakes, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleBack = () => {
    setSelectedUnit(null);
    setGameMode(null);
  };

  if (gameMode === 'notebook') {
    return <GameScreen words={mistakeData} mode="notebook" isMistakeMode={true} onBack={handleBack} />;
  }

  if (selectedUnit && gameMode) {
    return <GameScreen words={selectedUnit.words} mode={gameMode} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-sky-50 p-6 font-sans">
      {selectedUnit && !gameMode && (
        <ModeSelectionModal
          unit={selectedUnit}
          onSelectMode={setGameMode}
          onClose={() => setSelectedUnit(null)}
        />
      )}

      <header className="max-w-4xl mx-auto mb-8 relative">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-sky-600 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10" />
            英语单词大冒险
          </h1>
          <p className="text-sky-800 text-lg">三年级上册 (Book 3A)</p>
        </div>

        <div className="absolute top-0 right-0 hidden md:block">
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
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold shadow-sm transition-all border-2
               ${mistakeCount > 0 ? 'bg-white border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-400'}
             `}
        >
          <BookX className="w-5 h-5" />
          复习错题 ({mistakeCount})
        </button>
      </div>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UNIT_DATA.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleUnitClick(unit)}
            className={`
              group cursor-pointer rounded-3xl p-6 shadow-lg border-b-8 transition-all hover:-translate-y-2 hover:shadow-xl relative
              bg-white ${unit.themeColor.split(' ')[1]}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              {/* 修复：不再用 replace 生成背景色，直接使用存在的 bg-rose-100 搭配 text-rose-600 */}
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner
                ${unit.themeColor.split(' ')[0]} 
                ${unit.themeColor.split(' ')[2]}
              `}>
                {/* 图标颜色由父级的 text-rose-600 控制 */}
                {React.cloneElement(unit.icon, { className: "w-7 h-7" })}
              </div>
              <span className="text-xs font-bold bg-white/50 text-gray-600 px-2 py-1 rounded-lg">
                第 {unit.id} 单元
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-current transition-colors">
              {unit.title.split(' ')[2]}
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
        V5.1 - 专为聪明的小朋友设计
      </footer>
    </div>
  );
}
