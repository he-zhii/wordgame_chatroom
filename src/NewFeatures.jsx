import React, { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft, MessageCircle, RefreshCw, Send,
    Flame, History, X, Swords
} from 'lucide-react';

// 后端 API 地址
const API_BASE_URL = 'http://82.157.9.232:3001';

// 用户档案选项
export const AVATAR_OPTIONS = ['🐱', '🐶', '🐼', '🦊', '🐰'];
export const NICKNAME_OPTIONS = ['小明星', '勇敢者', '学霸君', '探险家', '挑战王'];

// 用户档案存储键
export const USER_PROFILE_KEY = 'spelling_user_profile_v1';
export const BRAWL_HISTORY_KEY = 'spelling_brawl_history_v1';

// --- 用户档案选择组件 ---
export function UserProfileModal({ isOpen, onSave }) {
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
    const [selectedNickname, setSelectedNickname] = useState(NICKNAME_OPTIONS[0]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">👋 欢迎来到</h2>
                    <h1 className="text-2xl font-bold text-indigo-600">英语单词大冒险</h1>
                    <p className="text-slate-500 mt-2">选择你的角色开始学习之旅！</p>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs">1</span>
                        选择头像
                    </h3>
                    <div className="flex justify-center gap-3">
                        {AVATAR_OPTIONS.map((avatar) => (
                            <button
                                key={avatar}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`text-4xl p-3 rounded-2xl transition-all ${selectedAvatar === avatar ? 'bg-indigo-100 scale-110 shadow-lg ring-2 ring-indigo-400' : 'bg-slate-100 hover:bg-slate-200'}`}
                            >
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs">2</span>
                        选择昵称
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {NICKNAME_OPTIONS.map((nickname) => (
                            <button
                                key={nickname}
                                onClick={() => setSelectedNickname(nickname)}
                                className={`px-4 py-2 rounded-full font-bold transition-all ${selectedNickname === nickname ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {nickname}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl">
                        <span className="text-4xl">{selectedAvatar}</span>
                        <span className="text-xl font-bold text-slate-700">{selectedNickname}</span>
                    </div>
                </div>

                <button
                    onClick={() => onSave({ avatar: selectedAvatar, nickname: selectedNickname })}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                    开始冒险！🚀
                </button>
            </div>
        </div>
    );
}

// --- 讨论区组件 ---
export function DiscussionScreen({ onBack, userProfile }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/comments`);
            if (!response.ok) throw new Error('获取评论失败');
            const data = await response.json();
            setComments(data);
        } catch (e) {
            setError('无法连接到服务器，请稍后重试');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`${API_BASE_URL}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname: userProfile.nickname,
                    avatar: userProfile.avatar,
                    content: newComment.trim()
                })
            });

            if (!response.ok) throw new Error('发布失败');

            const comment = await response.json();
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (e) {
            alert('发布失败，请稍后重试');
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[100dvh] w-full bg-gradient-to-b from-violet-50 to-pink-50">
            <div className="p-4 flex justify-between items-center bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg sticky top-0 z-20">
                <button onClick={onBack} className="flex items-center gap-1 font-bold bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition">
                    <ArrowLeft className="w-5 h-5" /> 返回
                </button>
                <span className="font-bold tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" /> 讨论区
                </span>
                <button onClick={fetchComments} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-32">
                {isLoading && comments.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="text-slate-400 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" /> 加载中...
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">📡</div>
                        <p className="text-slate-500">{error}</p>
                        <button onClick={fetchComments} className="mt-4 bg-violet-500 text-white px-6 py-2 rounded-full font-bold">
                            重试
                        </button>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">💬</div>
                        <p className="text-slate-500">还没有评论，快来发表第一条吧！</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-2xl mx-auto">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white rounded-2xl p-4 shadow-sm border border-violet-100 hover:shadow-md transition">
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl flex-shrink-0">{comment.avatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-violet-600 text-sm mb-1">{comment.nickname}</div>
                                        <p className="text-slate-700 break-words whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-violet-100 p-4 shadow-lg">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <div className="text-2xl flex-shrink-0 bg-violet-50 w-12 h-12 rounded-full flex items-center justify-center">
                        {userProfile.avatar}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="说点什么..."
                            maxLength={500}
                            className="flex-1 border border-violet-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || isSubmitting}
                            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95 transition flex items-center gap-1"
                        >
                            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 大乱斗配置弹窗 ---
export function BrawlConfigModal({ isOpen, onClose, onStart, savedProgress, allWordsData }) {
    const [wordCount, setWordCount] = useState(30);
    const wordCountOptions = [10, 20, 30, 50];

    const totalAvailableWords = React.useMemo(() => {
        return Object.values(allWordsData).flat().filter(w => w.isActive !== false).length;
    }, [allWordsData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-hidden">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4 shadow-lg">
                        <Flame className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800">🔥 大乱斗模式</h2>
                    <p className="text-slate-500 text-sm mt-1">从全部词库随机抽取单词挑战！</p>
                </div>

                {savedProgress && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-amber-700">检测到未完成的游戏</div>
                                <div className="text-sm text-amber-600">
                                    进度: {savedProgress.currentIndex + 1}/{savedProgress.words.length} | 得分: {savedProgress.score}
                                </div>
                            </div>
                            <button
                                onClick={() => onStart(null, true)}
                                className="bg-amber-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:bg-amber-600 transition"
                            >
                                继续游戏
                            </button>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="font-bold text-slate-700 mb-3">选择单词数量</h3>
                    <div className="flex justify-center gap-2">
                        {wordCountOptions.map((count) => (
                            <button
                                key={count}
                                onClick={() => setWordCount(count)}
                                disabled={count > totalAvailableWords}
                                className={`px-5 py-3 rounded-xl font-bold transition-all ${wordCount === count ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} ${count > totalAvailableWords ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2">可用单词总数: {totalAvailableWords}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onStart(wordCount, false)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Swords className="w-5 h-5" /> 开始新游戏
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 大乱斗历史成绩 ---
export function BrawlHistoryModal({ isOpen, onClose }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (isOpen) {
            try {
                const data = JSON.parse(localStorage.getItem(BRAWL_HISTORY_KEY) || '[]');
                setHistory(data);
            } catch (e) {
                setHistory([]);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const maxScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><History className="w-5 h-5" /> 历史战绩</h2>
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {history.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-4">📊</div>
                            <p className="text-slate-500">还没有战绩记录</p>
                            <p className="text-slate-400 text-sm">完成大乱斗后会自动记录！</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((record, index) => (
                                <div key={index} className={`p-4 rounded-2xl border-2 ${record.score === maxScore ? 'bg-yellow-50 border-yellow-300' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            {record.score === maxScore && <span className="text-yellow-500 text-xs font-bold">👑 最高分</span>}
                                            <div className="font-bold text-lg text-slate-800">{record.score} 分</div>
                                            <div className="text-sm text-slate-500">
                                                {record.correct}/{record.total} 正确 ({Math.round(record.correct / record.total * 100)}%)
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-slate-400">
                                            {new Date(record.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 保存大乱斗历史
export const saveBrawlHistory = (record) => {
    try {
        const history = JSON.parse(localStorage.getItem(BRAWL_HISTORY_KEY) || '[]');
        history.unshift(record);
        // 只保留最近20条记录
        localStorage.setItem(BRAWL_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (e) {
        console.error('保存历史失败', e);
    }
};
