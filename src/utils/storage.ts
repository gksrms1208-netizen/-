import { BookLog, TeacherSettings, MonthlyHallOfFame, StudentStats } from '../types';
import { INITIAL_BOOK_LOGS, INITIAL_TEACHER_SETTINGS, INITIAL_HALL_OF_FAME } from '../data/sampleData';

const LOGS_KEY = 'classroom_reading_logs_v1';
const SETTINGS_KEY = 'classroom_teacher_settings_v1';
const HALL_OF_FAME_KEY = 'classroom_hall_of_fame_v1';

export function getStoredLogs(): BookLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_BOOK_LOGS));
      return INITIAL_BOOK_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading logs from localStorage:', err);
    return INITIAL_BOOK_LOGS;
  }
}

export function saveLogs(logs: BookLog[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    window.dispatchEvent(new Event('storage-logs-updated'));
  } catch (err) {
    console.error('Error saving logs:', err);
  }
}

export function addBookLog(newLog: Omit<BookLog, 'id' | 'createdAt' | 'monthKey'>): BookLog {
  const currentLogs = getStoredLogs();
  const now = new Date();
  const createdIso = now.toISOString();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const log: BookLog = {
    ...newLog,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: createdIso,
    monthKey: logMonthKey(newLog.readDate || createdIso),
  };

  const updated = [log, ...currentLogs];
  saveLogs(updated);
  return log;
}

export function updateBookLog(updatedLog: BookLog): void {
  const currentLogs = getStoredLogs();
  const index = currentLogs.findIndex((l) => l.id === updatedLog.id);
  if (index !== -1) {
    currentLogs[index] = updatedLog;
    saveLogs([...currentLogs]);
  }
}

export function deleteBookLog(id: string): void {
  const currentLogs = getStoredLogs();
  const filtered = currentLogs.filter((l) => l.id !== id);
  saveLogs(filtered);
}

function logMonthKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}

export function getStoredTeacherSettings(): TeacherSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_TEACHER_SETTINGS));
      return INITIAL_TEACHER_SETTINGS;
    }
    return { ...INITIAL_TEACHER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_TEACHER_SETTINGS;
  }
}

export function saveTeacherSettings(settings: TeacherSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('storage-settings-updated'));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function getStoredHallOfFame(): MonthlyHallOfFame[] {
  try {
    const raw = localStorage.getItem(HALL_OF_FAME_KEY);
    if (!raw) {
      localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(INITIAL_HALL_OF_FAME));
      return INITIAL_HALL_OF_FAME;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HALL_OF_FAME;
  }
}

export function saveHallOfFame(list: MonthlyHallOfFame[]): void {
  try {
    localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage-hof-updated'));
  } catch (err) {
    console.error('Error saving Hall of Fame:', err);
  }
}

/**
 * Calculate Student Statistics from Logs
 */
export function calculateStudentStats(logs: BookLog[]): StudentStats[] {
  const map: Record<string, StudentStats> = {};

  logs.forEach((log) => {
    const key = `${log.grade}-${log.classNum}-${log.studentName}`;
    if (!map[key]) {
      map[key] = {
        studentName: log.studentName,
        grade: log.grade,
        classNum: log.classNum,
        totalBooks: 0,
        totalPages: 0,
        lastReadDate: log.readDate,
        favoriteCategory: log.category || '기타',
        badges: [],
      };
    }

    const s = map[key];
    s.totalBooks += 1;
    s.totalPages += log.pageCount || 0;
    if (new Date(log.readDate) > new Date(s.lastReadDate)) {
      s.lastReadDate = log.readDate;
    }
    if (log.badges) {
      log.badges.forEach((b) => {
        if (!s.badges.includes(b)) s.badges.push(b);
      });
    }
  });

  return Object.values(map).sort((a, b) => b.totalBooks - a.totalBooks);
}

/**
 * Export Logs to CSV for Google Sheets or Excel
 */
export function exportToCSV(logs: BookLog[], fileName = '우리반_독서기록장.csv'): void {
  const headers = [
    'ID',
    '학년',
    '반',
    '학생이름',
    '도서명',
    '지은이',
    '출판사',
    '읽은날짜',
    '장르',
    '페이지수',
    '별점',
    '줄거리',
    '소감',
    '교사피드백',
    '시트동기화여부',
    '작성일시',
  ];

  const rows = logs.map((l) => [
    l.id,
    l.grade,
    l.classNum,
    `"${l.studentName}"`,
    `"${l.bookTitle.replace(/"/g, '""')}"`,
    `"${l.author.replace(/"/g, '""')}"`,
    `"${(l.publisher || '').replace(/"/g, '""')}"`,
    l.readDate,
    `"${l.category}"`,
    l.pageCount || 0,
    l.rating,
    `"${l.summary.replace(/"/g, '""')}"`,
    `"${l.impression.replace(/"/g, '""')}"`,
    `"${(l.teacherComment || '').replace(/"/g, '""')}"`,
    l.syncedToGas ? '완료' : '대기',
    l.createdAt,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
