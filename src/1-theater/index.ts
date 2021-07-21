import { htmlStatement, statement } from './statement';
import * as invoice from './invoice.json';
import * as plays from './plays.json';

console.log(statement(invoice, plays));
console.log(htmlStatement(invoice, plays));
