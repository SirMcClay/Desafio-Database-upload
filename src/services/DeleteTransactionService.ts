import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('This transaction does not exists.');
    }

    const checkBalance = balance.total - transaction.value;

    if (transaction.type === 'income' && checkBalance < 0) {
      throw new AppError('Transaction refused. Cause balance to be negative.');
    }

    transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
