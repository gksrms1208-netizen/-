import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Quote,
  Sparkles,
  BookOpen,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Star,
  Bookmark,
  Library,
  Feather,
  TrendingUp,
  Award,
  ArrowDown,
  Check,
  Share2
} from 'lucide-react';
import { BOOK_QUOTES, RECOMMENDED_BOOKS, BookQuote, RecommendedBook } from '../data/quotes';
import { BookLog } from '../types';

interface BookstoreHeroProps {
  logs: BookLog[];
  onSelectBookForLog: (book: { title: string; author: string; category?: string }) => void;
  onScrollToForm: () => void;
}

export const BookstoreHero: React.FC<BookstoreHeroProps> = ({
  logs,
  onSelectBookForLog,
  onScrollToForm,
}) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto rotate quote every 6 seconds if autoplay is active
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % BOOK_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeQuote = BOOK_QUOTES[currentQuoteIndex];

  const handleNextQuote = () => {
    setIsAutoPlaying(false);
    setCurrentQuoteIndex((prev) => (prev + 1) % BOOK_QUOTES.length);
  };

  const handlePrevQuote = () => {
    setIsAutoPlaying(false);
    setCurrentQuoteIndex((prev) => (prev - 1 + BOOK_QUOTES.length) % BOOK_QUOTES.length);
  };

  const handleRandomQuote = () => {
    setIsAutoPlaying(false);
    let newIdx = Math.floor(Math.random() * BOOK_QUOTES.length);
    if (newIdx === currentQuoteIndex) {
      newIdx = (newIdx + 1) % BOOK_QUOTES.length;
    }
    setCurrentQuoteIndex(newIdx);
  };

  const handleCopyQuote = (quote: BookQuote) => {
    const text = `"${quote.quote}" - ${quote.author}`;
    navigator.clipboard.writeText(text);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['전체', '지혜', '꿈과모험', '위로와성장', '마음의양식', '습관'];

  const filteredQuotes = selectedCategory === '전체'
    ? BOOK_QUOTES
    : BOOK_QUOTES.filter((q) => q.category === selectedCategory);

  // Stats calculation
  const totalBooks = logs.length;
  const totalPages = logs.reduce((sum, log) => sum + (log.pageCount || 0), 0);
  const uniqueStudents = new Set(logs.map((l) => `${l.grade}-${l.classNum}-${l.studentName}`)).size;

  return (
    <div className="space-y-10 mb-10">
      {/* 1. Dynamic Hero Quotes Banner (독서 명언 대형 메인 쇼케이스) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/40 text-white">
        {/* Animated Background Theme Gradient */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuote.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${activeQuote.bgTheme}`}
          />
        </AnimatePresence>

        {/* Overlay Paper Texture & Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.6))] pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 md:p-12 min-h-[360px] flex flex-col justify-between">
          {/* Top Bar: Label & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>오늘의 독서 명언</span>
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-300/80 font-medium">
                #{activeQuote.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomQuote}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 backdrop-blur-md border border-white/10 transition active:scale-95"
                title="랜덤 명언 뽑기"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">랜덤 명언</span>
              </button>

              <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10 backdrop-blur-md">
                <button
                  onClick={handlePrevQuote}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  title="이전 명언"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-slate-200">
                  {currentQuoteIndex + 1} / {BOOK_QUOTES.length}
                </span>
                <button
                  onClick={handleNextQuote}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  title="다음 명언"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Quote Text Display with Motion */}
          <div className="my-auto py-4 max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuote.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <Quote className="w-10 h-10 sm:w-14 sm:h-14 text-amber-300/40 rotate-180 -mb-2" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight leading-relaxed text-amber-50 drop-shadow-md">
                  "{activeQuote.quote}"
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-base sm:text-lg text-slate-200 font-medium italic flex items-center gap-2">
                    <Feather className="w-4 h-4 text-amber-400" />
                    <span>— {activeQuote.author}</span>
                  </p>

                  <button
                    onClick={() => handleCopyQuote(activeQuote)}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 flex items-center gap-1.5 transition border border-white/15"
                  >
                    {copiedId === activeQuote.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>명언 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Action & Quote Progress Bar */}
          <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>책 속의 지혜로 하루를 시작해보세요</span>
            </div>

            <button
              onClick={onScrollToForm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Feather className="w-4 h-4" />
              <span>지금 독서기록 작성하기</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Quote Cards Gallery (감성 독서 명언 라이브러리) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-serif flex items-center gap-2">
              <Library className="w-5 h-5 text-indigo-600" />
              <span>마음에 울림을 주는 독서 명언 서재</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              카테고리별로 감명 깊은 독서 명언들을 둘러보세요.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                const fullIndex = BOOK_QUOTES.findIndex((item) => item.id === q.id);
                if (fullIndex !== -1) {
                  setCurrentQuoteIndex(fullIndex);
                  setIsAutoPlaying(false);
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                BOOK_QUOTES[currentQuoteIndex].id === q.id
                  ? 'bg-indigo-900 text-white border-indigo-700 shadow-lg ring-2 ring-indigo-400'
                  : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      BOOK_QUOTES[currentQuoteIndex].id === q.id
                        ? 'bg-indigo-800 text-amber-300 border border-indigo-600'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}
                  >
                    #{q.category}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyQuote(q);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-slate-200/50 text-xs"
                    title="명언 복사"
                  >
                    {copiedId === q.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>

                <p className="text-sm font-serif font-medium leading-relaxed line-clamp-3">
                  "{q.quote}"
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100/20 flex items-center justify-between text-xs font-semibold opacity-90">
                <span className="truncate">— {q.author}</span>
                {BOOK_QUOTES[currentQuoteIndex].id === q.id && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    선택됨
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Online Bookstore Recommended Shelf ("📚 이달의 추천 도서 서대") */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold font-serif text-amber-100">
                이달의 학급 추천 도서 코너
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              무슨 책을 읽을지 고민된다면? 검증된 학급 추천도서를 선택하고 바로 독서록을 작성해 보세요!
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-indigo-900/60 px-3 py-1.5 rounded-xl border border-indigo-700/50">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200">인기 독서 카테고리 포함</span>
          </div>
        </div>

        {/* Book Shelf Carousel/Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {RECOMMENDED_BOOKS.map((book, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 hover:bg-slate-800 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg group"
            >
              <div className="space-y-3">
                {/* Book Visual Cover Card */}
                <div
                  className={`h-40 rounded-xl bg-gradient-to-br ${book.coverColor} p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden border border-white/20`}
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-black/40 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                      {book.tag}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-200 opacity-90 font-medium">{book.author}</p>
                    <h3 className="text-sm font-bold font-serif text-white line-clamp-2 drop-shadow">
                      {book.title}
                    </h3>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {book.summary}
                </p>
              </div>

              {/* Action Button: Pre-fill Form */}
              <button
                onClick={() => {
                  onSelectBookForLog({
                    title: book.title,
                    author: book.author,
                  });
                  onScrollToForm();
                }}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>이 책으로 기록하기</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Classroom Reading Lounge Dashboard Bar (우리반 독서 서재 현황) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">우리반 총 누적 기록</p>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {totalBooks} <span className="text-sm font-normal text-slate-500">권</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">독서에 참여한 학생 수</p>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {uniqueStudents} <span className="text-sm font-normal text-slate-500">명</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">총 읽은 페이지 수</p>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {totalPages.toLocaleString()} <span className="text-sm font-normal text-slate-500">쪽</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
