import { Injectable } from '@nestjs/common';
import type { Prisma } from '@web-engiperf/db';
import { PrismaService } from '../prisma/prisma.service.js';

// 排序白名单：防止任意字段排序打穿索引（也避免拼接出非法 orderBy）
const SORT_MAP: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  id: { id: 'asc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  rating: { rating: 'desc' },
  newest: { createdAt: 'desc' },
};

export interface FindAllParams {
  page: number;
  pageSize: number;
  category?: string;
  sort?: string;
}

export interface FindCursorParams {
  cursor?: string;
  pageSize: number;
  category?: string;
  sort?: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 偏移量分页（OFFSET/LIMIT）
   * 适合：传统页码跳转、需要 total 总数
   * 缺点：深分页时数据库需扫描并丢弃前面所有行，page=5000 时明显变慢（性能对比 demo 的基线）
   */
  async findAll({ page, pageSize, category, sort }: FindAllParams) {
    const where: Prisma.ProductWhereInput = category ? { category } : {};
    const orderBy = SORT_MAP[sort ?? 'id'] ?? SORT_MAP.id;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 游标分页（WHERE id > cursor LIMIT n）
   * 适合：无限滚动、移动端列表
   * 优点：无论翻到多深，性能恒定（走主键/索引定位，不扫描前页数据）
   */
  async findCursor({ cursor, pageSize, category, sort }: FindCursorParams) {
    // 游标分页只支持按唯一稳定字段排序，这里统一用 id
    const where: Prisma.ProductWhereInput = {
      ...(category ? { category } : {}),
      ...(cursor ? { id: { gt: Number(cursor) } } : {}),
    };

    const items = await this.prisma.product.findMany({
      where,
      orderBy: { id: 'asc' },
      take: pageSize + 1, // 多取一条判断是否还有下一页
    });

    const hasNext = items.length > pageSize;
    const pageItems = hasNext ? items.slice(0, pageSize) : items;

    return {
      items: pageItems,
      nextCursor: hasNext ? String(pageItems[pageItems.length - 1].id) : null,
      sort,
    };
  }

  /** 聚合统计：给前端仪表盘/筛选器提供数据概览 */
  async stats() {
    const [total, byCategory, avgPrice] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.product.groupBy({ by: ['category'], _count: { _all: true } }),
      this.prisma.product.aggregate({ _avg: { price: true } }),
    ]);

    return {
      total,
      byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })),
      avgPrice: avgPrice._avg.price,
    };
  }
}