import React, { useState, useRef } from 'react';
import { BookstoreHero } from './BookstoreHero';
import { StudentForm } from './StudentForm';
import { BookLog, TeacherSettings } from '../types';

interface LandingViewProps {
  logs: BookLog[];
  teacherSettings: TeacherSettings;
  onSuccess: (newLog: BookLog) => void;
  onOpenGasGuide: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  logs,
  teacherSettings,
  onSuccess,
  onOpenGasGuide,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedBookForLog, setSelectedBookForLog] = useState<{
    title: string;
    author: string;
  } | null>(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectBookForLog = (book: { title: string; author: string }) => {
    setSelectedBookForLog(book);
    scrollToForm();
  };

  return (
    <div className="space-y-12">
      {/* Bookstore Hero & Dynamic Quotes Showcase */}
      <BookstoreHero
        logs={logs}
        onSelectBookForLog={handleSelectBookForLog}
        onScrollToForm={scrollToForm}
      />

      {/* Main Student Form Anchor */}
      <div ref={formRef} id="reading-log-form" className="scroll-mt-20">
        <StudentForm
          teacherSettings={teacherSettings}
          onSuccess={onSuccess}
          onOpenGasGuide={onOpenGasGuide}
          prefillBook={selectedBookForLog}
        />
      </div>
    </div>
  );
};
