'use client';

import { useState, useEffect, useCallback } from 'react';

// Updated type to match database schema (integer id)
interface Student {
  id: number;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: number | null;
  className: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useStudents() {
  const [students, setStudentsState] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/students?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudentsState(data);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudentsState([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const addStudent = useCallback(async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add student');
      }
      await loadStudents();
      return { success: true };
    } catch (error) {
      console.error('Error adding student:', error);
      return { success: false, error };
    }
  }, [loadStudents]);

  const updateStudent = useCallback(async (student: Student) => {
    try {
      const response = await fetch(`/api/students?id=${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update student');
      }
      await loadStudents();
      return { success: true };
    } catch (error) {
      console.error('Error updating student:', error);
      return { success: false, error };
    }
  }, [loadStudents]);

  const deleteStudent = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete student');
      }
      await loadStudents();
      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      return { success: false, error };
    }
  }, [loadStudents]);

  const getActiveStudents = useCallback(() => {
    return students.filter(s => s.status === 'active');
  }, [students]);

  const getStudentsByClass = useCallback((classId: number) => {
    return students.filter(s => s.classId === classId && s.status === 'active');
  }, [students]);

  return {
    students,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    getActiveStudents,
    getStudentsByClass,
    refresh: loadStudents,
  };
}