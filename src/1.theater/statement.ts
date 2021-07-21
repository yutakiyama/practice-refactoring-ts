import * as invoice from './invoice.json';
import * as plays from './plays.json';

interface PerformanceRecord {
  playID: string;
  audience: number;
}

interface InvoiceRecord {
  customer: string;
  performances: PerformanceRecord[];
}

interface Play {
  name: string;
  type: string;
}

type PlaysRecord = { [playID: string]: Play };

type Performance = PerformanceRecord & {
  play: Play;
  amount: number;
  volumeCredits: number;
};

type StatementData = {
  customer: string;
  performances: Performance[];
  totalAmount: number;
  totalVolumeCredits: number;
};

function statement(invoice: InvoiceRecord, plays: PlaysRecord) {
  return renderPlainText(createStatementData(invoice, plays));
}

function createStatementData(invoice: InvoiceRecord, plays: PlaysRecord): StatementData {
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

function renderPlainText(data: StatementData) {
  let result = `Statement for ${data.customer}\n`;

  for (const perf of data.performances) {
    // 注文の内訳を出力
    result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience} seats)\n`;
  }

  result += `Amount owed is ${usd(data.totalAmount)}\n`;
  result += `You earned ${data.totalVolumeCredits} credits\n`;

  return result;
}

function usd(aNumber: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}

console.log(statement(invoice, plays));
