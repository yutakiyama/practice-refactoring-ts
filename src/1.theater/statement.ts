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

type Performance = PerformanceRecord & {
  play: Play;
};

type StatementData = {
  customer: string;
  performances: Performance[];
};

function statement(invoice: InvoiceRecord, plays: { [playID: string]: Play }) {
  const statementData: StatementData = {
    customer: invoice.customer,
    performances: invoice.performances.map(enrichPerformance),
  };
  return renderPlainText(statementData, plays);

  function enrichPerformance(aPerformance: PerformanceRecord): Performance {
    const result: Performance = { ...aPerformance, play: playFor(aPerformance) };
    return result;
  }

  function playFor(aPerformance: PerformanceRecord): Play {
    return plays[aPerformance.playID];
  }
}

function renderPlainText(data: StatementData, plays: { [playID: string]: Play }) {
  function totalAmount() {
    let result = 0;
    for (const perf of data.performances) {
      result += amountFor(perf);
    }

    return result;
  }

  function totalVolumeCredits() {
    let result = 0;
    for (const perf of data.performances) {
      result += volumeCreditsFor(perf);
    }

    return result;
  }

  function usd(aNumber: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(aNumber / 100);
  }

  function volumeCreditsFor(aPerformance: PerformanceRecord) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ('comedy' === playFor(aPerformance).type) result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  function playFor(aPerformance: PerformanceRecord): Play {
    return plays[aPerformance.playID];
  }

  function amountFor(aPerformance: PerformanceRecord): number {
    let result = 0;
    switch (playFor(aPerformance).type) {
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
        throw new Error(`unknown type: ${playFor(aPerformance).type}`);
    }

    return result;
  }

  let result = `Statement for ${data.customer}\n`;

  for (const perf of data.performances) {
    // 注文の内訳を出力
    result += ` ${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience} seats)\n`;
  }

  result += `Amount owed is ${usd(totalAmount())}\n`;
  result += `You earned ${totalVolumeCredits()} credits\n`;

  return result;
}

console.log(statement(invoice, plays));
