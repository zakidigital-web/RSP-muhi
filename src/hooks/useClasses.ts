'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClassInfo } from '@/lib/types';

export function useClasses() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/classes?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching classes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const addClass = async (classData: Omit<ClassInfo, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add class');
      }
      await fetchClasses();
    } catch (err) {
      throw err;
    }
  };

  const updateClass = async (id: number, updates: Partial<ClassInfo>) => {
    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update class');
      }
      await fetchClasses();
    } catch (err) {
      throw err;
    }
  };

  const deleteClass = async (id: number) => {
    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete class');
      }
      await fetchClasses();
    } catch (err) {
      throw err;
    }
  };

  return {
    classes,
    isLoading,
    error,
    refetch: fetchClasses,
    addClass,
    updateClass,
    deleteClass,
  };
}
