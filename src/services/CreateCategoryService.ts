import { getRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Category from '../models/Category';

interface Request {
  title: string;
}
class CreateTransactionService {
  public async execute({ title }: Request): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const category = categoriesRepository.create({
      title,
    });

    await categoriesRepository.save(category);

    return category;
  }
}

export default CreateTransactionService;
