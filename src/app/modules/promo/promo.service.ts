import { Request } from "express";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import { PromoType } from "@prisma/client";
interface IUpdatePromoPayload {
  code?: string;
  type?: PromoType;
  value?: number;
  validFrom?: Date;
  validTo?: Date;
  maxUsage?: number;
}


const createPromo = async (payload: {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  validFrom: Date;
  validTo: Date;
  maxUsage?: number;
}) => {
  const promo = await prisma.promo.create({
    data: payload,
  });

  return promo;
};

const getAllPromos = async (
  options: IPaginationOptions & { search?: string }
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { search } = options;

  const where: any = {};
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { type: { equals: search as any } },
    ];
  }

  const [promos, total] = await Promise.all([
    prisma.promo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.promo.count({ where }),
  ]);

 

  return {
    meta: { 
      page,
      limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
    data: promos,
  };
};

const getSinglePromo = async (promoId: string) => {
  const existingPromo = await prisma.promo.findUnique({
    where: {id: promoId}
  })
  if (!existingPromo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promo not found");
  };
  const result = await prisma.promo.findUnique({ where: { id: promoId } });

  return result;
}


const updatePromo = async (
  promoId: string,
  payload: IUpdatePromoPayload
) => {
  const existingPromo = await prisma.promo.findUnique({
    where: { id: promoId },
  });

  if (!existingPromo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promo not found");
  }

  const updatedPromo = await prisma.promo.update({
    where: { id: promoId },
    data: {
      code: payload.code ?? existingPromo.code,
      type: payload.type ?? existingPromo.type,
      value: payload.value ?? existingPromo.value,
      validFrom: payload.validFrom ?? existingPromo.validFrom,
      validTo: payload.validTo ?? existingPromo.validTo,
      maxUsage: payload.maxUsage ?? existingPromo.maxUsage,
    },
  });

  return updatedPromo;
};


const applyPromoToProduct = async (productId: string, promoId: string) => {
  const promo = await prisma.promo.findUnique({
    where: { id: promoId },
    include: {
      products: { select: { id: true } },
    },
  });

  if (!promo) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promo not found");
  }


  if (promo.maxUsage !== null && promo.usageCount >= promo.maxUsage) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Promo usage limit reached");
  }


  const isPromoApplied = promo.products.some((p) => p.id === productId);
  if (!isPromoApplied) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Promo not valid for this product");
  }


  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }


  const variantsWithPromo = product.variants.map((variant) => {
    let newPrice = variant.price;

    if (promo.type === "PERCENT") {
      newPrice = variant.price - (variant.price * promo.value) / 100;
    } else if (promo.type === "FIXED") {
      newPrice = Math.max(0, variant.price - promo.value); 
    }

    return {
      ...variant,
      previousPrice: variant.price,
      newPrice,
    };
  });

  // 6. Return product + all variants with promo prices
  return {
    ...product,
    variants: variantsWithPromo,
    appliedPromo: {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      maxUsage: promo.maxUsage,
      usageCount: promo.usageCount,
    },
  };
};





export const promoService = {
  createPromo,
  getAllPromos,
  getSinglePromo,
  updatePromo,
  applyPromoToProduct
};
