import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  async getOrCreateCategory(categoryName: string): Promise<Category> {
    let category: Category;

    const slug = categoryName.toLocaleLowerCase().replace(/ /g, '-');
    category = await this.findOne({ where: { slug: slug } });

    if (!category) {
      category = await this.save(
        this.create({
          slug,
          name: categoryName,
        }),
      );
    }

    return category;
  }
}
