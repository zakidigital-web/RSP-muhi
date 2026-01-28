'use client';

import { Button } from '@/components/ui/button';
import { Printer, FileText } from 'lucide-react';
import { Payment } from '@/lib/types';
import { useSchoolInfo } from '@/hooks/useSchoolInfo';
import { monthNames as globalMonthNames, getMonthName } from '@/lib/utils/date';
import { formatCurrency, numberToWords } from '@/lib/utils/currency';

// Fallback for monthNames if the import fails or is undefined during runtime
const monthNames = globalMonthNames || [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

interface ReceiptPrintProps {
  payment: Payment;
  onClose: () => void;
}

export function ReceiptPrint({ payment, onClose }: ReceiptPrintProps) {
  const { schoolInfo: dbSchoolInfo, isLoading } = useSchoolInfo();
  
  // Default values if school info not set in DB
  const schoolInfo = dbSchoolInfo || {
    name: 'SMP Negeri 1',
    address: 'Jl. Pendidikan No. 1',
    phone: '021-12345678',
    email: 'info@smpn1.sch.id',
    principalName: 'Drs. Ahmad Sudirman, M.Pd',
    npsn: '12345678',
  };

  const handlePrintA4 = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Kuitansi - ${payment.receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
          }
          .header h1 { 
            font-size: 24px; 
            margin-bottom: 8px;
            font-weight: bold;
          }
          .header p { 
            font-size: 13px; 
            color: #333;
            line-height: 1.4;
          }
          .title { 
            text-align: center; 
            margin: 25px 0; 
          }
          .title h2 { 
            font-size: 20px; 
            text-decoration: underline;
            font-weight: bold;
          }
          .receipt-no { 
            text-align: right; 
            margin-bottom: 25px;
            font-size: 14px;
          }
          .content { 
            margin: 25px 0; 
            line-height: 2;
          }
          .row { 
            display: flex; 
            margin-bottom: 8px;
            font-size: 15px;
          }
          .label { 
            width: 180px;
            flex-shrink: 0;
          }
          .value { 
            flex: 1;
            font-weight: 500;
          }
          .amount-box { 
            border: 2px solid #000; 
            padding: 20px; 
            margin: 30px 0;
            background: #f9f9f9;
          }
          .amount-row { 
            display: flex; 
            justify-content: space-between; 
            font-size: 20px; 
            font-weight: bold;
            margin-bottom: 12px;
          }
          .terbilang { 
            font-style: italic; 
            margin-top: 10px; 
            font-size: 13px;
            color: #333;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          .footer { 
            margin-top: 60px; 
            display: flex; 
            justify-content: space-between; 
          }
          .signature { 
            text-align: center; 
            width: 200px;
            font-size: 14px;
          }
          .signature-line { 
            border-top: 2px solid #000; 
            margin-top: 80px; 
            padding-top: 8px;
            font-weight: 500;
          }
          .signature p {
            margin-bottom: 5px;
          }
          @media print { 
            body { 
              padding: 20px;
            } 
            @page { 
              size: A4; 
              margin: 15mm; 
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${schoolInfo.name}</h1>
          <p>${schoolInfo.address}</p>
          <p>Telp: ${schoolInfo.phone} | Email: ${schoolInfo.email}</p>
          <p>NPSN: ${schoolInfo.npsn}</p>
        </div>
        
        <div class="title">
          <h2>KUITANSI PEMBAYARAN</h2>
        </div>
        
        <div class="receipt-no">
          <strong>No: ${payment.receiptNumber}</strong>
        </div>
        
        <div class="content">
          <div class="row">
            <span class="label">Telah diterima dari</span>
            <span class="value">: <strong>${payment.studentName}</strong></span>
          </div>
          <div class="row">
            <span class="label">NIS</span>
            <span class="value">: ${payment.studentNis}</span>
          </div>
          <div class="row">
            <span class="label">Kelas</span>
            <span class="value">: ${payment.className}</span>
          </div>
          <div class="row">
            <span class="label">Untuk Pembayaran</span>
            <span class="value">: ${payment.paymentTypeName}${payment.month ? ` - ${monthNames[payment.month - 1]} ${payment.year}` : ''}</span>
          </div>
          <div class="row">
            <span class="label">Metode Pembayaran</span>
            <span class="value">: ${payment.paymentMethod === 'cash' ? 'Tunai' : payment.paymentMethod === 'transfer' ? 'Transfer' : 'Lainnya'}</span>
          </div>
          ${payment.notes ? `
          <div class="row">
            <span class="label">Catatan</span>
            <span class="value">: ${payment.notes}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="amount-box">
          <div class="amount-row">
            <span>Jumlah:</span>
            <span>${formatCurrency(payment.amount)}</span>
          </div>
          <div class="terbilang">
            <strong>Terbilang:</strong> ${numberToWords(payment.amount)}
          </div>
        </div>
        
        <div class="footer">
          <div class="signature">
            <p>Penyetor,</p>
            <div class="signature-line">${payment.studentName}</div>
          </div>
          <div class="signature">
            <p>${new Date(payment.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Bendahara,</p>
            <div class="signature-line">(.....................)</div>
          </div>
        </div>
        
        <script>
          // Auto-print when loaded
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
          
          // Close after printing (for popup windows)
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    printContent(content, 'A4');
  };

  const handlePrintThermal = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Kuitansi - ${payment.receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            width: 80mm; 
            padding: 5mm; 
            font-size: 11px;
            background: white;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { 
            border-top: 1px dashed #000; 
            margin: 8px 0; 
          }
          .thick-line {
            border-top: 2px solid #000;
            margin: 8px 0;
          }
          .row { 
            display: flex; 
            justify-content: space-between; 
            margin: 4px 0;
            font-size: 11px;
          }
          .header { 
            margin-bottom: 8px; 
            padding-bottom: 5px;
          }
          .header .bold {
            font-size: 13px;
            margin-bottom: 3px;
          }
          .header div {
            font-size: 10px;
            line-height: 1.3;
          }
          .amount { 
            font-size: 15px; 
            font-weight: bold; 
            margin: 10px 0;
            text-align: center;
          }
          .footer {
            margin-top: 10px;
            font-size: 10px;
            text-align: center;
          }
          .receipt-title {
            font-size: 12px;
            margin: 5px 0;
          }
          @media print { 
            @page { 
              margin: 0; 
              size: 80mm auto; 
            }
            body { 
              width: 80mm;
              padding: 3mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header center">
          <div class="bold">${schoolInfo.name}</div>
          <div>${schoolInfo.address}</div>
          <div>Telp: ${schoolInfo.phone}</div>
        </div>
        
        <div class="thick-line"></div>
        
        <div class="center bold receipt-title">KUITANSI PEMBAYARAN</div>
        <div class="center" style="font-size: 10px;">${payment.receiptNumber}</div>
        
        <div class="line"></div>
        
        <div class="row">
          <span>Tanggal</span>
          <span>${new Date(payment.paymentDate).toLocaleDateString('id-ID')}</span>
        </div>
        <div class="row">
          <span>NIS</span>
          <span>${payment.studentNis}</span>
        </div>
        <div style="margin: 4px 0;">
          <div style="font-size: 10px; color: #666;">Nama:</div>
          <div class="bold">${payment.studentName}</div>
        </div>
        <div class="row">
          <span>Kelas</span>
          <span>${payment.className}</span>
        </div>
        
        <div class="line"></div>
        
        <div style="margin: 4px 0;">
          <div style="font-size: 10px; color: #666;">Pembayaran:</div>
          <div class="bold">${payment.paymentTypeName}</div>
        </div>
        ${payment.month ? `
        <div class="row">
          <span>Bulan</span>
          <span>${monthNames[payment.month - 1]} ${payment.year}</span>
        </div>
        ` : ''}
        <div class="row">
          <span>Metode</span>
          <span>${payment.paymentMethod === 'cash' ? 'Tunai' : payment.paymentMethod === 'transfer' ? 'Transfer' : 'Lainnya'}</span>
        </div>
        
        <div class="thick-line"></div>
        
        <div class="amount">
          <div style="font-size: 11px; font-weight: normal; margin-bottom: 3px;">TOTAL BAYAR</div>
          <div>${formatCurrency(payment.amount)}</div>
        </div>
        
        <div class="thick-line"></div>
        
        <div class="footer">
          <div style="margin-top: 8px;">Terima kasih</div>
          <div style="margin-top: 5px; font-size: 9px;">Simpan kuitansi ini sebagai</div>
          <div style="font-size: 9px;">bukti pembayaran yang sah</div>
          <div style="margin-top: 8px; font-size: 9px;">Dicetak: ${new Date().toLocaleString('id-ID')}</div>
        </div>
        
        <script>
          // Auto-print when loaded
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
          
          // Close after printing (for popup windows)
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    printContent(content, 'thermal');
  };

  const printContent = (htmlContent: string, type: 'A4' | 'thermal') => {
    // Create blob and object URL
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      // In iframe: use hidden iframe method
      printWithHiddenIframe(htmlContent, blobUrl);
    } else {
      // Not in iframe: try popup window first
      const width = type === 'thermal' ? 350 : 800;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      try {
        const printWindow = window.open(
          blobUrl, 
          '_blank',
          `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );
        
        if (printWindow) {
          // Cleanup blob URL after window loads
          printWindow.addEventListener('load', () => {
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          });
        } else {
          // Popup blocked, fallback to iframe
          printWithHiddenIframe(htmlContent, blobUrl);
        }
      } catch (error) {
        // Error opening popup, fallback to iframe
        printWithHiddenIframe(htmlContent, blobUrl);
      }
    }
  };

  const printWithHiddenIframe = (htmlContent: string, blobUrl?: string) => {
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load, then print
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (error) {
            console.error('Print error:', error);
          }
          
          // Cleanup after printing
          setTimeout(() => {
            if (blobUrl) {
              URL.revokeObjectURL(blobUrl);
            }
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Receipt Preview */}
      <div className="rounded-lg border p-6 space-y-4 bg-white">
        <div className="text-center border-b pb-4">
          <h3 className="font-bold text-lg">{schoolInfo.name}</h3>
          <p className="text-sm text-muted-foreground">{schoolInfo.address}</p>
          <p className="text-xs text-muted-foreground">Telp: {schoolInfo.phone}</p>
        </div>

        <div className="text-center">
          <h4 className="font-semibold underline">KUITANSI PEMBAYARAN</h4>
          <p className="text-sm font-mono">{payment.receiptNumber}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nama:</span>
            <span className="font-medium">{payment.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">NIS:</span>
            <span>{payment.studentNis}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kelas:</span>
            <span>{payment.className}</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pembayaran:</span>
            <span>{payment.paymentTypeName}</span>
          </div>
          {payment.month && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bulan:</span>
              <span>{monthNames[payment.month - 1]} {payment.year}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tanggal:</span>
            <span>{new Date(payment.paymentDate).toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Metode:</span>
            <span>
              {payment.paymentMethod === 'cash' ? 'Tunai' : 
               payment.paymentMethod === 'transfer' ? 'Transfer' : 'Lainnya'}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">{formatCurrency(payment.amount)}</span>
          </div>
          <p className="text-xs text-muted-foreground italic mt-1">
            Terbilang: {numberToWords(payment.amount)}
          </p>
        </div>
      </div>

      {/* Print Buttons */}
      <div className="flex gap-2">
        <Button onClick={handlePrintA4} className="flex-1" size="lg">
          <FileText className="mr-2 h-4 w-4" />
          Cetak A4
        </Button>
        <Button onClick={handlePrintThermal} variant="outline" className="flex-1" size="lg">
          <Printer className="mr-2 h-4 w-4" />
          Cetak Thermal
        </Button>
      </div>
      <Button variant="ghost" onClick={onClose} className="w-full">
        Tutup
      </Button>
    </div>
  );
}