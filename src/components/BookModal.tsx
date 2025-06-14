import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';

interface BookModalProps {
  onClose: () => void;
  onSave: (book: { title: string; description: string; color_theme: string }) => void;
  initialData?: { title: string; description: string; color_theme: string };
}

const colorOptions = [
  { name: 'Purple', value: 'purple', class: 'from-purple-600 to-violet-700' },
  { name: 'Blue', value: 'blue', class: 'from-blue-600 to-indigo-700' },
  { name: 'Green', value: 'green', class: 'from-green-600 to-emerald-700' },
  { name: 'Orange', value: 'orange', class: 'from-orange-600 to-red-700' },
  { name: 'Pink', value: 'pink', class: 'from-pink-600 to-rose-700' },
  { name: 'Teal', value: 'teal', class: 'from-teal-600 to-cyan-700' },
];

export function BookModal({ onClose, onSave, initialData }: BookModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [colorTheme, setColorTheme] = useState(initialData?.color_theme || 'purple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title: title.trim(), description: description.trim(), color_theme: colorTheme });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>{initialData ? 'Edit Book' : 'Create New Book'}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              Book Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter book title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Brief description of your book"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColorTheme(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorTheme === option.value
                      ? 'border-white scale-105'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className={`w-full h-8 bg-gradient-to-r ${option.class} rounded-md mb-2`}></div>
                  <span className="text-xs text-white">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white rounded-lg transition-all"
            >
              {initialData ? 'Update' : 'Create'} Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}