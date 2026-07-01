import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { employeeOnlyMiddleware } from '../middlewares/employeeOnly.middleware';

const router = Router();

// ==========================================
// CUSTOMER ORDER ROUTES (Authenticated)
// ==========================================

// 1) POST /api/orders - Place a new order with atomic transaction & stock reduction
router.post('/orders', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items, address, phone, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "غير مصرح. يجب تسجيل الدخول لطلب المنتجات."
      });
      return;
    }

    if (!address || !phone) {
      res.status(400).json({
        success: false,
        message: "يرجى تقديم عنوان الشحن ورقم الهاتف لإتمام الطلب."
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "يرجى اختيار منتج واحد على الأقل لإتمام الطلب."
      });
      return;
    }

    // Run order creation and stock decrement in a secure transaction
    const result = await prisma.$transaction(async (tx) => {
      let computedTotalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        const productId = parseInt(item.productId);
        const requestedQty = parseInt(item.quantity);

        if (isNaN(productId) || isNaN(requestedQty) || requestedQty <= 0) {
          throw new Error("بيانات المنتجات أو الكميات المطلوبة غير صالحة.");
        }

        // Fetch the product with its current inventory
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: { inventory: true }
        });

        if (!product) {
          throw new Error(`المنتج ذو المعرّف ${productId} غير موجود في النظام.`);
        }

        if (!product.isActive) {
          throw new Error(`المنتج "${product.name}" غير متاح حالياً للطلب.`);
        }

        if (!product.inventory) {
          throw new Error(`المخزن الخاص بالمنتج "${product.name}" غير مهيأ.`);
        }

        // Check if stock is sufficient
        if (product.inventory.quantity < requestedQty) {
          throw new Error(
            `الكمية المطلوبة من المنتج "${product.name}" غير متوفرة. الكمية المتاحة في المخزن حالياً: ${product.inventory.quantity} فقط.`
          );
        }

        // Decrement stock quantity
        await tx.inventory.update({
          where: { productId },
          data: {
            quantity: {
              decrement: requestedQty
            }
          }
        });

        // Calculate item subtotal
        const productPrice = Number(product.price);
        computedTotalPrice += productPrice * requestedQty;

        // Collect order item creation info
        orderItemsData.push({
          productId,
          quantity: requestedQty,
          price: product.price // stores the price at the exact moment of order placement
        });
      }

      // Create the main Order with nested OrderItems
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice: computedTotalPrice,
          address,
          phone,
          notes: notes || null,
          status: 'pending',
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true }
              }
            }
          }
        }
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: "تم تسجيل طلبك بنجاح وجاري العمل على تأكيده.",
      order: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء معالجة الطلب.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2) GET /api/users/me/orders - View all orders placed by currently logged-in user
router.get('/users/me/orders', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "غير مصرح. يرجى تسجيل الدخول أولاً."
      });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب قائمة طلباتك السابقة.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});


// ==========================================
// MANAGEMENT ORDER ROUTES (Admin / Employee)
// ==========================================

// 1) GET /api/orders - Get all orders (Admin or Employee Only)
router.get('/orders', authMiddleware, employeeOnlyMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, barcode: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الطلبات للمراجعة الإدارية.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2) GET /api/orders/:id - Get specific order by ID (Available to author of order OR Admin/Employee)
router.get('/orders/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: "معرف الطلب غير صالح."
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, barcode: true }
            }
          }
        }
      }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "الطلب غير موجود."
      });
      return;
    }

    // Access control: Only Admin/Employee or the user who placed the order can view it
    if (order.userId !== userId && userRole !== 'admin' && userRole !== 'employee') {
      res.status(403).json({
        success: false,
        message: "غير مسموح لك بالاطلاع على تفاصيل هذا الطلب."
      });
      return;
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب تفاصيل الطلب.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 3) PUT /api/orders/:id/status - Update order status (Admin or Employee Only)
router.put('/orders/:id/status', authMiddleware, employeeOnlyMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: "معرف الطلب غير صالح."
      });
      return;
    }

    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `حالة الطلب غير صالحة. الحالات المسموحة: ${allowedStatuses.join(' | ')}`
      });
      return;
    }

    const orderExists = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!orderExists) {
      res.status(404).json({
        success: false,
        message: "الطلب غير موجود."
      });
      return;
    }

    // If order is cancelled, we might want to return products back to inventory!
    // Let's implement this elegant logic: If state is changing from non-cancelled to cancelled, we return quantities!
    // And if it is changing from cancelled back to active, we deduct quantities.
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Re-inventory if cancelled
      if (status === 'cancelled' && orderExists.status !== 'cancelled') {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId }
        });

        for (const item of orderItems) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }
      } 
      // Re-deduct inventory if moving out of cancelled state back to something active
      else if (orderExists.status === 'cancelled' && status !== 'cancelled') {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId }
        });

        for (const item of orderItems) {
          const productWithInv = await tx.product.findUnique({
            where: { id: item.productId },
            include: { inventory: true }
          });

          if (!productWithInv || !productWithInv.inventory || productWithInv.inventory.quantity < item.quantity) {
            throw new Error(`المنتج "${productWithInv?.name || item.productId}" لا يحتوي على كمية كافية في المخزن لإعادة تنشيط الطلب.`);
          }

          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              quantity: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      // Perform update
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: status as any
        },
        include: {
          items: true
        }
      });
    });

    res.status(200).json({
      success: true,
      message: `تم تحديث حالة الطلب رقم ${orderId} بنجاح إلى: ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث حالة الطلب.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
