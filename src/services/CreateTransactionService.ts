import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateCategoryService from './CreateCategoryService';

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
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('Transaction refused. Cause balance to be negative.');
    }

    let categoryID: string;

    const findCategoryDuplicated = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findCategoryDuplicated) {
      const createCategory = new CreateCategoryService();

      const categoryAdd = await createCategory.execute({ title: category });

      categoryID = categoryAdd.id;
    } else {
      categoryID = findCategoryDuplicated.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryID,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
