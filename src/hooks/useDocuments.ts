import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export function useDocuments(userId: string | undefined, bookId?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!userId) return;
    
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    if (!userId) return;

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, bookId]);

  const createDocument = async (document: Omit<DocumentInsert, 'user_id'>) => {
    if (!userId) return { error: 'No user ID' };

    try {
      const wordCount = countWords(document.content || '');
      const { data, error } = await supabase
        .from('documents')
        .insert({ ...document, user_id: userId, word_count: wordCount })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateDocument = async (id: string, updates: DocumentUpdate) => {
    try {
      const wordCount = updates.content ? countWords(updates.content) : undefined;
      const updateData = wordCount !== undefined 
        ? { ...updates, word_count: wordCount }
        : updates;

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    return updateDocument(id, { is_favorite: isFavorite });
  };

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    toggleFavorite,
    refetch: fetchDocuments,
  };
}

function countWords(text: string): number {
  // Remove HTML tags and count words
  const plainText = text.replace(/<[^>]*>/g, '');
  return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
}