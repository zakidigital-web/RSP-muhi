'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function useDatabase() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Export database to JSON
  const exportDatabase = async () => {
    try {
      setIsExporting(true);

      const response = await fetch('/api/database/export', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to export database');
      }

      const result = await response.json();
      
      // Create download
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spp-database-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('✅ Database berhasil diexport');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      toast.error(`❌ Export gagal: ${message}`);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON to database
  const importDatabase = async (jsonData: string) => {
    try {
      setIsImporting(true);

      const data = JSON.parse(jsonData);

      const response = await fetch('/api/database/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import data');
      }

      const result = await response.json();
      
      // Clear all browser storage after successful import
      clearAllStorage();
      
      toast.success('✅ Data berhasil diimport ke database');
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      toast.error(`❌ Import gagal: ${message}`);
      return { success: false, error: message };
    } finally {
      setIsImporting(false);
    }
  };

  // Reset database (delete all data)
  const resetDatabase = async () => {
    try {
      setIsResetting(true);

      const response = await fetch('/api/database/reset', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset database');
      }

      const result = await response.json();
      
      // Clear ALL browser storage after successful database reset
      clearAllStorage();
      
      toast.success('✅ Database dan semua storage lokal berhasil direset');
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed';
      toast.error(`❌ Reset gagal: ${message}`);
      return { success: false, error: message };
    } finally {
      setIsResetting(false);
    }
  };

  // Helper function to clear ALL browser storage (localStorage + sessionStorage)
  const clearAllStorage = () => {
    try {
      console.log('🧹 Clearing all browser storage...');
      
      // Get all keys before clearing
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      
      console.log('📦 localStorage keys before clear:', localStorageKeys);
      console.log('📦 sessionStorage keys before clear:', sessionStorageKeys);
      
      // Clear localStorage completely
      localStorage.clear();
      console.log('✓ localStorage cleared');
      
      // Clear sessionStorage completely
      sessionStorage.clear();
      console.log('✓ sessionStorage cleared');
      
      // Verify storage is empty
      const remainingLocal = Object.keys(localStorage);
      const remainingSession = Object.keys(sessionStorage);
      
      if (remainingLocal.length > 0) {
        console.warn('⚠️ localStorage still has keys:', remainingLocal);
      } else {
        console.log('✅ localStorage completely empty');
      }
      
      if (remainingSession.length > 0) {
        console.warn('⚠️ sessionStorage still has keys:', remainingSession);
      } else {
        console.log('✅ sessionStorage completely empty');
      }
      
      console.log('🎉 All browser storage cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      toast.error('Peringatan: Gagal menghapus storage lokal');
    }
  };

  return {
    exportDatabase,
    importDatabase,
    resetDatabase,
    isExporting,
    isImporting,
    isResetting,
  };
}