'use client';

import { useState, useEffect, useCallback } from 'react';
import { SchoolInfo } from '@/lib/types';

export function useSchoolInfo() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/school-info');
      if (!response.ok) {
        if (response.status === 404) {
          setSchoolInfo(null);
          return;
        }
        throw new Error('Failed to fetch school info');
      }
      const data = await response.json();
      setSchoolInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching school info:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchoolInfo();
  }, [fetchSchoolInfo]);

  const updateSchoolInfo = async (info: Partial<SchoolInfo>) => {
    try {
      const response = await fetch('/api/school-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update school info');
      }
      const data = await response.json();
      setSchoolInfo(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    schoolInfo,
    isLoading,
    error,
    refetch: fetchSchoolInfo,
    updateSchoolInfo,
  };
}
