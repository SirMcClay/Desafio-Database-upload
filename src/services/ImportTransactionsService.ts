import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute({ csvFileName }: string): Promise<Transaction[]> {
    // TODO
  }
}

export default ImportTransactionsService;
