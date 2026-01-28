'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AcademicYear } from '@/lib/types';
import { toast } from 'sonner';

interface AcademicYearContextType {
  academicYears: AcademicYear[];
  activeYear: AcademicYear | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setActiveAcademicYear: (id: number) => Promise<void>;
  addAcademicYear: (year: Omit<AcademicYear, 'id' | 'createdAt'>) => Promise<void>;
  updateAcademicYear: (id: number, updates: Partial<AcademicYear>) => Promise<void>;
  deleteAcademicYear: (id: number) => Promise<void>;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [listRes, activeRes] = await Promise.all([
        fetch('/api/academic-years'),
        fetch('/api/academic-years/active')
      ]);

      if (!listRes.ok) throw new Error('Failed to fetch academic years');
      
      const listData = await listRes.json();
      setAcademicYears(listData);

      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveYear(activeData);
      } else {
        setActiveYear(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching academic years:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAcademicYear = async (year: Omit<AcademicYear, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(year),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add academic year');
      }
      await fetchData();
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
      await fetchData();
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
      await fetchData();
    } catch (err) {
      throw err;
    }
  };

  const setActiveYearAction = async (id: number) => {
    try {
      await updateAcademicYear(id, { isActive: true });
    } catch (err) {
      throw err;
    }
  };

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        activeYear,
        isLoading,
        error,
        refetch: fetchData,
        setActiveAcademicYear: setActiveYearAction,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}
