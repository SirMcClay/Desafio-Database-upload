import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

async function loadCSV(filePath: string): Promise<string[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: string[] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService {
  async execute(csv: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', csv);

    const data = await loadCSV(csvFilePath);

    const createTransaction = new CreateTransactionService();

    const transactions: Transaction[] = [];

    const runCSVtoTransactions = data.map(async transaction => {
      const title = transaction[0];
      const type = transaction[1];
      const value = transaction[2];
      const category = transaction[3];

      const transactionAdd = await createTransaction.execute({
        title,
        type: type === 'income' ? 'income' : 'outcome',
        value: Number(value),
        category,
      });

      transactions.push(transactionAdd);
    });

    console.log(runCSVtoTransactions);

    return transactions;
  }
}

export default ImportTransactionsService;
