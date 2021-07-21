import * as invoice from './invoice.json';
import * as plays from './plays.json';
import { InvoiceRecord, PlaysRecord, StatementData } from './types';
import { createStatementData } from './createStatementData';

function statement(invoice: InvoiceRecord, plays: PlaysRecord) {
  return renderPlainText(createStatementData(invoice, plays));
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
