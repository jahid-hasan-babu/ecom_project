import { Request } from "express";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import { OrderStatus } from "@prisma/client";



const createOrderService = async (
  token: string,
  payload: {
    cartId: string;
    name?: string;
    phone?: string;
    address?: string;
    usePromo?: boolean;
  }
) => {
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide your guest token");
  }
  const { cartId, name, phone, address, usePromo } = payload;

  if (!cartId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "cartId is required");
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { promo: true }, 
              },
              images: true,
            },
          },
        },
      },
      promo: true, 
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart is empty or not found");
  }

  let total = 0;


  for (const item of cart.items) {
    let price = item.variant.price;

    if (usePromo && item.variant.product.promo) {
      const promo = item.variant.product.promo;
      if (promo.type === "PERCENT") {
        price = price - Math.floor((price * promo.value) / 100);
      } else if (promo.type === "FIXED") {
        price = price - promo.value;
      }

      await prisma.promo.update({
        where: { id: promo.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    total += item.quantity * (price > 0 ? price : 0);
  }


  if (usePromo && cart.promo) {
    if (cart.promo.type === "PERCENT") {
      total = total - Math.floor((total * cart.promo.value) / 100);
    } else if (cart.promo.type === "FIXED") {
      total = total - cart.promo.value;
    }

    await prisma.promo.update({
      where: { id: cart.promoId! },
      data: { usageCount: { increment: 1 } },
    });
  }

   await prisma.order.create({
    data: {
      userId: cart.userId || cart.token,
      cartId: cart.id,
      promoId: usePromo ? cart.promoId : null, 
      total: total > 0 ? total : 0,
      status: "PENDING",
      name,
      phone,
      address,
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant.price, 
        })),
      },
    },
    
  });

  return;
};

const getAllOrdersService = async (options: IPaginationOptions) => {
  const { skip, page, limit } = paginationHelper.calculatePagination(options);

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      include: {
        items: {
          select: {
            quantity: true,
            price: true,
            variant: {
              select: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count(),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: orders.map(order => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      user: order.user,
      items: order.items.map(item => ({
        quantity: item.quantity,
        price: item.price,
        productName: item.variant.product.name,
      })),
    })),
  };
};

const updateOrderStatusService = async (
  orderId: string,
  newStatus: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

 
  if (order.status === newStatus) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Order is already ${newStatus}`
    );
  }


  if (newStatus === "ACCEPTED") {
    if (order.status !== "PENDING") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Only pending orders can be accepted"
      );
    }

    for (const item of order.items) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant) {
        throw new ApiError(httpStatus.NOT_FOUND, "Variant not found");
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Insufficient stock for variant ${variant.id}`
        );
      }
    }

  
    const updateStockPromises = order.items.map((item) =>
      prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    );
    await Promise.all(updateStockPromises);
  }



await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus as  OrderStatus},
    include: { items: true },
  });

  return ;
};

const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        select: {
          quantity: true,
          price: true,
          variant: {
            select: {
              product: { select: { name: true } },
              images: { select: { url: true, isPrimary: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(order => ({
    id: order.id,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    name: order.name,
    phone: order.phone,
    address: order.address,
    items: order.items.map(item => ({
      quantity: item.quantity,
      price: item.price,
      productName: item.variant.product.name,
      images: item.variant.images.map(img => ({ url: img.url, isPrimary: img.isPrimary })),
    })),
  }));
};


export const checkoutService = {
  createOrderService,
  getAllOrdersService,
  updateOrderStatusService,
  getMyOrders
};
