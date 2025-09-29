import { useState, useEffect } from 'react';
import { LocalThought } from '@/types/thoughts';
import { thoughtService } from '@/services/thoughtService';

export const useThoughts = () => {
  const [thoughts, setThoughts] = useState<LocalThought[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshThoughts = () => {
    setIsLoading(true);
    try {
      const allThoughts = thoughtService.getAllThoughts();
      setThoughts(allThoughts);
    } catch (error) {
      console.error('Error refreshing thoughts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshThoughts();
  }, []);

  const createThought = async (
    content: string,
    relatedEntities: string[],
    gameDate?: string
  ) => {
    try {
      const thought = thoughtService.createThought(content, relatedEntities, gameDate);
      refreshThoughts();
      return thought;
    } catch (error) {
      console.error('Error creating thought:', error);
      throw error;
    }
  };

  return {
    thoughts,
    isLoading,
    createThought,
    refreshThoughts
  };
};