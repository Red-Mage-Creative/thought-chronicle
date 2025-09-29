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
      // Error handling - could add toast here in the future
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
      // Error handling - let component handle the error
      throw error;
    }
  };

  const updateThought = async (
    thoughtId: string,
    content: string,
    relatedEntities: string[],
    gameDate?: string
  ) => {
    try {
      const thought = thoughtService.updateThought(thoughtId, content, relatedEntities, gameDate);
      refreshThoughts();
      return thought;
    } catch (error) {
      throw error;
    }
  };

  const deleteThought = async (thoughtId: string) => {
    try {
      thoughtService.deleteThought(thoughtId);
      refreshThoughts();
    } catch (error) {
      throw error;
    }
  };

  return {
    thoughts,
    isLoading,
    createThought,
    updateThought,
    deleteThought,
    refreshThoughts
  };
};