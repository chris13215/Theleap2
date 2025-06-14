import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { BookView } from './components/BookView';
import { DocumentEditor } from './components/DocumentEditor';

type View = 'dashboard' | 'book' | 'document';

interface ViewState {
  view: View;
  bookId?: string;
  documentId?: string;
}

function App() {
  const { user, loading } = useAuth();
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });

  const handleSelectBook = (bookId: string) => {
    setViewState({ view: 'book', bookId });
  };

  const handleSelectDocument = (documentId: string, bookId?: string) => {
    setViewState({ 
      view: 'document', 
      documentId, 
      bookId: bookId || viewState.bookId 
    });
  };

  const handleBackToDashboard = () => {
    setViewState({ view: 'dashboard' });
  };

  const handleBackToBook = () => {
    if (viewState.bookId) {
      setViewState({ view: 'book', bookId: viewState.bookId });
    } else {
      handleBackToDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading The Leap...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  switch (viewState.view) {
    case 'book':
      return (
        <BookView
          bookId={viewState.bookId!}
          onBack={handleBackToDashboard}
          onSelectDocument={handleSelectDocument}
        />
      );
    case 'document':
      return (
        <DocumentEditor
          documentId={viewState.documentId!}
          bookId={viewState.bookId!}
          onBack={handleBackToBook}
        />
      );
    default:
      return (
        <Dashboard
          onSelectBook={handleSelectBook}
          onSelectDocument={handleSelectDocument}
        />
      );
  }
}

export default App;