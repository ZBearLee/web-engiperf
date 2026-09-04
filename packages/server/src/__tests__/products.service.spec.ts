import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Test } from '@nestjs/testing'
import { ProductsService } from '../products/products.service'
import { PrismaService } from '../prisma/prisma.service'

describe('ProductsService（分页逻辑）', () => {
  let service: ProductsService
  // mock：替身 PrismaService。不连真数据库，只记录被怎么调用、返回假数据
  const prismaMock = {
    product: { findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const moduleRef = await Test.createTestingModule({
      providers: [ProductsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile()
    service = moduleRef.get(ProductsService)
  })

  it('findAll 偏移分页：返回结构正确且 skip 计算对', async () => {
    const items = [{ id: 1 }, { id: 2 }]
    prismaMock.$transaction.mockResolvedValue([items, 100]) // [数据行, 总数]

    const res = await service.findAll({ page: 3, pageSize: 20 })

    expect(res.items).toBe(items)
    expect(res.total).toBe(100)
    expect(res.page).toBe(3)
    expect(res.pageSize).toBe(20)
    expect(res.totalPages).toBe(5) // ceil(100/20)
    // 第 3 页应跳过前面 2 页：(3-1)*20 = 40
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 }),
    )
  })

  it('findCursor 取满 pageSize+1 条时，给出 nextCursor', async () => {
    // 故意多返回 1 条，模拟“还有下一页”的信号
    const rows = Array.from({ length: 21 }, (_, i) => ({ id: i + 1 }))
    prismaMock.product.findMany.mockResolvedValue(rows)

    const res = await service.findCursor({ pageSize: 20 })

    expect(res.items).toHaveLength(20) // 对外只给 20 条
    expect(res.items[19].id).toBe(20)
    expect(res.nextCursor).toBe('20') // 用最后一条的 id 当下一页游标
  })

  it('findCursor 不足一页时，nextCursor 为 null', async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }])

    const res = await service.findCursor({ pageSize: 20 })

    expect(res.items).toHaveLength(2)
    expect(res.nextCursor).toBeNull()
  })
})
