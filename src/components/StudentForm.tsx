import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Send, Save, CheckCircle2, Sparkles, BookMarked, User, Calendar, Tag, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookLog, TeacherSettings } from '../types';
import { addBookLog } from '../utils/storage';
import { syncToGoogleSheet } from '../utils/gasScript';

interface StudentFormProps {
  teacherSettings: TeacherSettings;
  onSuccess: (newLog: BookLog) => void;
  onOpenGasGuide: () => void;
  prefillBook?: { title: string; author: string } | null;
}

const CATEGORIES = ['문학/동화', '과학/환경', '역사/인물', '사회/철학', '예술/문화', '수학/지능', '만화/그래픽노블', '기타'];

export const StudentForm: React.FC<StudentFormProps> = ({
  teacherSettings,
  onSuccess,
  onOpenGasGuide,
  prefillBook
}) => {
  // Load saved student identity from previous entry
  const savedIdentity = (() => {
    try {
      const raw = localStorage.getItem('last_student_identity');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [grade, setGrade] = useState<number>(savedIdentity?.grade || teacherSettings.grade || 5);
  const [classNum, setClassNum] = useState<number>(savedIdentity?.classNum || teacherSettings.classNum || 2);
  const [studentName, setStudentName] = useState<string>(savedIdentity?.studentName || '');

  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [readDate, setReadDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pageCount, setPageCount] = useState<number | ''>('');
  const [category, setCategory] = useState('문학/동화');
  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState('');
  const [impression, setImpression] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Sync prefillBook if provided
  useEffect(() => {
    if (prefillBook) {
      if (prefillBook.title) setBookTitle(prefillBook.title);
      if (prefillBook.author) setAuthor(prefillBook.author);
      setStatusMessage({
        type: 'info',
        text: `📚 '${prefillBook.title}' 도서 정보가 입력되었습니다. 줄거리와 소감을 채워서 제출해 보세요!`,
      });
    }
  }, [prefillBook]);

  // Auto-save identity on change
  useEffect(() => {
    if (studentName) {
      localStorage.setItem('last_student_identity', JSON.stringify({ grade, classNum, studentName }));
    }
  }, [grade, classNum, studentName]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      setStatusMessage({ type: 'error', text: '학생 이름을 입력해 주세요.' });
      return;
    }
    if (!bookTitle.trim()) {
      setStatusMessage({ type: 'error', text: '도서명을 입력해 주세요.' });
      return;
    }
    if (!author.trim()) {
      setStatusMessage({ type: 'error', text: '지은이(저자)를 입력해 주세요.' });
      return;
    }
    if (!summary.trim() || summary.trim().length < 10) {
      setStatusMessage({ type: 'error', text: '줄거리를 10자 이상 작성해 주세요.' });
      return;
    }
    if (!impression.trim() || impression.trim().length < 10) {
      setStatusMessage({ type: 'error', text: '간단한 소감을 10자 이상 작성해 주세요.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: '독서기록을 동기화 저장 중입니다...' });

    // 1. Local Storage Add
    const createdLog = addBookLog({
      grade: Number(grade),
      classNum: Number(classNum),
      studentName: studentName.trim(),
      bookTitle: bookTitle.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      readDate,
      pageCount: pageCount ? Number(pageCount) : 0,
      category,
      rating,
      summary: summary.trim(),
      impression: impression.trim(),
      syncedToGas: false,
    });

    // 2. Real-time Google Sheet Sync if GAS URL is configured
    let gasSuccess = false;
    let syncNotice = '';

    if (teacherSettings.gasWebAppUrl && teacherSettings.gasWebAppUrl.trim().startsWith('http')) {
      const res = await syncToGoogleSheet(teacherSettings.gasWebAppUrl, createdLog);
      gasSuccess = res.success;
      syncNotice = res.message;

      if (gasSuccess) {
        createdLog.syncedToGas = true;
      }
    } else {
      syncNotice = '구글 시트 연동 URL이 미설정 상태여서 기기에 안전하게 저장되었습니다.';
    }

    setIsSubmitting(false);
    triggerConfetti();

    setStatusMessage({
      type: 'success',
      text: `🎉 독서기록이 등록되었습니다! ${gasSuccess ? '(구글 시트 동기화 완료 📊)' : ''}`,
    });

    // Reset Form Fields (keep student identity for easy next log!)
    setBookTitle('');
    setAuthor('');
    setPublisher('');
    setPageCount('');
    setSummary('');
    setImpression('');

    onSuccess(createdLog);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Notice Banner */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <BookMarked className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold tracking-tight">오늘 읽은 책을 기록해 보세요!</h2>
            </div>
            <p className="text-slate-300 text-sm">
              학번과 이름을 입력하고 도서 정보와 느낀 점을 정성껏 적어주면 선생님 구글 시트에 실시간 기록됩니다.
            </p>
          </div>
          {teacherSettings.noticeText && (
            <div className="bg-indigo-950/80 border border-indigo-400/30 p-3 rounded-xl text-xs text-indigo-200 max-w-sm">
              <p className="font-semibold text-amber-300 mb-0.5">📢 담임 선생님 안내</p>
              <p className="line-clamp-2">{teacherSettings.noticeText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8 space-y-8">
        
        {/* Section 1: Student Identity */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-lg">1. 작성자 학생 정보</h3>
            <span className="text-xs text-slate-500">(한 번 작성하면 다음 기록 시 자동으로 유지됩니다)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">학년</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    {g}학년
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">반</label>
              <select
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>
                    {c}반
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학생 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="예: 홍길동"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Book Info */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-lg">2. 도서 기본 정보</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                도서명 (책 제목) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="예: 어린 왕자"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                지은이 (저자) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: 생텍쥐페리"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">출판사</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="예: 열린책들"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">읽은 날짜</label>
              <div className="relative">
                <input
                  type="date"
                  value={readDate}
                  onChange={(e) => setReadDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">페이지 수 (선택)</label>
              <input
                type="number"
                min="1"
                max="3000"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="예: 180"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">도서 장르/분류</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      category === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">내가 매기는 별점</label>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow'
                            : 'text-slate-200 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700 ml-2">{rating}점 / 5점</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Summary and Reflection */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-lg">3. 줄거리 및 느낀 점 (독서소감)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  줄거리 <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">책의 핵심 내용이나 이야기 흐름을 정리해보세요.</span>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                required
                placeholder="책을 읽고 주인공이나 주요 이야기 사건, 중심 내용이 무엇이었는지 구체적으로 적어보세요."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition leading-relaxed resize-y"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  간단한 소감 (느낀 점) <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">인상 깊었던 구절, 깨달은 점, 배운 점 등</span>
              </div>
              <textarea
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                rows={4}
                required
                placeholder="이 책을 읽고 나에게 생긴 변화나 깨달은 점, 기억에 남는 장면이나 주인공에게 하고 싶은 말을 작성해 보세요."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'info'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                className={`w-5 h-5 flex-shrink-0 ${
                  statusMessage.type === 'success'
                    ? 'text-emerald-600'
                    : statusMessage.type === 'info'
                    ? 'text-indigo-600'
                    : 'text-rose-600'
                }`}
              />
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onOpenGasGuide}
            className="text-xs text-slate-500 hover:text-indigo-600 underline flex items-center gap-1"
          >
            <span>💡 구글 시트에 실시간 자동 제출이 안 되나요? (연동 가이드 보기)</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? '전송 중...' : '독서기록 제출하기'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
