export interface BookQuote {
  id: string;
  quote: string;
  author: string;
  bookTitle?: string;
  category: '지혜' | '꿈과모험' | '위로와성장' | '마음의양식' | '습관';
  bgTheme: string;
}

export const BOOK_QUOTES: BookQuote[] = [
  {
    id: 'q1',
    quote: '사람은 책을 만들고, 책은 사람을 만든다.',
    author: '신용호 (교보문고 창립자)',
    category: '마음의양식',
    bgTheme: 'from-amber-900 via-stone-900 to-indigo-950',
  },
  {
    id: 'q2',
    quote: '하루라도 책을 읽지 않으면 입안에 가시가 돋친다.',
    author: '안중근 의사',
    category: '습관',
    bgTheme: 'from-slate-900 via-indigo-950 to-blue-950',
  },
  {
    id: 'q3',
    quote: '독서는 완성된 사람을 만들고, 담론은 재치 있는 사람을 만들며, 필기는 정확한 사람을 만든다.',
    author: '프랜시스 베이컨',
    category: '지혜',
    bgTheme: 'from-emerald-950 via-teal-900 to-slate-900',
  },
  {
    id: 'q4',
    quote: '오늘의 나를 있게 한 것은 우리 동네 도서관이었다. 하버드 졸업장보다 소중한 것이 독서하는 습관이다.',
    author: '빌 게이츠',
    category: '꿈과모험',
    bgTheme: 'from-indigo-950 via-purple-950 to-slate-900',
  },
  {
    id: 'q5',
    quote: '책은 들고 다니는 유일한 마법이다.',
    author: '스티븐 킹',
    category: '꿈과모험',
    bgTheme: 'from-purple-950 via-slate-900 to-amber-950',
  },
  {
    id: 'q6',
    quote: '남의 책을 읽는 데 시간을 보내라. 남이 고생하여 얻은 지식을 너무나 쉽게 내 것으로 만들 수 있다.',
    author: '소크라테스',
    category: '지혜',
    bgTheme: 'from-cyan-950 via-slate-900 to-indigo-950',
  },
  {
    id: 'q7',
    quote: '한 권의 좋은 책은 유능한 스승보다 낫다.',
    author: '샤를 드 몽테스키외',
    category: '위로와성장',
    bgTheme: 'from-amber-950 via-red-950 to-slate-950',
  },
  {
    id: 'q8',
    quote: '내가 세계를 알게 된 것은 오직 책 덕분이었다.',
    author: '막심 고리키',
    category: '마음의양식',
    bgTheme: 'from-blue-950 via-slate-900 to-emerald-950',
  },
  {
    id: 'q9',
    quote: '글을 모르는 사람은 읽을 수 없는 사람보다 나을 것이 없다.',
    author: '마크 트웨인',
    category: '지혜',
    bgTheme: 'from-slate-900 via-zinc-900 to-amber-950',
  },
  {
    id: 'q10',
    quote: '책을 읽는다는 것은 또 다른 세상으로의 지혜로운 여행이다.',
    author: '세종대왕',
    category: '위로와성장',
    bgTheme: 'from-rose-950 via-slate-900 to-amber-950',
  },
];

export interface RecommendedBook {
  title: string;
  author: string;
  coverColor: string;
  tag: string;
  summary: string;
}

export const RECOMMENDED_BOOKS: RecommendedBook[] = [
  {
    title: '어린 왕자',
    author: '앙투안 드 생텍쥐페리',
    coverColor: 'from-indigo-600 via-purple-600 to-pink-600',
    tag: '우정과 진심',
    summary: '마음으로 보아야 진정한 가치를 발견할 수 있는 명작 파동 스토리',
  },
  {
    title: '마당을 나온 암탉',
    author: '황선미',
    coverColor: 'from-emerald-600 via-teal-600 to-cyan-700',
    tag: '꿈과 용기',
    summary: '자유를 찾아 나선 암탉 잎싹이의 감동적이고 숭고한 모험담',
  },
  {
    title: '코스모스',
    author: '칼 세이건',
    coverColor: 'from-blue-700 via-indigo-900 to-slate-900',
    tag: '우주 과학 탐구',
    summary: '신비롭고 광활한 우주와 생명의 역사를 탐험하는 과학 교양서',
  },
  {
    title: '불편한 편의점',
    author: '김호연',
    coverColor: 'from-amber-500 via-orange-600 to-red-600',
    tag: '따뜻한 이웃',
    summary: '마음의 위로와 소통의 소중함을 되새겨주는 골목길 이웃들의 이야기',
  },
  {
    title: '해리 포터와 마법사의 돌',
    author: 'J.K. 롤링',
    coverColor: 'from-red-700 via-amber-700 to-yellow-600',
    tag: '판타지 상상력',
    summary: '호그와트 마법학교에서 펼쳐지는 스릴 넘치는 마법과 모험',
  },
];
