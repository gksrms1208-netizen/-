import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  BarChart2,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Edit,
  Award,
  BookOpen,
  Send,
  Trash2,
  Sparkles,
  Settings,
  X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookLog, TeacherSettings } from '../types';
import { updateBookLog, deleteBookLog, saveTeacherSettings, calculateStudentStats, exportToCSV } from '../utils/storage';
import { syncToGoogleSheet } from '../utils/gasScript';

interface TeacherDashboardProps {
  logs: BookLog[];
  teacherSettings: TeacherSettings;
  onSettingsUpdate: (newSettings: TeacherSettings) => void;
  onOpenGasGuide: () => void;
}

const BADGES_LIST = ['다독왕 🏆', '감상평 왕 ✍️', '지식왕 📚', '역사 탐험가 📜', '배려왕 🌸', '과학 탐구가 🔬'];
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#64748b'];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  logs,
  teacherSettings,
  onSettingsUpdate,
  onOpenGasGuide,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editGrade, setEditGrade] = useState(teacherSettings.grade);
  const [editClassNum, setEditClassNum] = useState(teacherSettings.classNum);
  const [editTeacherName, setEditTeacherName] = useState(teacherSettings.teacherName);
  const [editMonthlyTarget, setEditMonthlyTarget] = useState(teacherSettings.monthlyTargetCount);
  const [editNotice, setEditNotice] = useState(teacherSettings.noticeText);
  const [editPin, setEditPin] = useState(teacherSettings.pin);

  // Selected Log for Teacher Commenting
  const [selectedLogForReview, setSelectedLogForReview] = useState<BookLog | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStamp, setReviewStamp] = useState<'EXCELLENT' | 'GOOD' | 'CHECKED'>('EXCELLENT');
  const [selectedBadge, setSelectedBadge] = useState<string>('감상평 왕 ✍️');

  const [isSyncingBatch, setIsSyncingBatch] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);

  // Filter logs for this teacher's class
  const classLogs = useMemo(() => {
    return logs.filter((l) => l.grade === teacherSettings.grade && l.classNum === teacherSettings.classNum);
  }, [logs, teacherSettings]);

  // Unsynced logs count
  const unsyncedLogs = useMemo(() => {
    return classLogs.filter((l) => !l.syncedToGas);
  }, [classLogs]);

  // Stats calculation
  const studentStats = useMemo(() => calculateStudentStats(classLogs), [classLogs]);
  const totalClassBooks = classLogs.length;

  // Chart 1: Category Distribution
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    classLogs.forEach((l) => {
      map[l.category] = (map[l.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [classLogs]);

  // Chart 2: Student Top Readers
  const studentChartData = useMemo(() => {
    return studentStats.slice(0, 8).map((s) => ({
      name: s.studentName,
      권수: s.totalBooks,
    }));
  }, [studentStats]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === teacherSettings.pin || enteredPin === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeacherSettings = {
      ...teacherSettings,
      grade: Number(editGrade),
      classNum: Number(editClassNum),
      teacherName: editTeacherName.trim(),
      monthlyTargetCount: Number(editMonthlyTarget),
      noticeText: editNotice.trim(),
      pin: editPin.trim() || '1234',
    };
    saveTeacherSettings(updated);
    onSettingsUpdate(updated);
    setShowSettingsModal(false);
  };

  const handleSaveTeacherComment = () => {
    if (!selectedLogForReview) return;

    const existingBadges = selectedLogForReview.badges || [];
    const newBadges = existingBadges.includes(selectedBadge) ? existingBadges : [...existingBadges, selectedBadge];

    const updatedLog: BookLog = {
      ...selectedLogForReview,
      teacherComment: reviewComment.trim(),
      teacherStamp: reviewStamp,
      badges: newBadges,
    };

    updateBookLog(updatedLog);
    setSelectedLogForReview(null);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('정말로 이 독서기록을 삭제하시겠습니까?')) {
      deleteBookLog(id);
      setSelectedLogForReview(null);
    }
  };

  const handleBatchGasSync = async () => {
    if (!teacherSettings.gasWebAppUrl) {
      setSyncStatusText('구글 앱스 스크립트 웹앱 URL이 설정되어 있지 않습니다.');
      return;
    }

    if (unsyncedLogs.length === 0) {
      setSyncStatusText('모든 기록이 이미 구글 시트와 동기화되어 있습니다.');
      return;
    }

    setIsSyncingBatch(true);
    setSyncStatusText('구글 시트로 미전송 기록 전송 중...');

    const res = await syncToGoogleSheet(teacherSettings.gasWebAppUrl, unsyncedLogs);

    if (res.success) {
      // Mark all as synced
      unsyncedLogs.forEach((l) => {
        updateBookLog({ ...l, syncedToGas: true });
      });
      setSyncStatusText(`총 ${unsyncedLogs.length}건의 미전송 기록을 구글 시트로 성공적으로 동기화했습니다!`);
    } else {
      setSyncStatusText(`동기화 중 오류 발생: ${res.message}`);
    }

    setIsSyncingBatch(false);
  };

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">교사 대시보드 인증</h2>
          <p className="text-xs text-slate-500 mt-1">
            {teacherSettings.grade}학년 {teacherSettings.classNum}반 학급 관리자 암호를 입력하세요.
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={10}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="암호 입력 (기본 암호: 1234)"
              className="w-full text-center text-lg tracking-widest px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {pinError && <p className="text-xs text-rose-500 font-bold mt-2">암호가 일치하지 않습니다. (기본: 1234)</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition"
          >
            대시보드 접속하기
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          💡 첫 접속 시 기본 비밀번호는 <strong className="text-slate-600">1234</strong> 입니다. 접속 후 변경 가능합니다.
        </p>
      </div>
    );
  }

  // 2. Main Authenticated Teacher Dashboard
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg">
              {teacherSettings.grade}학년 {teacherSettings.classNum}반
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              👩‍🏫 {teacherSettings.teacherName} 선생님 대시보드
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            우리반 학생들의 독서 현황 모니터링, 교사 피드백 입력, 구글 시트 배치 동기화
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition"
          >
            <Settings className="w-4 h-4" />
            <span>학급 설정</span>
          </button>

          <button
            onClick={() => exportToCSV(classLogs, `${teacherSettings.grade}학년_${teacherSettings.classNum}반_독서록.csv`)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>학급 독서록 CSV 다운로드</span>
          </button>
        </div>
      </div>

      {/* GAS Sync Queue Status Box */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <RefreshCw className={`w-6 h-6 ${isSyncingBatch ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">구글 시트 연동 상태 관리</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                unsyncedLogs.length === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {unsyncedLogs.length === 0 ? '모두 동기화 완료' : `미전송 ${unsyncedLogs.length}건`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {teacherSettings.gasWebAppUrl
                ? '학생들이 제출한 독서록을 구글 시트로 일괄 동기화할 수 있습니다.'
                : '구글 앱스 스크립트 웹앱 URL 설정이 필요합니다.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {!teacherSettings.gasWebAppUrl && (
            <button
              onClick={onOpenGasGuide}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              연동 가이드 및 URL 설정
            </button>
          )}

          <button
            onClick={handleBatchGasSync}
            disabled={isSyncingBatch || !teacherSettings.gasWebAppUrl || unsyncedLogs.length === 0}
            className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isSyncingBatch ? '동기화 진행 중...' : '미전송 기록 일괄 동기화'}</span>
          </button>
        </div>
      </div>

      {syncStatusText && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold text-center">
          {syncStatusText}
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Top Readers Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <span>학생별 독서 권수 현황</span>
          </h3>

          {studentChartData.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">등록된 학생 독서 기록이 없습니다.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentChartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(val) => [`${val}권`, '독서량']} />
                  <Bar dataKey="권수" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Category Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>도서 분야/장르별 분포</span>
          </h3>

          {categoryChartData.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">장르 데이터가 없습니다.</p>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}권`, '권수']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Student Log Roster Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>학급 독서록 검토 및 교사 확인 도장 수여</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">총 {classLogs.length}건 등록됨</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">학생</th>
                <th className="px-4 py-3.5">도서명 / 지은이</th>
                <th className="px-4 py-3.5">장르 / 별점</th>
                <th className="px-4 py-3.5">읽은 날짜</th>
                <th className="px-4 py-3.5">교사 피드백/도장</th>
                <th className="px-4 py-3.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-4 font-extrabold text-slate-900">
                    {log.studentName}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-900">{log.bookTitle}</p>
                    <p className="text-xs text-slate-500">{log.author}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {log.category}
                    </span>
                    <span className="text-xs font-bold text-amber-500 ml-2">★ {log.rating}.0</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">{log.readDate}</td>
                  <td className="px-4 py-4 text-xs">
                    {log.teacherComment ? (
                      <div className="space-y-0.5">
                        <span className="text-emerald-700 font-bold block">
                          {log.teacherStamp === 'EXCELLENT' ? '🌟 참 잘했어요!' : '👍 확인 완료'}
                        </span>
                        <p className="text-slate-500 line-clamp-1">{log.teacherComment}</p>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-medium">검토 대기중</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedLogForReview(log);
                          setReviewComment(log.teacherComment || '');
                          setReviewStamp(log.teacherStamp || 'EXCELLENT');
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition"
                      >
                        검토 / 도장
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Comment Modal */}
      {selectedLogForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {selectedLogForReview.studentName} 학생 독서록 검토
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  📖 {selectedLogForReview.bookTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogForReview(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Student's Summary & Impression */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800">
              <div>
                <strong className="text-slate-900 block mb-1">줄거리:</strong>
                <p className="whitespace-pre-wrap">{selectedLogForReview.summary}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <strong className="text-indigo-900 block mb-1">느낀 점 (소감):</strong>
                <p className="whitespace-pre-wrap text-indigo-950">{selectedLogForReview.impression}</p>
              </div>
            </div>

            {/* Teacher Feedback Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">교사 칭찬 도장 선택</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStamp('EXCELLENT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStamp === 'EXCELLENT'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    🌟 참 잘했어요!
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStamp('GOOD')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStamp === 'GOOD'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    👍 최고예요!
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStamp('CHECKED')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reviewStamp === 'CHECKED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✅ 확인 완료
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">칭찬 배지 수여</label>
                <div className="flex flex-wrap gap-1.5">
                  {BADGES_LIST.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBadge(b)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                        selectedBadge === b
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">선생님 한마디 (피드백)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="학생에게 용기와 격려를 주는 따뜻한 피드백을 남겨주세요."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDeleteLog(selectedLogForReview.id)}
                className="text-xs text-rose-500 hover:underline font-bold"
              >
                독서록 삭제
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLogForReview(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherComment}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow"
                >
                  피드백 저장 및 도장 찍기 🌟
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>학급 정보 및 대시보드 설정</span>
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">학년</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editGrade}
                    onChange={(e) => setEditGrade(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">반</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editClassNum}
                    onChange={(e) => setEditClassNum(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">담임교사 성함</label>
                <input
                  type="text"
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">월 학급 목표 권수</label>
                <input
                  type="number"
                  value={editMonthlyTarget}
                  onChange={(e) => setEditMonthlyTarget(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">학급 독서 공지사항</label>
                <textarea
                  value={editNotice}
                  onChange={(e) => setEditNotice(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">교사 대시보드 암호 (비밀번호)</label>
                <input
                  type="text"
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  placeholder="1234"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  설정 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
