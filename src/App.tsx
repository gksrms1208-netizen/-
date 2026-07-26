import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { StudentLogList } from './components/StudentLogList';
import { MonthlyKingEvent } from './components/MonthlyKingEvent';
import { TeacherDashboard } from './components/TeacherDashboard';
import { GasSetupModal } from './components/GasSetupModal';
import { BookLog, TeacherSettings } from './types';
import { getStoredLogs, getStoredTeacherSettings } from './utils/storage';
import { Github, Globe, Heart, FileCode2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'submit' | 'my-logs' | 'event' | 'teacher' | 'gas'>('submit');
  const [logs, setLogs] = useState<BookLog[]>(() => getStoredLogs());
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(() => getStoredTeacherSettings());

  // Listen to storage events to sync across components/tabs
  useEffect(() => {
    const refreshLogs = () => setLogs(getStoredLogs());
    const refreshSettings = () => setTeacherSettings(getStoredTeacherSettings());

    window.addEventListener('storage-logs-updated', refreshLogs);
    window.addEventListener('storage-settings-updated', refreshSettings);

    return () => {
      window.removeEventListener('storage-logs-updated', refreshLogs);
      window.removeEventListener('storage-settings-updated', refreshSettings);
    };
  }, []);

  const unsyncedCount = logs.filter((l) => !l.syncedToGas).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        teacherSettings={teacherSettings}
        unsyncedCount={unsyncedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'submit' && (
          <LandingView
            logs={logs}
            teacherSettings={teacherSettings}
            onSuccess={() => {
              setLogs(getStoredLogs());
            }}
            onOpenGasGuide={() => setActiveTab('gas')}
          />
        )}

        {activeTab === 'my-logs' && (
          <StudentLogList logs={logs} />
        )}

        {activeTab === 'event' && (
          <MonthlyKingEvent logs={logs} teacherSettings={teacherSettings} />
        )}

        {activeTab === 'teacher' && (
          <TeacherDashboard
            logs={logs}
            teacherSettings={teacherSettings}
            onSettingsUpdate={(newSettings) => setTeacherSettings(newSettings)}
            onOpenGasGuide={() => setActiveTab('gas')}
          />
        )}

        {activeTab === 'gas' && (
          <GasSetupModal
            teacherSettings={teacherSettings}
            onSettingsUpdate={(newSettings) => setTeacherSettings(newSettings)}
            onClose={() => setActiveTab('submit')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-200 text-sm">
              우리반 전자 독서기록장
            </p>
            <p className="text-slate-400">
              구글 앱스 스크립트(GAS) 및 Netlify/GitHub 호스팅에 최적화된 초·중·고 학급 독서 관리 시스템
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Netlify 정적 배포 호환</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Apps Script 자동 연동</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
