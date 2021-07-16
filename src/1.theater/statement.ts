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
  amount: number;
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
  return renderPlainText(statementData);

  function enrichPerformance(aPerformance: PerformanceRecord): Performance {
    const play = playFor(aPerformance);
    const amount = amountFor(aPerformance, play);
    return { ...aPerformance, play, amount };
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
}

function renderPlainText(data: StatementData) {
  function totalAmount() {
    let result = 0;
    for (const perf of data.performances) {
      result += perf.amount;
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

  function volumeCreditsFor(aPerformance: Performance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ('comedy' === aPerformance.play.type) result += Math.floor(aPerformance.audience / 5);
    return result;
  }

  let result = `Statement for ${data.customer}\n`;

  for (const perf of data.performances) {
    // 注文の内訳を出力
    result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience} seats)\n`;
  }

  result += `Amount owed is ${usd(totalAmount())}\n`;
  result += `You earned ${totalVolumeCredits()} credits\n`;

  return result;
}

console.log(statement(invoice, plays));
