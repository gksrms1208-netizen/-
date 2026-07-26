import React from 'react';
import { BookOpen, Award, ShieldCheck, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { TeacherSettings } from '../types';

interface NavbarProps {
  activeTab: 'submit' | 'my-logs' | 'event' | 'teacher' | 'gas';
  setActiveTab: (tab: 'submit' | 'my-logs' | 'event' | 'teacher' | 'gas') => void;
  teacherSettings: TeacherSettings;
  unsyncedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  teacherSettings,
  unsyncedCount,
}) => {
  const isGasConnected = Boolean(teacherSettings.gasWebAppUrl && teacherSettings.gasWebAppUrl.trim().length > 10);

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Class Info */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('submit')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg text-white tracking-tight">우리반 전자 독서기록장</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {teacherSettings.grade}학년 {teacherSettings.classNum}반
                  </span>
                </div>
                <p className="text-xs text-slate-400">스마트한 독서 습관 & 구글 시트 실시간 연동</p>
              </div>
            </div>

            {/* Quick Status Pill for Mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setActiveTab('gas')}
                className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium border ${
                  isGasConnected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {isGasConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>시트 연동됨</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>시트 미연동</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GAS Status & Teacher Name Pill (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setActiveTab('gas')}
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border ${
                isGasConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/60'
              }`}
              title={isGasConnected ? '구글 앱스 스크립트 연동 완료' : '구글 시트 연동 설정 필요'}
            >
              {isGasConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>구글 시트 연동 ON</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>구글 시트 연결 필요</span>
                </>
              )}
              {unsyncedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-500 text-slate-950 font-bold rounded-full">
                  미전송 {unsyncedCount}건
                </span>
              )}
            </button>

            <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>담임: {teacherSettings.teacherName}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'submit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>독서기록 작성</span>
          </button>

          <button
            onClick={() => setActiveTab('my-logs')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'my-logs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>우리반 독서록</span>
          </button>

          <button
            onClick={() => setActiveTab('event')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'event'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>이달의 독서왕</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'teacher'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>교사 대시보드</span>
          </button>

          <button
            onClick={() => setActiveTab('gas')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'gas'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>구글 시트 연동 설정</span>
            {!isGasConnected && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
