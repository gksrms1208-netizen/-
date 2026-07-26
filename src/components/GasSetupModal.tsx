import React, { useState } from 'react';
import { FileSpreadsheet, Copy, Check, ExternalLink, Play, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { TeacherSettings } from '../types';
import { GAS_CODE_GS, testGasConnection } from '../utils/gasScript';
import { saveTeacherSettings } from '../utils/storage';

interface GasSetupModalProps {
  teacherSettings: TeacherSettings;
  onSettingsUpdate: (newSettings: TeacherSettings) => void;
  onClose?: () => void;
}

export const GasSetupModal: React.FC<GasSetupModalProps> = ({ teacherSettings, onSettingsUpdate, onClose }) => {
  const [urlInput, setUrlInput] = useState(teacherSettings.gasWebAppUrl || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'url' | 'code' | 'guide'>('url');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeacherSettings = {
      ...teacherSettings,
      gasWebAppUrl: urlInput.trim(),
    };
    saveTeacherSettings(updated);
    onSettingsUpdate(updated);
    setTestResult({
      success: true,
      message: '구글 앱스 스크립트 연동 URL이 성공적으로 저장되었습니다! 🎉',
    });
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: '먼저 구글 앱스 스크립트 웹앱 URL을 입력해 주세요.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testGasConnection(urlInput.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            구글 스프레드시트 실시간 연동 설정 (GAS)
          </h2>
        </div>
        <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
          학생들이 독서기록을 제출하면 교사의 구글 스프레드시트에 자동으로 추가됩니다. 구글 앱스 스크립트(Google Apps Script)
          웹 앱을 배포한 후 아래에 URL만 붙여넣으면 연동 완료!
        </p>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setActiveSubTab('url')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'url'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            1. 연동 URL 입력 및 테스트
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'code'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            2. Code.gs 코드 복사하기
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'guide'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            3. 쉬운 설치 방법 가이드 (그림)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: URL Input & Connection Test */}
      {activeSubTab === 'url' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>구글 앱스 스크립트(GAS) 웹 앱 URL 등록</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Google Apps Script에서 웹 앱으로 배포한 후 생성된 URL(https://script.google.com/macros/s/.../exec)을 입력하세요.
            </p>
          </div>

          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                웹 앱 URL (Web App Endpoint URL) <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isTesting ? '테스트 중...' : '연동 테스트 하기'}</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
              >
                연동 URL 저장하기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 2: Code.gs Copy Box */}
      {activeSubTab === 'code' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">Code.gs 전체 소스 코드</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                아래 코드를 원클릭으로 복사하여 구글 앱스 스크립트 편집기에 그대로 붙여넣으세요.
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow ${
                copiedCode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? '복사 완료! 🎉' : '📋 전체 코드 복사하기'}</span>
            </button>
          </div>

          <div className="relative bg-slate-900 rounded-2xl p-4 overflow-x-auto max-h-[450px] font-mono text-xs text-slate-200 leading-relaxed border border-slate-800">
            <pre>{GAS_CODE_GS}</pre>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Step-by-Step Guide */}
      {activeSubTab === 'guide' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-xl font-black text-slate-900">📌 5분 만에 끝내는 구글 시트 연동 6단계</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">구글 시트 생성</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                구글 드라이브(<a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">sheets.google.com</a>)에서 새로운 스프레드시트를 만듭니다.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Apps Script 메뉴 열기</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                스프레드시트 상단 메뉴에서 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Code.gs 코드 붙여넣기</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                기존 코드를 지우고, 위 [2. Code.gs 코드 복사하기]에서 복사한 전체 코드를 붙여넣고 저장(Ctrl+S)합니다.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center text-xs">
                4
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">웹 앱으로 새 배포</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                우측 상단 <strong>[배포] → [새 배포]</strong>를 누르고 톱니바퀴 아이콘을 클릭하여 <strong>[웹 앱]</strong>을 선택합니다.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 bg-amber-500 text-slate-950 font-bold rounded-lg flex items-center justify-center text-xs">
                5
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">액세스 권한 설정 (중요!)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                액세스 권한 있는 사용자를 <strong className="text-amber-700 bg-amber-100 px-1 py-0.5 rounded">&quot;모든 사용자 (Anyone)&quot;</strong>로 설정 후 배포합니다! (학생들의 무인증 제출용)
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="w-7 h-7 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center text-xs">
                6
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">웹 앱 URL 복사 및 입력</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                생성된 웹 앱 URL을 복사하여 위 <strong>[1. 연동 URL 입력 및 테스트]</strong> 란에 붙여넣고 저장하면 완료됩니다!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
