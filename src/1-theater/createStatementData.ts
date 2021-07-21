import {
  InvoiceRecord,
  Performance,
  PerformanceRecord,
  Play,
  PlaysRecord,
  StatementData,
} from './types';

class PerformanceCalculator {
  performance: PerformanceRecord;
  play: Play;

  constructor(aPerformance: PerformanceRecord, aPlay: Play) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount(): number {
    let result = 0;
    switch (this.play.type) {
      case 'tragedy':
        result = 40000;
        if (this.performance.audience > 30) {
          result += 1000 * (this.performance.audience - 30);
        }
        break;
      case 'comedy':
        result = 30000;
        if (this.performance.audience > 20) {
          result += 10000 + 500 * (this.performance.audience - 20);
        }
        result += 300 * this.performance.audience;
        break;
      default:
        throw new Error(`unknown type: ${this.play.type}`);
    }

    return result;
  }
}

export function createStatementData(invoice: InvoiceRecord, plays: PlaysRecord): StatementData {
  const performances = invoice.performances.map(enrichPerformance);
  return {
    customer: invoice.customer,
    performances: performances,
    totalAmount: getTotalAmount(performances),
    totalVolumeCredits: getTotalVolumeCredits(performances),
  };
  function enrichPerformance(aPerformance: PerformanceRecord): Performance {
    const calculator = new PerformanceCalculator(aPerformance, playFor(aPerformance));
    const play = calculator.play;
    const amount = calculator.amount;
    const volumeCredits = volumeCreditsFor(aPerformance, play);

    return { ...aPerformance, play, amount, volumeCredits };
  }

  function playFor(aPerformance: PerformanceRecord): Play {
    return plays[aPerformance.playID];
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
