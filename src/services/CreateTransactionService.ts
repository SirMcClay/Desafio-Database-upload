import { getCustomRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
// import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const findCategoryDuplicated = await transactionsRepository.findOne({
      where: { category },
    });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: `${
        findCategoryDuplicated ? findCategoryDuplicated.category_id : category
      }`,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
