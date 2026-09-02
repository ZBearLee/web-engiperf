import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = ['electronics', 'clothing', 'food', 'books', 'toys', 'sports', 'home', 'beauty'];
const ADJECTIVES = ['轻盈', '经典', '智能', '便携', '耐用', '高端', '简约', '复古', '极速', '静音'];
const NOUNS = ['蓝牙耳机', '机械键盘', '冲锋衣', '养生壶', '科幻小说', '积木套装', '瑜伽垫', '香薰灯', '保温杯', '显示器', '帆布包', '桌面风扇'];

// mulberry32 固定种子伪随机：保证每次 seed 的数据可复现
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const total = Number(process.env.SEED_COUNT ?? 100000);
  const rand = mulberry32(42);

  const start = Date.now();
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log(`数据库已有 ${existing} 条数据，先清空...`);
    await prisma.product.deleteMany();
  }

  const BATCH = 5000;
  for (let offset = 0; offset < total; offset += BATCH) {
    const size = Math.min(BATCH, total - offset);
    const data = Array.from({ length: size }, (_, i) => {
      const idx = offset + i;
      const stock = Math.floor(rand() * 5000);
      return {
        sku: `SKU-${String(idx + 1).padStart(6, '0')}`,
        name: `${ADJECTIVES[Math.floor(rand() * ADJECTIVES.length)]}${NOUNS[Math.floor(rand() * NOUNS.length)]}-${idx + 1}`,
        category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
        price: Math.round((rand() * 990 + 10) * 100) / 100,
        stock,
        rating: Math.round(rand() * 50) / 10,
        status: stock < 50 ? 'LOW_STOCK' : rand() < 0.05 ? 'DISCONTINUED' : 'ACTIVE',
        createdAt: new Date(Date.now() - Math.floor(rand() * 365) * 86_400_000),
      };
    });
    await prisma.product.createMany({ data });
    console.log(`已写入 ${offset + size}/${total}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`seed 完成：${total} 条，耗时 ${elapsed}s`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());