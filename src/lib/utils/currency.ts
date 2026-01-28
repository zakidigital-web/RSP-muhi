export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function numberToWords(num: number): string {
  const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const tens = ['', 'sepuluh', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
  const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];

  if (num === 0) return 'nol';
  if (num < 0) return 'minus ' + numberToWords(-num);

  let words = '';

  // Billions
  if (Math.floor(num / 1000000000) > 0) {
    const billions = Math.floor(num / 1000000000);
    words += (billions === 1 ? 'satu' : numberToWords(billions)) + ' milyar ';
    num %= 1000000000;
  }

  // Millions
  if (Math.floor(num / 1000000) > 0) {
    const millions = Math.floor(num / 1000000);
    words += (millions === 1 ? 'satu' : numberToWords(millions)) + ' juta ';
    num %= 1000000;
  }

  // Thousands
  if (Math.floor(num / 1000) > 0) {
    const thousands = Math.floor(num / 1000);
    words += (thousands === 1 ? 'seribu' : numberToWords(thousands) + ' ribu') + ' ';
    num %= 1000;
  }

  // Hundreds
  if (Math.floor(num / 100) > 0) {
    const hundreds = Math.floor(num / 100);
    words += (hundreds === 1 ? 'seratus' : ones[hundreds] + ' ratus') + ' ';
    num %= 100;
  }

  // Tens and ones
  if (num > 0) {
    if (num < 10) {
      words += ones[num];
    } else if (num < 20) {
      words += teens[num - 10];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[num % 10];
      }
    }
  }

  return words.trim() + ' rupiah';
}

export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d]/g, '');
  return parseInt(cleanValue) || 0;
}
