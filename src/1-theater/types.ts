export type PerformanceRecord = {
  playID: string;
  audience: number;
};

export type InvoiceRecord = {
  customer: string;
  performances: PerformanceRecord[];
};

export type Play = {
  name: string;
  type: PlayType;
};

type PlayType = 'tragedy' | 'comedy';

export type PlaysRecord = { [playID: string]: Play };

export type Performance = {
  playID: string;
  play: Play;
  audience: number;
  amount: number;
  volumeCredits: number;
};

export type StatementData = {
  customer: string;
  performances: Performance[];
  totalAmount: number;
  totalVolumeCredits: number;
};
