import * as invoice from './invoice.json';
import * as plays from './plays.json';

interface Performance {
  playID: string;
  audience: number;
}

interface Invoice {
  customer: string;
  performances: Performance[];
}

interface Play {
  name: string;
  type: string;
}

function statement(invoice: Invoice, plays: { [playID: string]: Play }) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;

  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;

  for (const perf of invoice.performances) {
    const play = plays[perf.playID];
    const thisAmount = amountFor(perf, play);

    // ボリューム特典のポイントを加算
    volumeCredits += Math.max(perf.audience - 30, 0);
    // 喜劇のときは10人につき、さらにポイントを加算
    if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);
    // 注文の内訳を出力
    result += ` ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`;
    totalAmount += thisAmount;
  }

  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;

  return result;

  function amountFor(aPerformance: Performance, play: Play): number {
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

console.log(statement(invoice, plays));
