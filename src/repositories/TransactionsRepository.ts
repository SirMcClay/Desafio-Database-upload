import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Accumulator {
  income: Transaction[];
  outcome: Transaction[];
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const initialValue: Accumulator = { income: [], outcome: [] };
    const transactions = await this.find();

    const groupByType: Accumulator = transactions.reduce(
      (acc, obj: Transaction) => {
        const key = obj.type;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      },
      initialValue,
    );

    if (transactions.length < 1) {
      return {
        income: 0,
        outcome: 0,
        total: 0,
      };
    }

    const outcome = groupByType.outcome
      ? groupByType.outcome.reduce((acc, obj) => {
          return acc + obj.value;
        }, 0)
      : 0;
    const income = groupByType.income
      ? groupByType.income.reduce((acc, obj) => {
          return acc + obj.value;
        }, 0)
      : 0;

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
