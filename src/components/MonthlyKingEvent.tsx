import React, { useState, useMemo } from 'react';
import { Award, Trophy, Crown, Medal, Sparkles, Printer, Target, Star, ChevronRight, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookLog, TeacherSettings, MonthlyHallOfFame } from '../types';
import { calculateStudentStats, getStoredHallOfFame, saveHallOfFame } from '../utils/storage';

interface MonthlyKingEventProps {
  logs: BookLog[];
  teacherSettings: TeacherSettings;
}

export const MonthlyKingEvent: React.FC<MonthlyKingEventProps> = ({ logs, teacherSettings }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [hallOfFameList, setHallOfFameList] = useState<MonthlyHallOfFame[]>(() => getStoredHallOfFame());
  const [selectedStudentForAward, setSelectedStudentForAward] = useState<{
    name: string;
    bookCount: number;
    awardTitle: string;
  } | null>(null);

  // Filter logs for the selected month
  const monthlyLogs = useMemo(() => {
    return logs.filter((l) => l.monthKey === selectedMonth || l.readDate.startsWith(selectedMonth));
  }, [logs, selectedMonth]);

  // Calculate stats for top readers
  const studentRankings = useMemo(() => {
    return calculateStudentStats(monthlyLogs);
  }, [monthlyLogs]);

  // Class monthly total books
  const classTotalMonthBooks = monthlyLogs.length;
  const targetCount = teacherSettings.monthlyTargetCount || 30;
  const targetPercent = Math.min(100, Math.round((classTotalMonthBooks / targetCount) * 100));

  const top1 = studentRankings[0];
  const top2 = studentRankings[1];
  const top3 = studentRankings[2];

  const triggerCertificateConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Event Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-20 pointer-events-none">
          <Crown className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-100 border border-white/30">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>우리반 독서 왕중왕전 이벤트</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            🏆 {teacherSettings.grade}학년 {teacherSettings.classNum}반 이달의 독서왕
          </h2>

          <p className="text-amber-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            책을 읽고 쌓은 지식과 깊은 독서 소감이 결실을 맺는 시간! 매달 가장 많이 책을 읽고 훌륭한 독서록을 작성한
            학생을 선정하여 상장을 수여합니다.
          </p>

          {/* Monthly Target Progress Bar */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 space-y-2 max-w-2xl">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1.5 text-amber-200">
                <Target className="w-4 h-4" />
                <span>우리반 이번 달 목표 달성도</span>
              </span>
              <span className="text-white">
                {classTotalMonthBooks}권 / {targetCount}권 ({targetPercent}%)
              </span>
            </div>

            <div className="w-full bg-slate-900/60 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${targetPercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-amber-200 text-right">
              {targetPercent >= 100
                ? '🎉 우와! 학급 독서 목표를 달성했습니다!'
                : `목표 달성까지 앞으로 ${Math.max(0, targetCount - classTotalMonthBooks)}권 남았습니다!`}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>이달의 독서왕 TOP 3 명예의 단상</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">기준 월: {selectedMonth}</span>
        </div>

        {studentRankings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-bold">선택한 달의 독서 기록이 아직 없습니다.</p>
            <p className="text-xs text-slate-400">첫 번째 독서기록을 작성하여 이달의 독서왕에 도전해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50 to-slate-100/80 p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center mx-auto shadow-sm text-xl border border-slate-300">
                  🥈 2위
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">{top2 ? top2.studentName : '도전 대기'}</h4>
                <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                  {top2 ? `${top2.totalBooks}권 읽음 (${top2.totalPages}쪽)` : '0권'}
                </p>
              </div>

              {top2 && (
                <button
                  onClick={() => {
                    setSelectedStudentForAward({
                      name: top2.studentName,
                      bookCount: top2.totalBooks,
                      awardTitle: '🥈 우수 독서 노력상',
                    });
                    triggerCertificateConfetti();
                  }}
                  className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  상장 출력하기 📜
                </button>
              )}
            </div>

            {/* 1st Place (Crown) */}
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 text-white p-7 rounded-3xl shadow-xl text-center flex flex-col justify-between relative transform md:-translate-y-4 border-2 border-amber-300">
              <div className="absolute top-2 right-2 opacity-20">
                <Crown className="w-16 h-16 text-white" />
              </div>

              <div className="space-y-3">
                <div className="w-14 h-14 bg-white text-amber-600 font-extrabold rounded-2xl flex items-center justify-center mx-auto shadow-md text-2xl border-2 border-amber-200">
                  👑 1위
                </div>
                <div className="inline-block px-3 py-0.5 bg-amber-950/40 text-amber-100 text-xs font-bold rounded-full border border-amber-300/40">
                  최다독 최고독서왕 🏆
                </div>
                <h4 className="text-2xl font-black">{top1 ? top1.studentName : '도전 대기'}</h4>
                <p className="text-sm font-bold bg-white text-amber-900 px-4 py-1.5 rounded-full inline-block shadow">
                  {top1 ? `${top1.totalBooks}권 읽음 (${top1.totalPages}쪽)` : '0권'}
                </p>
              </div>

              {top1 && (
                <button
                  onClick={() => {
                    setSelectedStudentForAward({
                      name: top1.studentName,
                      bookCount: top1.totalBooks,
                      awardTitle: '🥇 최우수 이달의 독서왕',
                    });
                    triggerCertificateConfetti();
                  }}
                  className="mt-6 w-full py-3 bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-sm rounded-xl shadow-lg transition"
                >
                  최우수 독서왕 상장 수여 📜
                </button>
              )}
            </div>

            {/* 3rd Place */}
            <div className="order-3 bg-gradient-to-b from-amber-50/50 to-amber-100/60 p-6 rounded-3xl border border-amber-200/80 shadow-sm text-center flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-amber-200 text-amber-800 font-bold rounded-2xl flex items-center justify-center mx-auto shadow-sm text-xl border border-amber-300">
                  🥉 3위
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">{top3 ? top3.studentName : '도전 대기'}</h4>
                <p className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full inline-block">
                  {top3 ? `${top3.totalBooks}권 읽음 (${top3.totalPages}쪽)` : '0권'}
                </p>
              </div>

              {top3 && (
                <button
                  onClick={() => {
                    setSelectedStudentForAward({
                      name: top3.studentName,
                      bookCount: top3.totalBooks,
                      awardTitle: '🥉 독서 열정상',
                    });
                    triggerCertificateConfetti();
                  }}
                  className="mt-6 w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  상장 출력하기 📜
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Medal className="w-5 h-5 text-indigo-600" />
            <span>학급 전체 학생 독서 순위</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">총 {studentRankings.length}명 참여 중</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/80 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">순위</th>
                <th className="px-5 py-3.5">학생 이름</th>
                <th className="px-5 py-3.5">읽은 권수</th>
                <th className="px-5 py-3.5">총 읽은 쪽수</th>
                <th className="px-5 py-3.5">최근 읽은 날짜</th>
                <th className="px-5 py-3.5 text-right">상장 발급</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRankings.map((student, idx) => (
                <tr key={student.studentName} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {idx === 0 ? '🥇 1위' : idx === 1 ? '🥈 2위' : idx === 2 ? '🥉 3위' : `${idx + 1}위`}
                  </td>
                  <td className="px-5 py-4 font-extrabold text-indigo-950">{student.studentName}</td>
                  <td className="px-5 py-4 font-bold text-emerald-600">{student.totalBooks}권</td>
                  <td className="px-5 py-4 font-medium text-slate-600">{student.totalPages}쪽</td>
                  <td className="px-5 py-4 text-xs text-slate-400">{student.lastReadDate}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentForAward({
                          name: student.studentName,
                          bookCount: student.totalBooks,
                          awardTitle: `${idx + 1}위 독서 우수상`,
                        });
                        triggerCertificateConfetti();
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                    >
                      상장 보기 📜
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hall of Fame (역대 명예의 전당) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>역대 명예의 전당 (과거 독서왕 기록)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {hallOfFameList.map((hof) => (
            <div key={hof.monthKey} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">
                {hof.monthName}
              </span>
              <h4 className="font-extrabold text-slate-900 text-base">{hof.kingName} 학생</h4>
              <p className="text-xs text-slate-600 font-medium">{hof.awardTitle}</p>
              <p className="text-xs text-emerald-600 font-bold">기록: 총 {hof.bookCount}권 완독</p>
            </div>
          ))}
        </div>
      </div>

      {/* Award Certificate Modal */}
      {selectedStudentForAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border-4 border-amber-300 relative space-y-6">
            
            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b-2 border-amber-200 pb-6">
              <Crown className="w-14 h-14 text-amber-500 mx-auto" />
              <h2 className="text-3xl font-black text-slate-900 tracking-wider">상 장 (賞 狀)</h2>
              <p className="text-sm font-bold text-amber-700">{selectedStudentForAward.awardTitle}</p>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-5 py-2">
              <div className="text-lg font-bold text-slate-800">
                <span>{teacherSettings.grade}학년 {teacherSettings.classNum}반</span>
                <span className="ml-3 text-2xl font-black text-indigo-900">{selectedStudentForAward.name}</span>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed px-4">
                위 학생은 바쁜 학급 생활 중에도 꾸준하고 성실하게 책을 읽고 (이번 달 총{' '}
                <strong className="text-indigo-600 underline">{selectedStudentForAward.bookCount}권</strong> 완독)
                깊은 생각과 풍부한 느낀 점을 기록장에 훌륭하게 남겼으므로 이 상장을 주어 칭찬합니다.
              </p>

              <div className="pt-4 text-xs font-semibold text-slate-400">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <div className="text-lg font-extrabold text-slate-900 pt-2">
                {teacherSettings.grade}학년 {teacherSettings.classNum}반 담임교사 {teacherSettings.teacherName} (인)
              </div>
            </div>

            {/* Certificate Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 print:hidden">
              <button
                onClick={() => setSelectedStudentForAward(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200"
              >
                닫기
              </button>

              <button
                onClick={handlePrintCertificate}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30"
              >
                <Printer className="w-4 h-4" />
                <span>상장 인쇄하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
