import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** 偏移量分页：GET /products?page=1&pageSize=20&category=books&sort=price_asc */
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findAll({ page, pageSize, category, sort });
  }

  /** 游标分页：GET /products/cursor?cursor=100&pageSize=20&category=books */
  @Get('cursor')
  findCursor(
    @Query('cursor') cursor: string | undefined,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('category') category?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findCursor({ cursor, pageSize, category, sort });
  }

  /** 聚合统计：GET /products/stats */
  @Get('stats')
  stats() {
    return this.productsService.stats();
  }
}