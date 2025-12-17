import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2, Trophy, ArrowRight, Star, Home, ArrowLeft,
  BookOpen, Users, PawPrint, Apple, Palette, Hash, Eye, Ear,
  HelpCircle, Lightbulb, BookX, Heart, GraduationCap,
  Gamepad2, Save, Play, Music, Edit,
  Settings, X, Plus, Trash2, CheckSquare, Square, RefreshCw,
  PenTool, Keyboard, Lock, Award, Zap, Sunrise, Moon, MousePointer, Sparkles,
  Coffee, Crown, Medal, ThumbsUp, Smile
} from 'lucide-react';

// --- 1. 全局配置与工具 ---

const STORAGE_VERSION = 'v8.7'; // 升级版本号，重置数据结构以修复潜在的积分Bug
const KEYS = {
  WORDS: `spelling_words_${STORAGE_VERSION}`,
  MISTAKES: `spelling_mistakes_${STORAGE_VERSION}`,
  BRAWL: `spelling_brawl_${STORAGE_VERSION}`,
  STATS: `spelling_stats_${STORAGE_VERSION}`,
  ACHIEVEMENTS: `spelling_achievements_${STORAGE_VERSION}`,
  SETTINGS: `spelling_settings_${STORAGE_VERSION}`
};

// 颜色生成器
const getColor = (index) => {
  const colors = [
    "text-pink-500", "text-blue-500", "text-green-500",
    "text-purple-500", "text-orange-500", "text-teal-600",
    "text-indigo-500", "text-rose-500", "text-cyan-600"
  ];
  return colors[index % colors.length];
};

// 洗牌算法
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// 随机 Emoji
const RANDOM_EMOJIS = ["🌟", "🎈", "🐶", "🐱", "🍦", "🌈", "🚀", "⚽", "🎮", "🎸", "📚", "✏️", "🍎", "🍔", "🚲", "⏰", "💡", "🎁", "🔑", "💎"];
const getRandomEmoji = () => RANDOM_EMOJIS[Math.floor(Math.random() * RANDOM_EMOJIS.length)];

// --- 2. 核心功能引擎 ---

// [优化] 愉悦的解锁音效 (Success Chime)
const playAchievementSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // 播放一个大三和弦 (C Major: C5, E5, G5)
    const notes = [523.25, 659.25, 783.99]; 
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // 使用正弦波，听起来更圆润清脆
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1); // 稍微错开时间，形成琶音效果
        
        // 音量包络：快速冲击，缓慢衰减
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 1.5);
    });
  } catch (e) {}
};

// 混合声音引擎 (强制美音)
const playWordAudio = async (word) => {
    if (!word) return;
    const cleanWord = word.toLowerCase().trim().replace(/[^a-z]/g, '');
    
    // 1. 尝试 API (优先找 US 音源)
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
        if (response.ok) {
            const data = await response.json();
            // 优先过滤出 -us.mp3 结尾的音频
            let audioUrl = data[0]?.phonetics?.find(p => p.audio && p.audio.includes('-us.mp3'))?.audio;
            // 如果没有 US 特定的，就拿第一个可用的
            if (!audioUrl) {
                audioUrl = data[0]?.phonetics?.find(p => p.audio && p.audio !== '')?.audio;
            }
            
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.play();
                return;
            }
        }
    } catch (e) {}

    // 2. TTS 降级 (强制 en-US)
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US'; 
        utterance.rate = 0.9;
        
        const voices = window.speechSynthesis.getVoices();
        // 严格筛选美音
        const usVoice = voices.find(v => v.lang === 'en-US' && !v.name.includes('UK') && !v.name.includes('GB'));
        if (usVoice) utterance.voice = usVoice;
        
        window.speechSynthesis.speak(utterance);
    }
};

// --- 3. 数据定义 ---

// 18个成就设计
const ACHIEVEMENTS_DATA = [
  // 🌱 起步阶段
  { id: 'first_steps', title: '初出茅庐', desc: '累计拼对 5 个单词', icon: '🌱', type: 'milestone', condition: (s) => s.totalWords >= 5 },
  { id: 'getting_started', title: '渐入佳境', desc: '累计拼对 25 个单词', icon: '🚲', type: 'milestone', condition: (s) => s.totalWords >= 25 },
  { id: 'half_hundred', title: '半途而不废', desc: '累计拼对 50 个单词', icon: '🏃', type: 'milestone', condition: (s) => s.totalWords >= 50 },
  
  // 🏆 进阶里程碑
  { id: 'vocabulary_king', title: '百词斩', desc: '累计拼对 100 个单词', icon: '⚔️', type: 'milestone', condition: (s) => s.totalWords >= 100 },
  { id: 'word_master', title: '登峰造极', desc: '累计拼对 300 个单词', icon: '👑', type: 'milestone', condition: (s) => s.totalWords >= 300 },
  { id: 'score_tycoon', title: '积分大亨', desc: '总积分达到 1000 分', icon: '💰', type: 'milestone', condition: (s) => s.totalScore >= 1000 },

  // 🔥 连胜挑战
  { id: 'streak_5', title: '连对先锋', desc: '连续答对 5 次不失误', icon: '🔥', type: 'streak', condition: (s) => s.currentStreak >= 5 },
  { id: 'streak_20', title: '心流模式', desc: '连续答对 20 次不失误', icon: '🌊', type: 'streak', condition: (s) => s.currentStreak >= 20 },
  { id: 'streak_50', title: '独孤求败', desc: '连续答对 50 次不失误', icon: '🐉', type: 'streak', condition: (s) => s.currentStreak >= 50 },

  // 🤡 趣味与坚持
  { id: 'shake_master', title: '手滑大王', desc: '累计拼错 20 次', icon: '🌀', type: 'funny', condition: (s) => s.totalMistakes >= 20 },
  { id: 'never_give_up', title: '不屈的灵魂', desc: '累计拼错 100 次', icon: '❤️‍🩹', type: 'funny', condition: (s) => s.totalMistakes >= 100 },
  { id: 'curious_baby', title: '点读机', desc: '累计使用提示 20 次', icon: '💡', type: 'funny', condition: (s) => s.totalHints >= 20 },
  { id: 'encyclopedia', title: '百科全书', desc: '累计使用提示 100 次', icon: '📖', type: 'funny', condition: (s) => s.totalHints >= 100 },

  // 🥚 时间与隐藏彩蛋 (UI上隐藏条件)
  { id: 'early_bird', title: '早起的鸟儿', desc: '在 6:00-8:00 间学习', icon: '🌅', type: 'hidden', condition: () => { const h = new Date().getHours(); return h >= 6 && h < 8; } },
  { id: 'afternoon_tea', title: '勤奋的午后', desc: '在 13:00-15:00 间学习', icon: '☕', type: 'hidden', condition: () => { const h = new Date().getHours(); return h >= 13 && h < 15; } },
  { id: 'night_owl', title: '夜深人静', desc: '在 22:00 之后学习', icon: '🦉', type: 'hidden', condition: () => { const h = new Date().getHours(); return h >= 22; } },
  { id: 'clicker_madness', title: '狂点狂魔', desc: '点击游戏标题 10 次', icon: '👆', type: 'hidden', condition: (s) => s.titleClicks >= 10 },
  { id: 'lucky_star', title: '幸运之星', desc: '累计答对 88 个单词', icon: '🍀', type: 'hidden', condition: (s) => s.totalWords === 88 },
];

const CHANT_DATA = [
  { id: "c1", sentence: "Black, black, sit down.", cn: "黑色，黑色，坐下。", emoji: "⚫🪑", color: "bg-slate-800 text-white", phrase: { word: "sit down", cn: "坐下" } },
  { id: "c2", sentence: "White, white, turn around.", cn: "白色，白色，转个圈。", emoji: "⚪🔄", color: "bg-slate-100 text-slate-800 border-2 border-slate-200", phrase: { word: "turn around", cn: "转圈" } },
  { id: "c3", sentence: "Pink and red, touch the ground.", cn: "粉色和红色，摸摸地面。", emoji: "💗🔴👇", color: "bg-pink-100 text-pink-600", phrase: { word: "touch the ground", cn: "摸地面" } },
  { id: "c4", sentence: "Orange and red, jump up and down.", cn: "橙色和红色，跳上跳下。", emoji: "🟧🔴🦘", color: "bg-orange-100 text-orange-600", phrase: { word: "jump up and down", cn: "跳上跳下" } }
];

// 标题全中文优化
const UNIT_METADATA = [
  { id: 1, title: "身体部位", subtitle: "Body Parts", themeColor: "bg-rose-100 border-rose-300 text-rose-600", icon: Users },
  { id: 2, title: "家庭关系", subtitle: "Family", themeColor: "bg-orange-100 border-orange-300 text-orange-600", icon: Home },
  { id: 3, title: "认识动物", subtitle: "Animals", themeColor: "bg-green-100 border-green-300 text-green-600", icon: PawPrint },
  { id: 4, title: "认识水果", subtitle: "Fruits", themeColor: "bg-yellow-100 border-yellow-300 text-yellow-700", icon: Apple },
  { id: 5, title: "颜色与动作", subtitle: "Colors & Actions", themeColor: "bg-indigo-100 border-indigo-300 text-indigo-600", icon: Palette, hasChant: true },
  { id: 6, title: "数字与拼读", subtitle: "Numbers & Phonics", themeColor: "bg-sky-100 border-sky-300 text-sky-600", icon: Hash }
];

const DEFAULT_WORDS_DATA = {
  1: [
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
  ],
  2: [
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
  ],
  3: [
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
  ],
  4: [
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
  ],
  5: [
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
      { word: "number", cn: "数字", emoji: "🔢", syllables: ["num", "ber"] },
      { word: "boys", cn: "男孩们", emoji: "👦", syllables: ["boys"] },
  ],
  6: [
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
      { word: "van", cn: "救护车", emoji: "🚑", syllables: ["van"] }, 
      { word: "vet", cn: "兽医", emoji: "🩺", syllables: ["vet"] },
      { word: "win", cn: "赢", emoji: "🏆", syllables: ["win"] },
      { word: "box", cn: "盒子", emoji: "📦", syllables: ["box"] },
      { word: "we", cn: "我们", emoji: "🧑‍🤝‍🧑", syllables: ["we"] },
      { word: "yo-yo", cn: "悠悠球", emoji: "🪀", syllables: ["yo", "yo"] },
      { word: "Zip", cn: "次波(松鼠)", emoji: "🐿️", syllables: ["Zip"] },
      { word: "quiz", cn: "知识竞赛", emoji: "🙋", syllables: ["quiz"] },
  ]
};

// --- 4. 存储与管理 ---

const MISTAKE_KEY = 'spellingGame_mistakes_v4';
const BRAWL_KEY = 'spellingGame_brawl_progress_v1';
const SCORE_KEY = 'spellingGame_totalScore_v1';
const SETTINGS_KEY = 'spellingGame_settings_v1';
const WORDS_DATA_KEY = 'spellingGame_words_data_v4'; 

const getStoredWordsData = () => {
  try {
    const data = localStorage.getItem(WORDS_DATA_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading words data:", e);
  }
  const normalizedDefault = {};
  Object.keys(DEFAULT_WORDS_DATA).forEach(unitId => {
    normalizedDefault[unitId] = DEFAULT_WORDS_DATA[unitId].map(w => ({
      ...w,
      isActive: w.isActive !== false
    }));
  });
  return normalizedDefault;
};

const saveWordsData = (data) => localStorage.setItem(WORDS_DATA_KEY, JSON.stringify(data));

// [Bug Fix] 增强的积分读取逻辑，防止 NaN
const getGlobalScore = () => {
  try { 
      const val = parseInt(localStorage.getItem(SCORE_KEY) || '0', 10);
      return isNaN(val) ? 0 : val;
  } catch (e) { return 0; }
};

const updateGlobalScore = (delta) => {
  const current = getGlobalScore();
  const newScore = current + delta;
  localStorage.setItem(SCORE_KEY, newScore.toString());
  return newScore;
};

const getMistakes = () => {
  try { return JSON.parse(localStorage.getItem(MISTAKE_KEY) || '{}'); } catch (e) { return {}; }
};
const saveMistakes = (data) => localStorage.setItem(MISTAKE_KEY, JSON.stringify(data));

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
    }
    saveMistakes(db);
    return 'improved';
  } else {
    db[wordStr].hearts = 0;
    saveMistakes(db);
    return 'reset';
  }
};

const getBrawlProgress = () => {
  try { return JSON.parse(localStorage.getItem(BRAWL_KEY)); } catch (e) { return null; }
};
const saveBrawlProgress = (state) => localStorage.setItem(BRAWL_KEY, JSON.stringify(state));
const clearBrawlProgress = () => localStorage.removeItem(BRAWL_KEY);

const getSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { enableHints: true }; } catch (e) { return { enableHints: true }; }
};
const saveSettings = (s) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

// --- 5. 组件: 游戏内弹窗 (Toast) ---
function ToastNotification({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up w-max max-w-[90vw]">
       <div className="bg-slate-800/90 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20">
          <div className="bg-yellow-400 rounded-full p-1 animate-spin-slow">
             <Trophy className="w-5 h-5 text-yellow-900" />
          </div>
          <span className="font-bold text-sm md:text-base">{message}</span>
       </div>
    </div>
  );
}

// --- 6. 组件: 奖杯墙 (Trophy Wall) [烟花版] ---
function TrophyWallModal({ isOpen, onClose, unlockedIds }) {
  const [particles, setParticles] = useState([]);

  const createParticles = (x, y) => {
    const newParticles = [];
    // 增加粒子数量到 40 个，让烟花更盛大
    for (let i = 0; i < 40; i++) {
        newParticles.push({
            id: Math.random(),
            x, y,
            angle: Math.random() * 360,
            // 增加速度范围，让爆炸范围更大
            speed: Math.random() * 10 + 3,
            color: ['#FBBF24', '#F472B6', '#60A5FA', '#34D399', '#A78BFA', '#F87171'][Math.floor(Math.random() * 6)],
            life: 1,
            decay: Math.random() * 0.02 + 0.01 // 随机衰减，更有层次感
        });
    }
    setParticles(prev => [...prev, ...newParticles]);
    playAchievementSound(); // 触发优美的音效
  };

  useEffect(() => {
    if (particles.length > 0) {
        const timer = requestAnimationFrame(() => {
            setParticles(prev => prev.map(p => ({
                ...p, 
                x: p.x + Math.cos(p.angle * Math.PI / 180) * p.speed, 
                y: p.y + Math.sin(p.angle * Math.PI / 180) * p.speed + 1, // 增加一点重力下坠
                life: p.life - p.decay 
            })).filter(p => p.life > 0));
        });
        return () => cancelAnimationFrame(timer);
    }
  }, [particles]);

  const handleTrophyClick = (e, isUnlocked) => {
      if (isUnlocked) {
          const rect = e.currentTarget.getBoundingClientRect();
          createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in-up">
      {/* 粒子层 (Canvas or DOM) */}
      {particles.map(p => (
          <div key={p.id} className="fixed w-2 h-2 rounded-full pointer-events-none z-[100]" 
               style={{ 
                   left: p.x, top: p.y, 
                   backgroundColor: p.color, 
                   opacity: p.life, 
                   transform: `scale(${p.life * 2})` // 粒子随生命周期缩小
               }} />
      ))}

      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[85vh] overflow-hidden">
         <div className="bg-slate-900/50 p-6 flex justify-between items-center border-b border-slate-700">
            <div>
               <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2"><Award className="w-7 h-7" /> 荣誉陈列室</h2>
               <p className="text-slate-400 text-xs mt-1 tracking-wider uppercase">收集进度: {unlockedIds.length} / {ACHIEVEMENTS_DATA.length}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition text-white"><X className="w-5 h-5"/></button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-900">
            {ACHIEVEMENTS_DATA.map((item) => {
               const isUnlocked = unlockedIds.includes(item.id);
               const isSecret = item.type === 'hidden' && !isUnlocked;
               
               return (
                  <div 
                    key={item.id} 
                    onClick={(e) => handleTrophyClick(e, isUnlocked)}
                    className={`
                        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300
                        ${isUnlocked 
                            ? 'bg-slate-800/80 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-yellow-400 hover:scale-105 cursor-pointer' 
                            : 'bg-slate-800/30 border-slate-800 grayscale opacity-50'
                        }
                    `}
                  >
                     {/* 自动浮动动画 */}
                     <div className={`text-4xl mb-3 transition-transform ${isUnlocked ? 'animate-float' : ''}`}>
                        {isSecret ? '🔒' : item.icon}
                     </div>
                     <h3 className={`font-bold text-center text-sm ${isUnlocked ? 'text-yellow-100' : 'text-slate-600'}`}>
                        {isSecret ? '？？？' : item.title}
                     </h3>
                     {!isSecret && <p className="text-[10px] text-slate-400 text-center mt-1">{item.desc}</p>}
                     {isUnlocked && <Sparkles className="absolute top-2 right-2 w-3 h-3 text-yellow-400 animate-pulse" />}
                  </div>
               );
            })}
         </div>
      </div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// --- 7. 律动小剧场 ---
function SentenceGameScreen({ onBack, settings, onUpdateStats }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState('sentence'); 
  const [placedWords, setPlacedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [sentenceStructure, setSentenceStructure] = useState([]);
  const [isSentenceCompleted, setIsSentenceCompleted] = useState(false);
  const [spellingShuffledLetters, setSpellingShuffledLetters] = useState([]);
  const [spellingPlacedLetters, setSpellingPlacedLetters] = useState([]);
  const [isSpellingCompleted, setIsSpellingCompleted] = useState(false);
  const [spellingShake, setSpellingShake] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const currentChant = CHANT_DATA[currentIndex];
  
  useEffect(() => { initLevel(currentIndex); }, [currentIndex]);
  
  const initLevel = (idx) => {
    const chant = CHANT_DATA[idx];
    setGamePhase('sentence');
    const tokens = chant.sentence.split(/([a-zA-Z]+)/).filter(t => t);
    const structure = [], wordsPool = [];
    tokens.forEach((token, i) => {
      if (/^[a-zA-Z]+$/.test(token)) {
        structure.push({ type: 'word', id: `slot-${i}`, target: token });
        wordsPool.push({ id: `word-${i}-${token}`, text: token, isUsed: false });
      } else if(token.trim()) structure.push({ type: 'punct', content: token });
    });
    setSentenceStructure(structure);
    setPlacedWords(new Array(structure.filter(t => t.type === 'word').length).fill(null));
    setAvailableWords(shuffleArray(wordsPool));
    setIsSentenceCompleted(false);
    const phrase = chant.phrase.word;
    const letterObjs = phrase.replace(/\s/g, '').split('').map((char, i) => ({ id: `spell-${char}-${i}-${Math.random()}`, char: char, isUsed: false }));
    setSpellingShuffledLetters(shuffleArray(letterObjs));
    setSpellingPlacedLetters(phrase.split('').map((char, i) => char === ' ' ? { char: ' ', isSpace: true, id: `space-${i}` } : null));
    setIsSpellingCompleted(false);
    setShowCelebration(false);
    setTimeout(() => playWordAudio(chant.sentence), 800);
  };

  const handleSentenceWordClick = (wordObj) => {
    if (isSentenceCompleted || wordObj.isUsed) return;
    const idx = placedWords.findIndex(w => w === null);
    if (idx === -1) return;
    const newPlaced = [...placedWords]; newPlaced[idx] = wordObj; setPlacedWords(newPlaced);
    setAvailableWords(availableWords.map(w => w.id === wordObj.id ? { ...w, isUsed: true } : w));
    if (newPlaced.every(w => w !== null)) checkSentenceAnswer(newPlaced);
  };

  const handleSentenceSlotClick = (idx) => {
    if (isSentenceCompleted || !placedWords[idx]) return;
    const wordToReturn = placedWords[idx];
    const newPlaced = [...placedWords]; newPlaced[idx] = null; setPlacedWords(newPlaced);
    setAvailableWords(availableWords.map(w => w.id === wordToReturn.id ? { ...w, isUsed: false } : w));
  };

  const checkSentenceAnswer = (finalPlaced) => {
    const userWords = finalPlaced.map(w => w.text);
    const targetWords = sentenceStructure.filter(s => s.type === 'word').map(s => s.target);
    if (userWords.join('') === targetWords.join('')) {
      setIsSentenceCompleted(true); playWordAudio(currentChant.sentence);
    } else {
      alert("Oops! 顺序不对哦，再试一次！");
      setPlacedWords(new Array(finalPlaced.length).fill(null));
      setAvailableWords(availableWords.map(w => ({ ...w, isUsed: false })));
    }
  };

  const handleSpellingLetterClick = (item) => {
     if (isSpellingCompleted || item.isUsed) return;
     const idx = spellingPlacedLetters.findIndex(l => l === null);
     if (idx === -1) return;
     const newShuffled = spellingShuffledLetters.map(l => l.id === item.id ? { ...l, isUsed: true } : l);
     const newPlaced = [...spellingPlacedLetters]; newPlaced[idx] = item;
     setSpellingShuffledLetters(newShuffled); setSpellingPlacedLetters(newPlaced);
     if (newPlaced.every(l => l !== null)) checkSpellingAnswer(newPlaced);
  };
  
  const handleSpellingSlotClick = (idx) => {
      if(isSpellingCompleted || !spellingPlacedLetters[idx] || spellingPlacedLetters[idx].isSpace) return;
      const item = spellingPlacedLetters[idx];
      const newPlaced = [...spellingPlacedLetters]; newPlaced[idx] = null;
      setSpellingPlacedLetters(newPlaced);
      setSpellingShuffledLetters(spellingShuffledLetters.map(l => l.id === item.id ? {...l, isUsed: false} : l));
  };

  const checkSpellingAnswer = (finalPlaced) => {
     if (finalPlaced.map(l => l.char).join('') === currentChant.phrase.word) {
         setIsSpellingCompleted(true); setShowCelebration(true); onUpdateStats('win'); playWordAudio(currentChant.phrase.word);
     } else {
         setSpellingShake(true); setTimeout(() => setSpellingShake(false), 500);
         const userIds = finalPlaced.filter(l => l && !l.isSpace).map(l => l.id);
         setSpellingPlacedLetters(finalPlaced.map(l => (l && l.isSpace) ? l : null));
         setSpellingShuffledLetters(spellingShuffledLetters.map(l => userIds.includes(l.id) ? {...l, isUsed: false} : l));
     }
  };

  const handleHint = () => {
    if(isSpellingCompleted) return;
    const emptyIndex = spellingPlacedLetters.findIndex(l => l === null);
    if (emptyIndex === -1) return;
    const char = currentChant.phrase.word[emptyIndex];
    const target = spellingShuffledLetters.find(l => l.char === char && !l.isUsed);
    if(target) handleSpellingLetterClick(target);
  };

  let wordSlotCounter = 0;
  return (
    <div className={`flex flex-col min-h-[100dvh] w-full overflow-x-hidden ${currentChant.color} transition-colors duration-500`}>
       <div className="p-4 flex justify-between items-center bg-black/10 text-white backdrop-blur-md sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-1 font-bold hover:bg-white/20 px-3 py-1 rounded-full"><ArrowLeft className="w-5 h-5" /> 退出</button>
        <span className="font-bold tracking-wider flex items-center gap-2"><Music className="w-5 h-5 animate-bounce" /> 律动小剧场</span>
      </div>
       <div className="flex-1 flex flex-col items-center justify-center p-4 pb-20">
          <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 min-h-[400px] flex flex-col items-center justify-center">
             {gamePhase === 'sentence' ? (
                 <div className="w-full text-center">
                    <h2 className="text-3xl font-extrabold text-slate-700 mb-6">{currentChant.cn}</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                       {sentenceStructure.map((item, i) => {
                           if(item.type === 'punct') return <span key={i} className="text-4xl font-bold text-slate-400">{item.content}</span>;
                           const idx = wordSlotCounter++; const filled = placedWords[idx];
                           return <div key={i} onClick={() => handleSentenceSlotClick(idx)} className={`h-12 px-4 rounded-xl border-b-4 flex items-center text-xl font-bold cursor-pointer ${filled ? 'bg-indigo-100 text-indigo-600 border-indigo-300' : 'bg-slate-100 border-slate-200 border-dashed'}`}>{filled?.text}</div>
                       })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {!isSentenceCompleted ? availableWords.map(w => (<button key={w.id} onClick={() => handleSentenceWordClick(w)} disabled={w.isUsed} className={`px-4 py-2 rounded-xl font-bold border-b-4 ${w.isUsed ? 'opacity-0' : 'bg-white border-slate-200 hover:-translate-y-1'}`}>{w.text}</button>)) : <button onClick={() => { setGamePhase('spelling'); playWordAudio(currentChant.phrase.word); }} className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg animate-bounce">拼写挑战 ➡️</button>}
                    </div>
                 </div>
             ) : (
                 <div className="w-full text-center">
                     <h2 className="text-2xl font-bold text-slate-700 mb-6">拼写: {currentChant.phrase.cn}</h2>
                     <div className={`flex justify-center gap-2 mb-8 ${spellingShake ? 'animate-shake' : ''}`}>
                        {spellingPlacedLetters.map((l, i) => (l?.isSpace ? <div key={i} className="w-4" /> : <div key={i} onClick={() => handleSpellingSlotClick(i)} className={`w-12 h-14 flex items-center justify-center text-2xl font-bold rounded-xl border-b-4 cursor-pointer ${l ? 'bg-white border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200'}`}>{l?.char}</div>))}
                     </div>
                     <div className="flex justify-center gap-2 mb-6">
                        {!isSpellingCompleted ? spellingShuffledLetters.map(l => (<button key={l.id} onClick={() => handleSpellingLetterClick(l)} disabled={l.isUsed} className={`w-12 h-12 rounded-xl font-bold text-xl ${l.isUsed ? 'opacity-0' : 'bg-yellow-400 text-yellow-900 shadow-md active:scale-95'}`}>{l.char}</button>)) : <button onClick={() => {if(currentIndex < CHANT_DATA.length - 1) setCurrentIndex(c=>c+1); else {alert('通关!'); onBack();}}} className="bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg animate-bounce">{currentIndex < CHANT_DATA.length - 1 ? '下一句 ➡️' : '完成!'}</button>}
                     </div>
                     {!isSpellingCompleted && settings.enableHints && <button onClick={handleHint} className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500"><Lightbulb/></button>}
                     {showCelebration && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-9xl animate-ping opacity-20">🌟</div>}
                 </div>
             )}
          </div>
       </div>
       <style>{`.animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; } @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`}</style>
    </div>
  );
}

// --- 8. 单词拼写游戏主组件 ---

function GameScreen({
  words, mode, onBack, isMistakeMode = false,
  initialIndex = 0, initialScore = 0, preShuffled = false, 
  onProgressUpdate = null, settings, onUpdateStats
}) {
  const activeWords = useMemo(() => isMistakeMode || mode === 'brawl' ? words : words.filter(w => w.isActive !== false), [words, isMistakeMode, mode]);
  const workingWords = useMemo(() => {
    if (activeWords.length === 0) return [];
    if (preShuffled) return activeWords;
    return shuffleArray(Array.isArray(activeWords) ? activeWords : Object.values(activeWords));
  }, [activeWords, preShuffled]);

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
    if (mode === 'brawl' && onProgressUpdate) onProgressUpdate({ words: workingWords, currentIndex, score });
  }, [currentIndex, score, mode, workingWords]);

  useEffect(() => {
    if (currentWordObj) {
      initWord(currentWordObj);
      audioPlayedRef.current = false;
      if (isMistakeMode) setCurrentHearts(currentWordObj.hearts || 0);
    }
  }, [currentIndex, currentWordObj]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!audioPlayedRef.current && currentWordObj && !graduatedAnimation) {
        playWordAudio(currentWordObj.word);
        audioPlayedRef.current = true;
      }
    }, 500);
    return () => { clearTimeout(timer); window.speechSynthesis.cancel(); };
  }, [currentIndex, currentWordObj, graduatedAnimation]);

  const initWord = (wordObj) => {
    const phrase = wordObj.word;
    const lettersOnly = phrase.replace(/\s/g, '').split('');
    const letterObjs = lettersOnly.map((char, i) => ({ id: `${char}-${i}-${Math.random()}`, char: char, isUsed: false }));
    setShuffledLetters(shuffleArray(letterObjs));
    setPlacedLetters(phrase.split('').map((char, i) => char === ' ' ? { char: ' ', isSpace: true, id: `space-${i}` } : null));
    setIsCompleted(false); setShowCelebration(false); setShowHint(false); setGraduatedAnimation(false);
  };

  const handleLetterClick = (item) => {
    if (isCompleted || item.isUsed) return;
    const idx = placedLetters.findIndex(l => l === null);
    if (idx === -1) return;
    const newShuffled = shuffledLetters.map(l => l.id === item.id ? { ...l, isUsed: true } : l);
    const newPlaced = [...placedLetters]; newPlaced[idx] = item;
    setShuffledLetters(newShuffled); setPlacedLetters(newPlaced);
    if (newPlaced.every(l => l !== null)) checkAnswer(newPlaced);
  };

  // [纠错修复版] 智能提示: 强制纠错
  const handleSmartHint = () => {
    if (isCompleted) return;
    const targetWord = currentWordObj.word;
    let indexToFix = -1;
    
    // 1. 优先找空格
    indexToFix = placedLetters.findIndex(l => l === null);
    // 2. 如果全满，找错位
    if (indexToFix === -1) {
       indexToFix = placedLetters.findIndex((l, i) => l && l.char !== targetWord[i]);
    }
    if (indexToFix === -1) return;

    const correctChar = targetWord[indexToFix];
    let tempPlaced = [...placedLetters];
    let tempShuffled = [...shuffledLetters];

    // 移除占位错误
    if (tempPlaced[indexToFix] !== null) {
        const wrongLetter = tempPlaced[indexToFix];
        tempPlaced[indexToFix] = null;
        tempShuffled = tempShuffled.map(l => l.id === wrongLetter.id ? { ...l, isUsed: false } : l);
    }

    // 填入正确
    const letterToAutoFill = tempShuffled.find(l => l.char === correctChar && !l.isUsed);
    if (letterToAutoFill) {
        tempPlaced[indexToFix] = letterToAutoFill;
        tempShuffled = tempShuffled.map(l => l.id === letterToAutoFill.id ? { ...l, isUsed: true } : l);
        setPlacedLetters(tempPlaced); setShuffledLetters(tempShuffled);
        if (tempPlaced.every(l => l !== null)) checkAnswer(tempPlaced);
    }
  };

  const handleSlotClick = (idx) => {
    if (isCompleted || !placedLetters[idx] || placedLetters[idx].isSpace) return;
    const item = placedLetters[idx];
    const newPlaced = [...placedLetters]; newPlaced[idx] = null;
    setPlacedLetters(newPlaced);
    setShuffledLetters(shuffledLetters.map(l => l.id === item.id ? { ...l, isUsed: false } : l));
  };

  const checkAnswer = (finalPlaced) => {
    const userPhrase = finalPlaced.map(l => l.char).join('');
    if (userPhrase === currentWordObj.word) {
      setIsCompleted(true);
      playWordAudio(currentWordObj.word);
      playAchievementSound(); // 单词拼写成功播放音效
      if (isMistakeMode) {
         const res = updateMistakeProgress(currentWordObj.word, true);
         if(res === 'graduated') setGraduatedAnimation(true);
         else { setCurrentHearts(h => h+1); setShowCelebration(true); setScore(s => s+10); updateGlobalScore(10); }
      } else {
         setShowCelebration(true); setScore(s => s+10); updateGlobalScore(10);
      }
      onUpdateStats('win', showHint);
    } else {
      setShake(true); setTimeout(() => setShake(false), 500);
      onUpdateStats('mistake');
      if (isMistakeMode) { updateMistakeProgress(currentWordObj.word, false); setCurrentHearts(0); }
      else addMistake(currentWordObj);
    }
  };

  const nextLevel = () => {
    if (currentIndex < workingWords.length - 1) setCurrentIndex(c => c + 1);
    else {
      if (mode === 'brawl') clearBrawlProgress();
      alert(`🎉 恭喜通关！`); onBack();
    }
  };

  const handleHintTrigger = () => {
    handleSmartHint(); setShowHint(true); onUpdateStats('hint');
  };

  const effectiveMode = mode === 'brawl' ? 'visual' : mode;
  const isDictation = effectiveMode === 'dictation';
  const shouldShowVisuals = effectiveMode === 'visual' || effectiveMode === 'notebook' || showHint || isCompleted || (isDictation && isCompleted);

  if (!currentWordObj) return <div className="text-center p-10">加载中...</div>;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-slate-50">
       <div className={`p-4 flex justify-between items-center shadow-md relative z-10 transition-colors duration-500 ${isMistakeMode ? 'bg-red-500' : 'bg-indigo-500'} text-white`}>
          <div className="flex items-center gap-2">
             <button onClick={onBack} className="flex items-center gap-1 font-bold bg-white/20 px-3 py-1 rounded-full"><ArrowLeft className="w-5 h-5" /> 返回</button>
             <span className="text-xs font-semibold px-2 py-1 bg-white/20 rounded-lg hidden md:inline-block">{mode === 'dictation' ? '📝 默写测验' : '👀 看图练习'}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 px-4 py-1 rounded-full"><Trophy className="w-5 h-5 text-yellow-300 fill-yellow-300" /><span className="font-bold text-lg">{score}</span></div>
       </div>

       <div className="flex-1 flex items-center justify-center p-4 pb-20">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-xl border-4 border-slate-100 overflow-hidden relative min-h-[400px] flex flex-col">
             {graduatedAnimation && <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center animate-fade-in-up"><GraduationCap className="w-24 h-24 text-yellow-500 mb-4 animate-bounce" /><h2 className="text-3xl font-bold">已掌握！</h2><button onClick={nextLevel} className="mt-4 bg-green-500 text-white px-8 py-2 rounded-full font-bold">下一关</button></div>}
             
             <div className="p-4 flex flex-col items-center flex-1">
                <div className="relative mb-6 text-center h-32 flex flex-col justify-center items-center w-full">
                   {shouldShowVisuals ? (
                      <div className="animate-fade-in-up">
                         <div className={`text-6xl mb-2 transition-transform duration-300 ${isCompleted ? 'scale-110 rotate-6' : ''}`}>{currentWordObj.emoji}</div>
                         <h2 className={`text-2xl font-bold tracking-widest ${getColor(currentIndex)}`}>{currentWordObj.cn}</h2>
                      </div>
                   ) : (
                      <div className="flex flex-col items-center animate-pulse cursor-pointer" onClick={handleHintTrigger}>
                         <div className="text-6xl mb-2 text-slate-200"><Keyboard className="w-20 h-20 mx-auto"/></div>
                         <h2 className={`text-2xl font-bold tracking-widest ${getColor(currentIndex)}`}>{currentWordObj.cn}</h2>
                         {isDictation && <p className="text-xs text-slate-400 mt-2">(看中文默写)</p>}
                      </div>
                   )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                   <button onClick={() => playWordAudio(currentWordObj.word)} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold shadow-sm active:scale-95"><Volume2 className="w-5 h-5"/> 听发音</button>
                   {!isCompleted && <button onClick={handleHintTrigger} className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full font-bold shadow-sm active:scale-95"><Lightbulb className="w-5 h-5"/> 提示</button>}
                </div>

                <div className={`flex flex-wrap justify-center gap-2 min-h-[4rem] ${shake ? 'animate-shake' : ''}`}>
                   {placedLetters.map((l, i) => l?.isSpace ? <div key={i} className="w-4"/> : <div key={i} onClick={() => handleSlotClick(i)} className={`w-12 h-16 flex items-center justify-center text-2xl font-bold rounded-xl border-b-4 cursor-pointer ${l ? 'bg-white border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200'} ${isCompleted && l ? 'bg-green-100 border-green-400 text-green-600' : ''}`}>{l?.char}</div>)}
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-8 min-h-[4rem]">
                   {!isCompleted ? shuffledLetters.map(l => (<button key={l.id} onClick={() => handleLetterClick(l)} disabled={l.isUsed} className={`w-14 h-14 sm:w-12 sm:h-12 rounded-xl font-bold text-xl touch-manipulation ${l.isUsed ? 'opacity-0' : 'bg-yellow-400 text-yellow-900 shadow-md active:scale-95'}`}>{l.char}</button>)) : !graduatedAnimation && <button onClick={nextLevel} className="bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg animate-bounce">下一关 ➡️</button>}
                </div>
             </div>
          </div>
       </div>
       <style>{`.animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }`}</style>
    </div>
  );
}

// --- 9. 辅助弹窗 ---

function WordManagerModal({ unit, words, onUpdateWords, onClose }) {
    const [editingWords, setEditingWords] = useState(words);
    const [newWord, setNewWord] = useState("");
    const [newCn, setNewCn] = useState("");
    const scrollRef = useRef(null);
    const handleAdd = () => { if(!newWord || !newCn) return; setEditingWords([...editingWords, { word: newWord, cn: newCn, emoji: getRandomEmoji(), isActive: true, syllables: [newWord] }]); setNewWord(""); setNewCn(""); setTimeout(() => scrollRef.current.scrollTop = scrollRef.current.scrollHeight, 100); };
    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 bg-gray-100 flex justify-between font-bold"><span>管理单词: {unit.subtitle}</span><button onClick={onClose}><X/></button></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={scrollRef}>
                    {editingWords.map((w, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2 rounded border ${w.isActive ? 'bg-white' : 'bg-gray-100 opacity-60'}`}>
                            <button onClick={() => {const n = [...editingWords]; n[i].isActive = !n[i].isActive; setEditingWords(n)}}>{w.isActive ? <CheckSquare className="text-indigo-500"/> : <Square/>}</button>
                            <span className="text-2xl">{w.emoji}</span>
                            <div className="flex-1 font-bold">{w.word} <span className="text-xs font-normal text-gray-500">{w.cn}</span></div>
                            <button onClick={() => setEditingWords(editingWords.filter((_, idx) => idx !== i))}><Trash2 className="text-gray-300 hover:text-red-500"/></button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2 mb-2"><input value={newWord} onChange={e=>setNewWord(e.target.value)} placeholder="英文" className="border p-2 rounded flex-1"/><input value={newCn} onChange={e=>setNewCn(e.target.value)} placeholder="中文" className="border p-2 rounded flex-1"/><button onClick={handleAdd} className="bg-green-500 text-white p-2 rounded"><Plus/></button></div>
                    <button onClick={() => { onUpdateWords(unit.id, editingWords); onClose(); }} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">保存</button>
                </div>
            </div>
        </div>
    );
}

function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, onResetData }) {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6">设置</h2>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-4"><span>💡 拼写提示</span><button onClick={() => onUpdateSettings({...settings, enableHints: !settings.enableHints})} className={`w-12 h-6 rounded-full transition-colors ${settings.enableHints ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.enableHints ? 'translate-x-7' : 'translate-x-1'}`}/></button></div>
                <button onClick={onResetData} className="w-full border border-red-200 text-red-500 py-2 rounded-lg mb-6 flex justify-center gap-2"><RefreshCw className="w-4 h-4"/> 重置数据</button>
                <button onClick={onClose} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold">关闭</button>
            </div>
        </div>
    );
}

function ModeSelectionModal({ unit, onSelectMode, onOpenManager, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-20 bg-gradient-to-br ${unit.themeColor.split(' ')[0].replace('bg-', 'from-').replace('100', '200')} to-white opacity-50`}></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400"><X /></button>
        <div className="relative text-center mb-6 mt-4">
            <h2 className="text-2xl font-bold">{unit.title}</h2>
            <p className="text-xs text-gray-500">{unit.subtitle}</p>
            <button onClick={onOpenManager} className="mt-2 text-xs bg-white border px-3 py-1 rounded-full flex items-center gap-1 mx-auto"><Settings className="w-3 h-3"/> 管理单词</button>
        </div>
        <div className="space-y-3">
            <button onClick={() => onSelectMode('visual')} className="w-full border-2 border-indigo-100 bg-indigo-50 p-4 rounded-xl flex items-center gap-4 hover:scale-105 transition"><Eye className="text-indigo-500"/><div className="text-left"><div className="font-bold">看图练习</div><div className="text-xs text-gray-500">轻松记单词</div></div></button>
            {unit.id !== 5 && <button onClick={() => onSelectMode('dictation')} className="w-full border-2 border-emerald-100 bg-emerald-50 p-4 rounded-xl flex items-center gap-4 hover:scale-105 transition"><PenTool className="text-emerald-500"/><div className="text-left"><div className="font-bold">默写测验</div><div className="text-xs text-gray-500">测试掌握水平</div></div></button>}
            {unit.hasChant && <button onClick={() => onSelectMode('chant')} className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white p-4 rounded-xl flex items-center gap-4 hover:scale-105 transition"><Music/><div className="text-left"><div className="font-bold">律动小剧场</div><div className="text-xs opacity-80">Unit 5 专属</div></div></button>}
        </div>
      </div>
    </div>
  );
}

// --- 10. 主程序 ---

export default function App() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [showManager, setShowManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrophyWall, setShowTrophyWall] = useState(false); 
  const [allWordsData, setAllWordsData] = useState({});
  const [stats, setStats] = useState({ totalWords: 0, totalScore: 0, totalMistakes: 0, totalHints: 0, currentStreak: 0, titleClicks: 0 });
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [settings, setSettings] = useState({ enableHints: true });

  useEffect(() => {
    const storedWords = localStorage.getItem(KEYS.WORDS);
    if(storedWords) setAllWordsData(JSON.parse(storedWords));
    else {
        const normalized = {};
        Object.keys(DEFAULT_WORDS_DATA).forEach(k => normalized[k] = DEFAULT_WORDS_DATA[k].map(w => ({...w, isActive: w.isActive !== false})));
        setAllWordsData(normalized);
    }
    const storedStats = localStorage.getItem(KEYS.STATS);
    if(storedStats) setStats(JSON.parse(storedStats));
    else {
        // [BugFix] 初始化时也同步一次 Score
        setStats(prev => ({ ...prev, totalScore: getGlobalScore() }));
    }
    const storedAch = localStorage.getItem(KEYS.ACHIEVEMENTS);
    if(storedAch) setUnlockedAchievements(JSON.parse(storedAch));
    const storedSettings = localStorage.getItem(KEYS.SETTINGS);
    if(storedSettings) setSettings(JSON.parse(storedSettings));
    checkTimeAchievements();
  }, []);

  useEffect(() => {
     localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
     checkAchievements(stats);
  }, [stats]);

  const checkAchievements = (currentStats) => {
      let newUnlocks = [];
      ACHIEVEMENTS_DATA.forEach(ach => {
          if (!unlockedAchievements.includes(ach.id) && ach.condition(currentStats)) {
              newUnlocks.push(ach);
          }
      });
      if (newUnlocks.length > 0) {
          const newIds = newUnlocks.map(a => a.id);
          const updated = [...unlockedAchievements, ...newIds];
          setUnlockedAchievements(updated);
          localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(updated));
          showToast(`🏆 解锁成就：${newUnlocks[0].title}！`);
      }
  };

  const checkTimeAchievements = () => { setStats(s => ({...s})); };
  const showToast = (msg) => { setToast({ visible: true, message: msg }); setTimeout(() => setToast({ visible: false, message: '' }), 3000); };

  const handleUpdateStats = (type, usedHint) => {
      setStats(prev => {
          const next = { ...prev };
          if (type === 'win') {
              next.totalWords += 1;
              next.totalScore = getGlobalScore(); // Sync score
              if (!usedHint) next.currentStreak += 1;
              else next.currentStreak = 0;
          } else if (type === 'mistake') {
              next.totalMistakes += 1;
              next.currentStreak = 0;
          } else if (type === 'hint') {
              next.totalHints += 1;
              next.currentStreak = 0;
          }
          return next;
      });
  };

  const handleTitleClick = () => { setStats(s => ({ ...s, titleClicks: (s.titleClicks || 0) + 1 })); };

  const renderContent = () => {
      if (gameMode === 'chant') return <SentenceGameScreen onBack={() => setGameMode(null)} settings={settings} onUpdateStats={handleUpdateStats} />;
      if (gameMode && selectedUnit) {
          const words = allWordsData[selectedUnit.id] || [];
          return <GameScreen words={words} mode={gameMode} onBack={() => setGameMode(null)} settings={settings} onUpdateStats={handleUpdateStats} />;
      }
      return (
          <>
             <div className="fixed top-4 left-4 z-50">
                <button onClick={() => setShowTrophyWall(true)} className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold shadow-sm border-2 border-yellow-200 hover:scale-105 transition">
                    <Trophy className="w-5 h-5 fill-yellow-500" />
                    <span>{unlockedAchievements.length}</span>
                </button>
             </div>
             <div className="fixed top-4 right-4 z-50"><button onClick={() => setShowSettings(true)} className="bg-white text-slate-500 p-2 rounded-full shadow-sm border"><Settings/></button></div>
             <header className="max-w-4xl mx-auto mb-8 pt-16 text-center"><h1 onClick={handleTitleClick} className="text-3xl md:text-4xl font-extrabold text-sky-600 mb-2 flex items-center justify-center gap-3 cursor-pointer select-none active:scale-95 transition"><BookOpen className="w-10 h-10" /> 英语单词大冒险</h1><p className="text-sky-800 text-lg">三年级上册 (Book 3A)</p></header>
             <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {UNIT_METADATA.map(unit => (
                    <div key={unit.id} onClick={() => setSelectedUnit(unit)} className={`group cursor-pointer rounded-3xl p-6 shadow-lg border-b-8 transition-all hover:-translate-y-2 hover:shadow-xl bg-white ${unit.themeColor.split(' ')[1]} active:scale-95`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${unit.themeColor.split(' ')[0]} ${unit.themeColor.split(' ')[2]}`}><unit.icon className="w-7 h-7"/></div>
                            <span className="text-xs font-bold bg-white/50 text-gray-600 px-2 py-1 rounded-lg">第 {unit.id} 单元</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{unit.title}</h3>
                        <p className="text-gray-500 text-sm font-medium mb-4">{unit.subtitle}</p>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-black/5">
                            <div className="flex gap-1 text-xs font-bold text-gray-400"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/> {(allWordsData[unit.id] || []).filter(w => w.isActive !== false).length} 词</div>
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600"/>
                        </div>
                    </div>
                ))}
             </main>
          </>
      );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-sky-50 font-sans pb-20">
       {renderContent()}
       <ToastNotification isVisible={toast.visible} message={toast.message} onClose={() => setToast({ ...toast, visible: false })} />
       <TrophyWallModal isOpen={showTrophyWall} onClose={() => setShowTrophyWall(false)} unlockedIds={unlockedAchievements} />
       <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onUpdateSettings={(s) => {setSettings(s); localStorage.setItem(KEYS.SETTINGS, JSON.stringify(s))}} onResetData={() => { localStorage.clear(); window.location.reload(); }} />
       {selectedUnit && !gameMode && !showManager && <ModeSelectionModal unit={selectedUnit} onSelectMode={setGameMode} onOpenManager={() => setShowManager(true)} onClose={() => setSelectedUnit(null)} />}
       {showManager && selectedUnit && <WordManagerModal unit={selectedUnit} words={allWordsData[selectedUnit.id] || []} onUpdateWords={(uid, w) => { const n = {...allWordsData, [uid]: w}; setAllWordsData(n); localStorage.setItem(KEYS.WORDS, JSON.stringify(n)); }} onClose={() => setShowManager(false)} />}
    </div>
  );
}
