'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaymentType } from '@/lib/types';

export function usePaymentTypes() {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Using limit=1000 to get all types for selection
      const response = await fetch('/api/payment-types?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch payment types');
      const data = await response.json();
      setPaymentTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching payment types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentTypes();
  }, [fetchPaymentTypes]);

  const addPaymentType = async (type: Omit<PaymentType, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/payment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add payment type');
      }
      await fetchPaymentTypes();
    } catch (err) {
      throw err;
    }
  };

  const updatePaymentType = async (id: number, updates: Partial<PaymentType>) => {
    try {
      const response = await fetch(`/api/payment-types?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment type');
      }
      await fetchPaymentTypes();
    } catch (err) {
      throw err;
    }
  };

  const deletePaymentType = async (id: number) => {
    try {
      const response = await fetch(`/api/payment-types?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete payment type');
      }
      await fetchPaymentTypes();
    } catch (err) {
      throw err;
    }
  };

  return {
    paymentTypes,
    isLoading,
    error,
    refetch: fetchPaymentTypes,
    addPaymentType,
    updatePaymentType,
    deletePaymentType,
  };
}
