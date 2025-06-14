import React, { useState } from 'react';
import { Search, Plus, BookOpen, FileText, Star, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBooks } from '../hooks/useBooks';
import { useDocuments } from '../hooks/useDocuments';
import { BookCard } from './BookCard';
import { BookModal } from './BookModal';
import { SearchResults } from './SearchResults';

interface DashboardProps {
  onSelectBook: (bookId: string) => void;
  onSelectDocument: (documentId: string, bookId: string) => void;
}

export function Dashboard({ onSelectBook, onSelectDocument }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { books, createBook } = useBooks(user?.id);
  const { documents } = useDocuments(user?.id);
  const [showBookModal, setShowBookModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const recentDocuments = documents
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const favoriteDocuments = documents.filter(doc => doc.is_favorite);

  const handleCreateBook = async (bookData: { title: string; description: string; color_theme: string }) => {
    await createBook(bookData);
    setShowBookModal(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearch(query.trim().length > 0);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (showSearch && searchQuery.trim()) {
    return (
      <SearchResults
        query={searchQuery}
        documents={documents}
        books={books}
        onSelectDocument={onSelectDocument}
        onSelectBook={onSelectBook}
        onBack={() => setShowSearch(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-2 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">The Leap</h1>
              <p className="text-purple-200">Document Management</p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search documents and books..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Books</p>
                <p className="text-2xl font-bold text-white">{books.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Favorites</p>
                <p className="text-2xl font-bold text-white">{favoriteDocuments.length}</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Books Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Your Books</span>
            </h2>
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Book</span>
            </button>
          </div>
          
          {books.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No books yet</h3>
              <p className="text-purple-200 mb-4">Create your first book to start organizing your documents</p>
              <button
                onClick={() => setShowBookModal(true)}
                className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-6 py-3 rounded-lg transition-all"
              >
                Create Your First Book
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  documentCount={documents.filter(doc => doc.book_id === book.id).length}
                  onClick={() => onSelectBook(book.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5" />
              <span>Recent Documents</span>
            </h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              {recentDocuments.map((document, index) => (
                <div
                  key={document.id}
                  className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${
                    index !== recentDocuments.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                  onClick={() => onSelectDocument(document.id, document.book_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white truncate">{document.title}</h3>
                      <p className="text-sm text-purple-200 mt-1">
                        {document.word_count} words • {new Date(document.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {document.is_favorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <BookModal
          onClose={() => setShowBookModal(false)}
          onSave={handleCreateBook}
        />
      )}
    </div>
  );
}