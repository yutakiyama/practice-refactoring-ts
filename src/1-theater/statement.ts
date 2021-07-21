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

function htmlStatement(invoice: InvoiceRecord, plays: PlaysRecord) {
  return renderHtml(createStatementData(invoice, plays));
}

function renderHtml(data: StatementData) {
  let result = `<h1>Statement for ${data.customer}</h1>\n`;
  result += '<table>\n';
  result += '<tr><th>play</th><th>seats</th><th>cost</th></tr>';
  for (const perf of data.performances) {
    result += `  <tr><td>${perf.play.name}</td><td>${perf.audience}</td>`;
    result += `<td>${usd(perf.amount)}</td></tr>\n`;
  }
  result += '</table>\n';
  result += `<p>Amount owed is <em>${usd(data.totalAmount)}</em></p>\n`;
  result += `<p>You earned <em>${data.totalVolumeCredits}</em> credits</p>\n`;
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
console.log(htmlStatement(invoice, plays));
