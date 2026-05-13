import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { categories } from '../db/schema';

@Injectable()
export class CategoriesService {
  async findAll() {
    return await db.select().from(categories);
  }
}