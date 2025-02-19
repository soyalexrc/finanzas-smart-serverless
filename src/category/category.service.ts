import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from '../currency/entities/currency.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoryModel.create(createCategoryDto);
    } catch (error) {
      return {
        error,
      };
    }
  }

  async findAll() {
    try {
      return await this.categoryModel.find();
    } catch (error) {
      throw new Error(`Error listing categories: ${error.message}`);
    }
  }

  async findByUser(userId: string) {
    try {
      return await this.categoryModel.find({ user: userId });
    } catch (error) {
      throw new Error(`Error listing categories: ${error.message}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
