import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding of Railway PostgreSQL database...');

  // 1. Clean existing records (Optional, let's keep it safe)
  console.log('Cleaning up existing data...');
  await prisma.attendance.deleteMany().catch(() => {});
  await prisma.payroll.deleteMany().catch(() => {});
  await prisma.employee.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.inventory.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 2. Seed Users
  console.log('Seeding Users...');
  const adminHashedPassword = await bcrypt.hash('admin123', 10);
  const customerHashedPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'إدارة معرض المدينة الوردية',
      email: 'admin@pinkcity.com',
      phone: '0791234567',
      password: adminHashedPassword,
      role: 'admin',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'يزن أبو خيط',
      email: 'yazan@pinkcity.com',
      phone: '0781234567',
      password: customerHashedPassword,
      role: 'customer',
    },
  });

  console.log(`Created admin user: ${admin.email}`);
  console.log(`Created customer user: ${customer.email}`);

  // 3. Seed Categories
  console.log('Seeding Categories...');
  const cat1 = await prisma.category.create({
    data: {
      id: 1,
      name: 'شاشات وتلفزيونات',
      imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=200',
    },
  });

  const cat2 = await prisma.category.create({
    data: {
      id: 2,
      name: 'ثلاجات ومبردات',
      imageUrl: 'https://images.unsplash.com/photo-1571175432246-e3d9c76cc531?auto=format&fit=crop&q=80&w=200',
    },
  });

  const cat3 = await prisma.category.create({
    data: {
      id: 3,
      name: 'غسالات وجلايات',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200',
    },
  });

  const cat4 = await prisma.category.create({
    data: {
      id: 4,
      name: 'أجهزة المطبخ الصغيرة',
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=200',
    },
  });

  // 4. Seed Products & Inventories
  console.log('Seeding Products and Inventories...');
  const productsData = [
    // Category 1: Screens
    {
      name: 'شاشة ال جي OLED 55 بوصة ذكية 4K',
      description: 'شاشة تلفزيون ال جي اوليد مذهلة بتجربة بصرية فائقة الوضوح، ألوان سينمائية سوداء نقية، وتقنيات الذكاء الاصطناعي مع تحديث 120 هرتز.',
      price: 589.0,
      sku: 'LG-OLED-55',
      barcode: '8806091234567',
      categoryId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600',
      quantity: 12,
      minQuantity: 3,
      location: 'الرف الرئيسي A1',
    },
    {
      name: 'شاشة سامسونج Crystal UHD 65 بوصة 4K',
      description: 'تلفزيون سامسونج الذكي بدقة فور كي وتدرج لوني فائق نقاء المعالج كريستال، مع تصميم نحيف رائع ونظام تشغيل تايزن.',
      price: 399.0,
      sku: 'SAM-CRYST-65',
      barcode: '8806091234588',
      categoryId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1601944179066-297acd3ad6d5?auto=format&fit=crop&q=80&w=600',
      quantity: 15,
      minQuantity: 4,
      location: 'الرف الرئيسي A2',
    },
    // Category 2: Refrigerators
    {
      name: 'ثلاجة بيكو بابين 450 لتر نوفروست',
      description: 'ثلاجة بيكو كفاءة طاقة متقدمة بتقنية تبريد ثلاثي متطور يمنع الروائح ويحافظ على رطوبة الخضار والفواكه لفترة أطول.',
      price: 349.0,
      sku: 'BEKO-RF-450',
      barcode: '8690842234567',
      categoryId: 2,
      imageUrl: 'https://images.unsplash.com/photo-1571175432246-e3d9c76cc531?auto=format&fit=crop&q=80&w=600',
      quantity: 8,
      minQuantity: 2,
      location: 'صالة العرض الكبرى B1',
    },
    {
      name: 'ثلاجة إل جي دولابي Side by Side 600 لتر',
      description: 'ثلاجة ال جي دولابي انفيرتر موفر للطاقة بتقنية تبريد دور كولينج لضمان حرارة مثالية ومتساوية في جميع الأجزاء.',
      price: 799.0,
      sku: 'LG-SIDE-600',
      barcode: '8806091234999',
      categoryId: 2,
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
      quantity: 5,
      minQuantity: 1,
      location: 'صالة العرض الكبرى B2',
    },
    // Category 3: Washing Machines
    {
      name: 'غسالة بوش 9 كيلو انفيرتر ألمانية',
      description: 'غسالة بوش الأوتوماتيكية مع محرك صامت فائق التحمل وتوفير فائق للمياه والكهرباء وبرامج غسيل متعددة الأغراض وسريعة.',
      price: 439.0,
      sku: 'BOSCH-WM-9KG',
      barcode: '4242005123456',
      categoryId: 3,
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
      quantity: 10,
      minQuantity: 3,
      location: 'جناح الغسالات C1',
    },
    {
      name: 'جلاية صحون سامسونج 12 فرد ستانلس',
      description: 'غسالة أطباق سامسونج بشاشة رقمية ورفوف مرنة ومستشعرات ذكية لتحديد حجم حمولة الأطباق وتوفير استهلاك الكهرباء.',
      price: 299.0,
      sku: 'SAM-DW-12P',
      barcode: '8806091234777',
      categoryId: 3,
      imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600',
      quantity: 6,
      minQuantity: 2,
      location: 'جناح الغسالات C2',
    },
    // Category 4: Small Appliances
    {
      name: 'قلاية فيليبس هوائية XXL حجم عائلي',
      description: 'مقلاة فيليبس بدون زيت بتقنية التبريد الهوائي السريع للقرمشة الفائقة مع دهون أقل بنسبة تصل إلى 90%. سعة كبيرة للعائلة.',
      price: 115.0,
      sku: 'PHIL-AF-XXL',
      barcode: '8710103123456',
      categoryId: 4,
      imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=600',
      quantity: 25,
      minQuantity: 5,
      location: 'جناح الأجهزة الصغيرة D1',
    },
    {
      name: 'محضرة طعام براون مالتي كويك 7',
      description: 'خلاط يدوي براون بقدرة 1000 واط مع ملحقات متعددة لفرم اللحوم، خفق البيض، وتقطيع الخضراوات بمستويات سرعة ذكية.',
      price: 54.0,
      sku: 'BRAUN-MQ-7',
      barcode: '8021029123456',
      categoryId: 4,
      imageUrl: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600',
      quantity: 30,
      minQuantity: 8,
      location: 'جناح الأجهزة الصغيرة D2',
    },
  ];

  for (const prodData of productsData) {
    const { quantity, minQuantity, location, ...rest } = prodData;

    const product = await prisma.product.create({
      data: rest,
    });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity,
        minQuantity,
        location,
      },
    });

    console.log(`Created product and inventory: ${product.name} (${prodData.sku})`);
  }

  console.log('PostgreSQL Seeding complete successfully! 🎉');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
