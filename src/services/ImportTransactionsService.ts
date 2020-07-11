import { getCustomRepository, getRepository } from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';

// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(csv: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const transactionsArray: CSVTransaction[] = [];

    const readCSVStream = fs.createReadStream(csv);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', async line => {
      const title = line[0];
      const type = line[1];
      const value = line[2];
      const category = line[3];

      transactionsArray.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesInCSV: string[] = [];
    const categoriesInDataBase: string[] = [];

    transactionsArray.map(transaction =>
      categoriesInCSV.push(transaction.category),
    );

    const categories = await categoriesRepository.find();

    categories.map(category => categoriesInDataBase.push(category.title));

    const categoriesToInclude = categoriesInCSV
      .filter(category => !categoriesInDataBase.includes(category))
      .sort()
      .reduce((accumulator: string[], current: string) => {
        const { length } = accumulator;
        if (length === 0 || accumulator[length - 1] !== current) {
          accumulator.push(current);
        }
        return accumulator;
      }, []);

    const categoriesInserted = categoriesRepository.create(
      categoriesToInclude.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(categoriesInserted);

    const categoriesAll = await categoriesRepository.find();

    const transactionsInserted = transactionsRepository.create(
      transactionsArray.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: categoriesAll.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(transactionsInserted);

    await fs.promises.unlink(csv);

    return transactionsInserted;
  }
}

export default ImportTransactionsService;
