import React from 'react';
import { BookOpen, FileText, Calendar } from 'lucide-react';
import type { Database } from '../lib/supabase';

type Book = Database['public']['Tables']['books']['Row'];

interface BookCardProps {
  book: Book;
  documentCount: number;
  onClick: () => void;
}

const colorThemes = {
  purple: 'from-purple-600 to-violet-700',
  blue: 'from-blue-600 to-indigo-700',
  green: 'from-green-600 to-emerald-700',
  orange: 'from-orange-600 to-red-700',
  pink: 'from-pink-600 to-rose-700',
  teal: 'from-teal-600 to-cyan-700',
};

export function BookCard({ book, documentCount, onClick }: BookCardProps) {
  const gradientClass = colorThemes[book.color_theme as keyof typeof colorThemes] || colorThemes.purple;

  return (
    <div
      onClick={onClick}
      className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer transform hover:scale-105"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-r ${gradientClass} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-purple-200">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{documentCount}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors">
          {book.title}
        </h3>
        {book.description && (
          <p className="text-purple-200 text-sm line-clamp-2">{book.description}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-purple-300">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(book.updated_at).toLocaleDateString()}</span>
        </div>
        <span className="px-2 py-1 bg-white/10 rounded-full">
          {documentCount} document{documentCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}