import {
  InvoiceRecord,
  Performance,
  PerformanceRecord,
  Play,
  PlaysRecord,
  StatementData,
} from './types';

export function createStatementData(invoice: InvoiceRecord, plays: PlaysRecord): StatementData {
  const performances = invoice.performances.map(enrichPerformance);
  return {
    customer: invoice.customer,
    performances: performances,
    totalAmount: getTotalAmount(performances),
    totalVolumeCredits: getTotalVolumeCredits(performances),
  };
  function enrichPerformance(aPerformance: PerformanceRecord): Performance {
    const play = playFor(aPerformance);
    const amount = amountFor(aPerformance, play);
    const volumeCredits = volumeCreditsFor(aPerformance, play);

    return { ...aPerformance, play, amount, volumeCredits };
  }

  function playFor(aPerformance: PerformanceRecord): Play {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance: PerformanceRecord, play: Play): number {
    let result = 0;
    switch (play.type) {
      case 'tragedy':
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`unknown type: ${play.type}`);
    }

    return result;
  }

  function volumeCreditsFor(aPerformance: PerformanceRecord, play: Play) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ('comedy' === play.type) result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function getTotalAmount(data: Performance[]) {
    return data.reduce((total, p) => total + p.amount, 0);
  }

  function getTotalVolumeCredits(data: Performance[]) {
    return data.reduce((total, p) => total + p.volumeCredits, 0);
  }
}
