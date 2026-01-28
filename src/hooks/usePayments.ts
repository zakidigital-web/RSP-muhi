'use client';

import { useState, useEffect, useCallback } from 'react';

interface Payment {
  id: number;
  receiptNumber: string;
  studentId: number;
  studentName: string;
  studentNis: string;
  className: string;
  paymentTypeId: number;
  paymentTypeName: string;
  amount: number;
  paymentDate: string;
  month: number | null;
  year: number;
  academicYearId: number;
  isInstallment: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  remainingAmount?: number;
  isPaidOff: boolean;
  notes?: string;
  createdAt: string;
}

export function usePayments() {
  const [payments, setPaymentsState] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletedPayments, setDeletedPayments] = useState<Payment[]>([]);

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payments?limit=1000');
      if (!response.ok) throw new Error('Failed to load payments');
      
      const data = await response.json();
      const paymentsData = data || [];
      
        setPaymentsState(paymentsData.sort((a: Payment, b: Payment) => {
          const dateA = new Date(a.paymentDate).getTime();
          const dateB = new Date(b.paymentDate).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return b.id - a.id;
        }));
    } catch (error) {
      console.error('Error loading payments:', error);
      setPaymentsState([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      
      if (!response.ok) throw new Error('Failed to add payment');
      
      await loadPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }, [loadPayments]);

  const updatePayment = useCallback(async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments?id=${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      
      if (!response.ok) throw new Error('Failed to update payment');
      
      await loadPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }, [loadPayments]);

  const deletePayment = useCallback(async (id: number) => {
    try {
      const payment = payments.find(p => p.id === id);
      if (payment) {
        setDeletedPayments(prev => [...prev, payment]);
      }
      
      const response = await fetch(`/api/payments?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete payment');
      
      await loadPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }, [payments, loadPayments]);

  const undoDelete = useCallback(async () => {
    if (deletedPayments.length > 0) {
      const lastDeleted = deletedPayments[deletedPayments.length - 1];
      try {
        await addPayment(lastDeleted);
        setDeletedPayments(prev => prev.slice(0, -1));
        return lastDeleted;
      } catch (error) {
        console.error('Error restoring payment:', error);
        return null;
      }
    }
    return null;
  }, [deletedPayments, addPayment]);

  const getPaymentsByStudent = useCallback((studentId: number) => {
    return payments.filter(p => p.studentId === studentId);
  }, [payments]);

  const getPaymentsByMonth = useCallback((month: number, year: number) => {
    return payments.filter(p => {
      const date = new Date(p.paymentDate);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  }, [payments]);

  const getPaymentsByYear = useCallback((year: number) => {
    return payments.filter(p => p.year === year);
  }, [payments]);

  const getTotalAmount = useCallback((filterPayments?: Payment[]) => {
    const paymentsToSum = filterPayments || payments;
    return paymentsToSum.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  return {
    payments,
    isLoading,
    addPayment,
    updatePayment,
    deletePayment,
    undoDelete,
    getPaymentsByStudent,
    getPaymentsByMonth,
    getPaymentsByYear,
    getTotalAmount,
    refresh: loadPayments,
  };
}