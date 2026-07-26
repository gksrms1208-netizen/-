export interface BookLog {
  id: string;
  grade: number; // 학년 (1~6)
  classNum: number; // 반 (1~20)
  studentName: string; // 학생 이름
  bookTitle: string; // 도서명
  author: string; // 지은이
  publisher: string; // 출판사
  readDate: string; // 읽은 날짜 (YYYY-MM-DD)
  pageCount?: number; // 페이지 수
  category: string; // 장르/분류 (문학, 과학, 역사, 예술 등)
  rating: number; // 별점 (1~5)
  summary: string; // 줄거리
  impression: string; // 간단한 소감
  teacherComment?: string; // 교사 피드백/도장
  teacherStamp?: 'EXCELLENT' | 'GOOD' | 'CHECKED'; // 교사 확인 도장
  syncedToGas?: boolean; // 구글 시트 전송 여부
  createdAt: string; // 작성 일시 (ISO)
  monthKey: string; // 작성 월 (YYYY-MM)
  badges?: string[]; // 획득 배지
}

export interface TeacherSettings {
  pin: string; // 교사 암호
  grade: number; // 학급 학년
  classNum: number; // 학급 반
  teacherName: string; // 교사 이름
  gasWebAppUrl: string; // 구글 앱스 스크립트 배포 웹앱 URL
  monthlyTargetCount: number; // 학급 이달의 목표 권수
  noticeText: string; // 학급 독서 공지사항
}

export interface StudentStats {
  studentName: string;
  grade: number;
  classNum: number;
  totalBooks: number;
  totalPages: number;
  lastReadDate: string;
  favoriteCategory: string;
  badges: string[];
}

export interface MonthlyHallOfFame {
  monthKey: string; // 예: "2026-07"
  monthName: string; // 예: "2026년 7월"
  kingName: string;
  bookCount: number;
  awardTitle: string;
}
