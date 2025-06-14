import React from 'react';
import { ArrowLeft, Search, FileText, BookOpen, Star } from 'lucide-react';
import type { Database } from '../lib/supabase';

type Document = Database['public']['Tables']['documents']['Row'];
type Book = Database['public']['Tables']['books']['Row'];

interface SearchResultsProps {
  query: string;
  documents: Document[];
  books: Book[];
  onSelectDocument: (documentId: string, bookId: string) => void;
  onSelectBook: (bookId: string) => void;
  onBack: () => void;
}

export function SearchResults({ 
  query, 
  documents, 
  books, 
  onSelectDocument, 
  onSelectBook, 
  onBack 
}: SearchResultsProps) {
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(query.toLowerCase()) ||
    doc.content.toLowerCase().includes(query.toLowerCase())
  );

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-purple-500/30 text-purple-200 rounded px-1">$1</mark>');
  };

  const getSnippet = (content: string, query: string, maxLength = 150) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const queryIndex = plainText.toLowerCase().indexOf(query.toLowerCase());
    
    if (queryIndex === -1) {
      return plainText.slice(0, maxLength) + (plainText.length > maxLength ? '...' : '');
    }
    
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(plainText.length, start + maxLength);
    const snippet = plainText.slice(start, end);
    
    return (start > 0 ? '...' : '') + snippet + (end < plainText.length ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
              <Search className="w-8 h-8" />
              <span>Search Results</span>
            </h1>
            <p className="text-purple-200 mt-1">
              Found {filteredBooks.length + filteredDocuments.length} results for &quot;{query}&quot;
            </p>
          </div>
        </div>

        {/* Books Results */}
        {filteredBooks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Books ({filteredBooks.length})</span>
            </h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className={`group p-4 hover:bg-white/5 cursor-pointer transition-all ${
                    index !== filteredBooks.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                  onClick={() => onSelectBook(book.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 
                        className="font-medium text-white group-hover:text-purple-200 transition-colors"
                        dangerouslySetInnerHTML={{ __html: highlightText(book.title, query) }}
                      />
                      {book.description && (
                        <p 
                          className="text-sm text-purple-200 mt-1"
                          dangerouslySetInnerHTML={{ __html: highlightText(book.description, query) }}
                        />
                      )}
                      <p className="text-xs text-purple-300 mt-1">
                        {documents.filter(doc => doc.book_id === book.id).length} documents
                      </p>
                    </div>
                    <BookOpen className="w-5 h-5 text-purple-400 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Results */}
        {filteredDocuments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Documents ({filteredDocuments.length})</span>
            </h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              {filteredDocuments.map((document, index) => {
                const book = books.find(b => b.id === document.book_id);
                return (
                  <div
                    key={document.id}
                    className={`group p-4 hover:bg-white/5 cursor-pointer transition-all ${
                      index !== filteredDocuments.length - 1 ? 'border-b border-white/10' : ''
                    }`}
                    onClick={() => onSelectDocument(document.id, document.book_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 
                            className="font-medium text-white group-hover:text-purple-200 transition-colors"
                            dangerouslySetInnerHTML={{ __html: highlightText(document.title, query) }}
                          />
                          {document.is_favorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                        </div>
                        <p className="text-xs text-purple-300 mb-2">
                          In {book?.title} • {document.word_count} words • {new Date(document.updated_at).toLocaleDateString()}
                        </p>
                        <p 
                          className="text-sm text-purple-200"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(
                              getSnippet(document.content, query), 
                              query
                            ) 
                          }}
                        />
                      </div>
                      <FileText className="w-5 h-5 text-purple-400 ml-4 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredBooks.length === 0 && filteredDocuments.length === 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
            <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-purple-200 mb-4">
              Try adjusting your search terms or check your spelling
            </p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-6 py-3 rounded-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}