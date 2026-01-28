'use client';

import { useState, useEffect, useCallback } from 'react';
import { AcademicYear } from '@/lib/types';

export function useAcademicYears() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademicYears = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/academic-years');
      if (!response.ok) throw new Error('Failed to fetch academic years');
      const data = await response.json();
      setAcademicYears(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching academic years:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveYear = useCallback(async () => {
    try {
      const response = await fetch('/api/academic-years/active');
      if (response.ok) {
        const data = await response.json();
        setActiveYear(data);
      } else {
        setActiveYear(null);
      }
    } catch (err) {
      console.error('Error fetching active academic year:', err);
      setActiveYear(null);
    }
  }, []);

  useEffect(() => {
    fetchAcademicYears();
    fetchActiveYear();
  }, [fetchAcademicYears, fetchActiveYear]);

  const addAcademicYear = async (year: Omit<AcademicYear, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...year,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add academic year');
      }
      await fetchAcademicYears();
      await fetchActiveYear();
    } catch (err) {
      throw err;
    }
  };

  const updateAcademicYear = async (id: number, updates: Partial<AcademicYear>) => {
    try {
      const response = await fetch(`/api/academic-years?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update academic year');
      }
      await fetchAcademicYears();
      await fetchActiveYear();
    } catch (err) {
      throw err;
    }
  };

  const deleteAcademicYear = async (id: number) => {
    try {
      const response = await fetch(`/api/academic-years?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete academic year');
      }
      await fetchAcademicYears();
      await fetchActiveYear();
    } catch (err) {
      throw err;
    }
  };

  const setActiveAcademicYear = async (id: number) => {
    await updateAcademicYear(id, { isActive: true });
  };

  return {
    academicYears,
    activeYear,
    isLoading,
    error,
    refetch: fetchAcademicYears,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    setActiveAcademicYear,
  };
}
