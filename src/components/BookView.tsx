import React, { useState } from 'react';
import { ArrowLeft, Plus, FileText, Star, Search, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { useBooks } from '../hooks/useBooks';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import { DocumentModal } from './DocumentModal';
import { BookModal } from './BookModal';

interface BookViewProps {
  bookId: string;
  onBack: () => void;
  onSelectDocument: (documentId: string) => void;
}

export function BookView({ bookId, onBack, onSelectDocument }: BookViewProps) {
  const { user } = useAuth();
  const { books, updateBook, deleteBook } = useBooks(user?.id);
  const { documents, createDocument, deleteDocument, toggleFavorite } = useDocuments(user?.id, bookId);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookMenu, setShowBookMenu] = useState(false);

  const book = books.find(b => b.id === bookId);
  
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDocument = async (documentData: { title: string; content: string }) => {
    await createDocument({ ...documentData, book_id: bookId });
    setShowDocumentModal(false);
  };

  const handleUpdateBook = async (bookData: { title: string; description: string; color_theme: string }) => {
    await updateBook(bookId, bookData);
    setShowBookModal(false);
  };

  const handleDeleteBook = async () => {
    if (confirm('Are you sure you want to delete this book? All documents in it will be deleted too.')) {
      await deleteBook(bookId);
      onBack();
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(documentId);
    }
  };

  const handleToggleFavorite = async (documentId: string, isFavorite: boolean) => {
    await toggleFavorite(documentId, !isFavorite);
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Book not found</p>
          <button
            onClick={onBack}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{book.title}</h1>
              {book.description && (
                <p className="text-purple-200 mt-1">{book.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDocumentModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowBookMenu(!showBookMenu)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
              
              {showBookMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowBookModal(true);
                      setShowBookMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Book</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteBook();
                      setShowBookMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Book</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-white">{documents.filter(d => d.is_favorite).length}</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Words</p>
                <p className="text-2xl font-bold text-white">
                  {documents.reduce((sum, doc) => sum + doc.word_count, 0).toLocaleString()}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Documents</h2>
          
          {filteredDocuments.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
              <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-purple-200 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first document to start writing'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Create Your First Document
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              {filteredDocuments.map((document, index) => (
                <div
                  key={document.id}
                  className={`group p-4 hover:bg-white/5 transition-all ${
                    index !== filteredDocuments.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelectDocument(document.id)}
                    >
                      <h3 className="font-medium text-white group-hover:text-purple-200 transition-colors truncate">
                        {document.title}
                      </h3>
                      <p className="text-sm text-purple-200 mt-1">
                        {document.word_count} words • {new Date(document.updated_at).toLocaleDateString()} • {new Date(document.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleFavorite(document.id, document.is_favorite)}
                        className={`p-2 rounded-lg transition-colors ${
                          document.is_favorite
                            ? 'text-yellow-400 hover:bg-yellow-400/20'
                            : 'text-purple-400 hover:bg-white/10'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${document.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && (
        <DocumentModal
          onClose={() => setShowDocumentModal(false)}
          onSave={handleCreateDocument}
        />
      )}

      {/* Book Modal */}
      {showBookModal && (
        <BookModal
          onClose={() => setShowBookModal(false)}
          onSave={handleUpdateBook}
          initialData={{
            title: book.title,
            description: book.description,
            color_theme: book.color_theme,
          }}
        />
      )}
    </div>
  );
}