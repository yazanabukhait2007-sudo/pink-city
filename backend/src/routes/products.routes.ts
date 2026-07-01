import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { adminOnlyMiddleware } from '../middlewares/adminOnly.middleware';

const router = Router();

// ==========================================
// CATEGORIES ROUTES
// ==========================================

// 1) GET /api/categories - Get all categories
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' }
    });
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب قائمة التصنيفات.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2) POST /api/categories - Create category (Admin Only)
router.post('/categories', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, imageUrl } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "اسم التصنيف مطلوب."
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        imageUrl: imageUrl || null
      }
    });

    res.status(201).json({
      success: true,
      message: "تم إنشاء التصنيف بنجاح.",
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء التصنيف الجديد.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});


// ==========================================
// PRODUCTS ROUTES
// ==========================================

// 1) GET /api/products - List products with filter, search, and pagination (20 per page)
router.get('/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryIdQuery = req.query.categoryId;
    const searchQuery = req.query.search;
    const pageQuery = req.query.page;

    const limit = 20;
    const page = pageQuery ? Math.max(1, parseInt(String(pageQuery))) : 1;
    const skip = (page - 1) * limit;

    // Build Prisma query condition object
    const whereClause: any = {};

    // Filter by active products by default (unless query specified, but let's keep it clean or filter active)
    // We can show all but default is_active filter or just keep it simple.
    whereClause.isActive = true;

    if (categoryIdQuery) {
      whereClause.categoryId = parseInt(String(categoryIdQuery));
    }

    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: String(searchQuery), mode: 'insensitive' } },
        { description: { contains: String(searchQuery), mode: 'insensitive' } }
      ];
    }

    // Get total items for pagination
    const totalCount = await prisma.product.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / limit);

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true }
        },
        inventory: {
          select: { quantity: true, minQuantity: true, location: true }
        }
      },
      orderBy: { id: 'desc' },
      skip,
      take: limit
    });

    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب قائمة المنتجات.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2) GET /api/products/barcode/:code - Find product by barcode (important for barcode scanner)
router.get('/products/barcode/:code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    if (!code) {
      res.status(400).json({
        success: false,
        message: "يرجى تقديم رمز الباركود للبحث."
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { barcode: String(code).trim() },
      include: {
        category: {
          select: { id: true, name: true }
        },
        inventory: {
          select: { quantity: true, minQuantity: true, location: true }
        }
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: `لم يتم العثور على أي منتج يحمل الباركود: ${code}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء البحث عن المنتج باستخدام الباركود.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 3) GET /api/products/:id - Get single product details with inventory
router.get('/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "معرف المنتج غير صالح."
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true }
        },
        inventory: true
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "هذا المنتج غير موجود."
      });
      return;
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب تفاصيل المنتج.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 4) POST /api/products - Create Product & automatically initialize inventory (Admin Only)
router.post('/products', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, barcode, sku, categoryId, imageUrl, isActive, initialQuantity, minQuantity, location } = req.body;

    // Validate required fields
    if (!name || price === undefined || !categoryId) {
      res.status(400).json({
        success: false,
        message: "يرجى توفير اسم المنتج، السعر، والتصنيف لإتمام العملية."
      });
      return;
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!categoryExists) {
      res.status(400).json({
        success: false,
        message: "التصنيف المحدد غير موجود في النظام."
      });
      return;
    }

    // Check barcode unique
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: String(barcode).trim() }
      });
      if (existingBarcode) {
        res.status(400).json({
          success: false,
          message: "رمز الباركود هذا مستخدم بالفعل لمنتج آخر."
        });
        return;
      }
    }

    // Check SKU unique
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: String(sku).trim() }
      });
      if (existingSku) {
        res.status(400).json({
          success: false,
          message: "رمز الـ SKU هذا مستخدم بالفعل لمنتج آخر."
        });
        return;
      }
    }

    // Create Product and associated Inventory record in a Transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          description: description || null,
          price: parseFloat(price),
          barcode: barcode ? String(barcode).trim() : null,
          sku: sku ? String(sku).trim() : null,
          categoryId: parseInt(categoryId),
          imageUrl: imageUrl || null,
          isActive: isActive !== undefined ? Boolean(isActive) : true
        }
      });

      // Automatically create corresponding inventory
      await tx.inventory.create({
        data: {
          productId: prod.id,
          quantity: initialQuantity !== undefined ? parseInt(initialQuantity) : 0,
          minQuantity: minQuantity !== undefined ? parseInt(minQuantity) : 5,
          location: location || null
        }
      });

      return prod;
    });

    // Fetch the created product with its newly created inventory
    const finalProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: {
        category: true,
        inventory: true
      }
    });

    res.status(201).json({
      success: true,
      message: "تم إضافة المنتج بنجاح وتهيئة المخزن الخاص به.",
      product: finalProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة المنتج الجديد.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 5) PUT /api/products/:id - Update Product (Admin Only)
router.put('/products/:id', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, barcode, sku, categoryId, imageUrl, isActive, quantity, minQuantity, location } = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "معرف المنتج غير صالح."
      });
      return;
    }

    // Check if product exists
    const productExists = await prisma.product.findUnique({
      where: { id }
    });

    if (!productExists) {
      res.status(404).json({
        success: false,
        message: "المنتج المطلوب تعديله غير موجود."
      });
      return;
    }

    // Check unique barcode if updating
    if (barcode && barcode !== productExists.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode: String(barcode).trim() }
      });
      if (existingBarcode) {
        res.status(400).json({
          success: false,
          message: "رمز الباركود هذا مستخدم بالفعل لمنتج آخر."
        });
        return;
      }
    }

    // Check unique SKU if updating
    if (sku && sku !== productExists.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: String(sku).trim() }
      });
      if (existingSku) {
        res.status(400).json({
          success: false,
          message: "رمز الـ SKU هذا مستخدم بالفعل لمنتج آخر."
        });
        return;
      }
    }

    // Check category if updating
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      if (!categoryExists) {
        res.status(400).json({
          success: false,
          message: "التصنيف الجديد المحدد غير موجود."
        });
        return;
      }
    }

    // Update Product and inventory in a Transaction
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          price: price !== undefined ? parseFloat(price) : undefined,
          barcode: barcode !== undefined ? (barcode ? String(barcode).trim() : null) : undefined,
          sku: sku !== undefined ? (sku ? String(sku).trim() : null) : undefined,
          categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined,
          imageUrl: imageUrl !== undefined ? imageUrl : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined
        }
      });

      // Update Inventory if inventory data is supplied
      if (quantity !== undefined || minQuantity !== undefined || location !== undefined) {
        await tx.inventory.upsert({
          where: { productId: id },
          create: {
            productId: id,
            quantity: quantity !== undefined ? parseInt(quantity) : 0,
            minQuantity: minQuantity !== undefined ? parseInt(minQuantity) : 5,
            location: location || null
          },
          update: {
            quantity: quantity !== undefined ? parseInt(quantity) : undefined,
            minQuantity: minQuantity !== undefined ? parseInt(minQuantity) : undefined,
            location: location !== undefined ? location : undefined
          }
        });
      }
    });

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true
      }
    });

    res.status(200).json({
      success: true,
      message: "تم تحديث المنتج بنجاح.",
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث المنتج.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 6) DELETE /api/products/:id - Delete Product (Admin Only)
router.delete('/products/:id', authMiddleware, adminOnlyMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: "معرف المنتج غير صالح."
      });
      return;
    }

    const productExists = await prisma.product.findUnique({
      where: { id }
    });

    if (!productExists) {
      res.status(404).json({
        success: false,
        message: "المنتج المطلوب حذفه غير موجود."
      });
      return;
    }

    // Cascade deletes inventory automatically thanks to Prisma or setup, but let's delete it explicitly or rely on onDelete cascade.
    // In our schema.prisma, we configured:
    // `product Product @relation(fields: [productId], references: [id], onDelete: Cascade)`
    // So deleting the product will automatically delete its inventory!
    await prisma.product.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "تم حذف المنتج بنجاح وكافة البيانات المرتبطة به."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة حذف المنتج.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
