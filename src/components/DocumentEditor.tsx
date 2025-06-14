import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Star, MoreVertical, Trash2, Edit3, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { useBooks } from '../hooks/useBooks';

interface DocumentEditorProps {
  documentId: string;
  bookId: string;
  onBack: () => void;
}

export function DocumentEditor({ documentId, bookId, onBack }: DocumentEditorProps) {
  const { user } = useAuth();
  const { documents, updateDocument, deleteDocument, toggleFavorite } = useDocuments(user?.id);
  const { books } = useBooks(user?.id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeout = useRef<NodeJS.Timeout>();

  const document = documents.find(d => d.id === documentId);
  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);

  const saveDocument = async () => {
    if (!document) return;
    
    setSaving(true);
    try {
      await updateDocument(documentId, { title, content });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    
    // Set new auto-save timeout
    autoSaveTimeout.current = setTimeout(() => {
      if (document && (newContent !== document.content || title !== document.title)) {
        saveDocument();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    
    // Clear existing timeout
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    
    // Set new auto-save timeout
    autoSaveTimeout.current = setTimeout(() => {
      if (document && (content !== document.content || newTitle !== document.title)) {
        saveDocument();
      }
    }, 3000);
  };

  const handleToggleFavorite = async () => {
    if (document) {
      await toggleFavorite(documentId, document.is_favorite);
    }
  };

  const handleDeleteDocument = async () => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(documentId);
      onBack();
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertList = (ordered: boolean) => {
    formatText(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, []);

  if (!document || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Document not found</p>
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

  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <div className="flex items-center space-x-2 text-sm text-purple-200 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{book.title}</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl font-semibold text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 -ml-2"
                  placeholder="Untitled Document"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-purple-200">
                {wordCount} words
                {lastSaved && (
                  <span className="ml-2">
                    • Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <button
                onClick={saveDocument}
                disabled={saving}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  document.is_favorite
                    ? 'text-yellow-400 hover:bg-yellow-400/20'
                    : 'text-purple-400 hover:bg-white/10'
                }`}
              >
                <Star className={`w-5 h-5 ${document.is_favorite ? 'fill-current' : ''}`} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleDeleteDocument();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors italic"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors underline"
              title="Underline"
            >
              U
            </button>
            
            <div className="w-px bg-white/20 h-6 mx-2"></div>
            
            <button
              onClick={() => formatText('formatBlock', 'h1')}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors text-lg font-bold"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => formatText('formatBlock', 'h2')}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors font-bold"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => formatText('formatBlock', 'p')}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors"
              title="Paragraph"
            >
              P
            </button>
            
            <div className="w-px bg-white/20 h-6 mx-2"></div>
            
            <button
              onClick={() => insertList(false)}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors"
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={() => insertList(true)}
              className="p-2 hover:bg-white/10 rounded text-white transition-colors"
              title="Numbered List"
            >
              1.
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="p-6">
          <div
            contentEditable
            onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
            className="min-h-[calc(100vh-200px)] bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-white text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: content }}
            suppressContentEditableWarning={true}
          />
        </div>
      </div>
    </div>
  );
}