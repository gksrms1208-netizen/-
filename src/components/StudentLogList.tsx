import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Star, Calendar, User, Filter, Award, CheckCircle2, ChevronRight, FileSpreadsheet, Sparkles, MessageSquare, Tag, Bookmark } from 'lucide-react';
import { BookLog } from '../types';
import { exportToCSV } from '../utils/storage';

interface StudentLogListProps {
  logs: BookLog[];
  onSelectLog?: (log: BookLog) => void;
}

export const StudentLogList: React.FC<StudentLogListProps> = ({ logs, onSelectLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLogForModal, setSelectedLogForModal] = useState<BookLog | null>(null);

  // Extract unique student names for dropdown filter
  const studentNames = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.studentName));
    return Array.from(set).sort();
  }, [logs]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.category));
    return Array.from(set).sort();
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        searchTerm === '' ||
        log.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.impression.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStudent = selectedStudent === 'ALL' || log.studentName === selectedStudent;
      const matchCategory = selectedCategory === 'ALL' || log.category === selectedCategory;

      return matchSearch && matchStudent && matchCategory;
    });
  }, [logs, searchTerm, selectedStudent, selectedCategory]);

  // Total Statistics
  const totalBooks = filteredLogs.length;
  const totalPages = filteredLogs.reduce((sum, l) => sum + (l.pageCount || 0), 0);
  const avgRating = totalBooks > 0 ? (filteredLogs.reduce((sum, l) => sum + l.rating, 0) / totalBooks).toFixed(1) : '0';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">누적 등록 권수</p>
            <p className="text-2xl font-bold text-slate-900">{totalBooks}권</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">누적 읽은 페이지</p>
            <p className="text-2xl font-bold text-slate-900">{totalPages.toLocaleString()}쪽</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">평균 만족도 별점</p>
            <p className="text-2xl font-bold text-slate-900">{avgRating} / 5.0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">참여 학생 수</p>
            <p className="text-2xl font-bold text-slate-900">{studentNames.length}명</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="도서명, 지은이, 학생 이름, 줄거리 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* Student Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">👤 모든 학생 기록 ({logs.length}건)</option>
              {studentNames.map((name) => (
                <option key={name} value={name}>
                  {name} 학생
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">📚 모든 장르</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => exportToCSV(filteredLogs, '우리반_누적독서기록.csv')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition ml-auto md:ml-0"
              title="엑셀/CSV 형태로 내보내기"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Cards Grid */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-lg">검색 조건에 맞는 독서기록이 없습니다.</p>
          <p className="text-slate-400 text-xs">새로운 독서기록을 작성하거나 검색 필터를 변경해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLogForModal(log)}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Row: Student & Date */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100">
                      {log.grade}학년 {log.classNum}반 {log.studentName}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                      {log.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {log.readDate}
                  </span>
                </div>

                {/* Book Title & Author */}
                <div className="mt-2">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                    📖 {log.bookTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    지은이: {log.author} {log.publisher ? `| ${log.publisher}` : ''}
                  </p>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 my-2.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < log.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-1.5">{log.rating}.0</span>
                  {log.pageCount ? (
                    <span className="text-xs text-slate-400 ml-2">({log.pageCount}쪽)</span>
                  ) : null}
                </div>

                {/* Summary Preview */}
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 leading-relaxed">
                  <strong className="text-slate-700">줄거리:</strong> {log.summary}
                </p>

                {/* Impression Preview */}
                <p className="text-xs text-indigo-900 line-clamp-2 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/80 italic leading-relaxed">
                  &quot;{log.impression}&quot;
                </p>
              </div>

              {/* Bottom Row: Teacher Stamps & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  {log.teacherStamp ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      선생님 확인 도장 ({log.teacherStamp === 'EXCELLENT' ? '참잘했어요' : '확인완료'})
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">선생님 검토 대기 중</span>
                  )}
                </div>

                <div className="flex items-center text-indigo-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                  <span>자세히 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal Dialog */}
      {selectedLogForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 relative">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md">
                    {selectedLogForModal.grade}학년 {selectedLogForModal.classNum}반
                  </span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-md">
                    {selectedLogForModal.studentName} 학생
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                    {selectedLogForModal.category}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  📖 {selectedLogForModal.bookTitle}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  지은이: {selectedLogForModal.author} {selectedLogForModal.publisher ? `| 출판사: ${selectedLogForModal.publisher}` : ''}
                </p>
              </div>

              <button
                onClick={() => setSelectedLogForModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Read Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">읽은 날짜</span>
                <span className="font-bold text-slate-800">{selectedLogForModal.readDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">별점</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedLogForModal.rating}.0 / 5.0
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">페이지 수</span>
                <span className="font-bold text-slate-800">{selectedLogForModal.pageCount || '-'} 쪽</span>
              </div>
            </div>

            {/* Content 1: Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <span>줄거리</span>
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedLogForModal.summary}
              </div>
            </div>

            {/* Content 2: Reflection */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>느낀 점 (독서소감)</span>
              </h4>
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 text-sm text-purple-950 font-medium whitespace-pre-wrap leading-relaxed">
                {selectedLogForModal.impression}
              </div>
            </div>

            {/* Content 3: Teacher Comment */}
            {selectedLogForModal.teacherComment ? (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>담임 선생님 피드백</span>
                  {selectedLogForModal.teacherStamp && (
                    <span className="ml-auto bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {selectedLogForModal.teacherStamp === 'EXCELLENT' ? '참 잘했어요! 🌟' : '확인 완료 👍'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-950 font-medium">
                  {selectedLogForModal.teacherComment}
                </p>
              </div>
            ) : (
              <div className="bg-slate-100 p-3 rounded-xl text-center text-xs text-slate-500">
                담임 선생님이 아직 작성된 소감을 확인 중입니다.
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogForModal(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
