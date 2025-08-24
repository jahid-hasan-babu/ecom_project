
import { OrderStatus, Product } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import { ICreateProduct } from "./product.interface";
import { fileUploader } from "../../middlewares/fileUploader";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import ApiError from "../../errors/ApiError";


const splitImages = (images: Express.Multer.File[], parts: number): Express.Multer.File[][] => {
  const result: Express.Multer.File[][] = [];
  let start = 0;
  const total = images.length;

  for (let i = 0; i < parts; i++) {
    const remainingImages = total - start;
    const remainingSlots = parts - i;
    const take = Math.ceil(remainingImages / remainingSlots);

    result.push(images.slice(start, start + take));
    start += take;
  }

  return result;
};

const createProduct = async (
  payload: ICreateProduct,
  files: any,
  promoId?: string
) => {
 
  const productImages = files?.productImage
    ? await Promise.all(
        (Array.isArray(files.productImage) ? files.productImage : [files.productImage]).map(
          async (file: Express.Multer.File) => {
            const uploaded = await fileUploader.uploadToDigitalOcean(file);
            return { url: uploaded.Location, isPrimary: false };
          }
        )
      )
    : [];


  const variantFiles = files?.variantImages || [];
  const splitVariantFiles = splitImages(variantFiles, payload.variants?.length || 0);

  const variantsWithImages = await Promise.all(
    (payload.variants || []).map(async (variant, index) => {
      const assignedFiles = splitVariantFiles[index] || [];

      const images = await Promise.all(
        assignedFiles.map(async (file: Express.Multer.File) => {
          const uploaded = await fileUploader.uploadToDigitalOcean(file);
          return { url: uploaded.Location, isPrimary: false };
        })
      );

      return { ...variant, images };
    })
  );


  const product = await prisma.product.create({
    data: {
      name: payload.name,
      description: payload.description ?? null,
      brandId: payload.brandId,
      categoryId: payload.categoryId,
      images: productImages.length > 0 ? { create: productImages } : undefined,
      variants: variantsWithImages.length > 0
        ? {
            create: variantsWithImages.map((variant) => ({
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock ?? 0,
              isActive: variant.isActive ?? true,
              attributes: variant.attributes?.length
                ? { create: variant.attributes.map((attr) => ({ key: attr.key, value: attr.value })) }
                : undefined,
              images: variant.images?.length ? { create: variant.images } : undefined,
            })),
          }
        : undefined,
      promoId: promoId ?? undefined,
    },
    include: {
      images: true,
      variants: { include: { images: true, attributes: true } },
      promo: true,
    },
  });

  return product;
};

const getAllProducts = async (
  options: IPaginationOptions & {
    search?: string;
    categoryName?: string;
    brandName?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    sortByPrice?: "asc" | "desc";
  }
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { search, categoryName, brandName, minPrice, maxPrice, sortByPrice } = options;

  const whereCondition: any = {};

  if (categoryName) {
    whereCondition.category = { name: { equals: categoryName, mode: "insensitive" } };
  }

  if (brandName) {
    whereCondition.brand = { name: { equals: brandName, mode: "insensitive" } };
  }

  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || undefined;

  if (min !== undefined || max !== undefined) {
    whereCondition.variants = {
      some: {
        price: {
          ...(min !== undefined ? { gte: min } : {}),
          ...(max !== undefined ? { lte: max } : {}),
        },
      },
    };
  }

  if (search) {
    whereCondition.name = { contains: search, mode: "insensitive" };
  }

  let products = await prisma.product.findMany({
    where: whereCondition,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: { select: { url: true, isPrimary: true } },
      variants: { select: { price: true, sku: true } },
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  if (sortByPrice === "asc") {
    products.sort(
      (a, b) =>
        Math.min(...a.variants.map((v) => v.price)) -
        Math.min(...b.variants.map((v) => v.price))
    );
  } else if (sortByPrice === "desc") {
    products.sort(
      (a, b) =>
        Math.max(...b.variants.map((v) => v.price)) -
        Math.max(...a.variants.map((v) => v.price))
    );
  }

  const totalProducts = products.length;
  products = products.slice(skip, skip + limit);

  return {
    meta: {
      page,
      limit,
      total: totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
    },
    data: products,
  };
};



const getSingleProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true, 
      variants: {
        include: {
          images: true, 
          attributes: true, 
        },
      },
      brand: true, 
      category: true, 
      promo: true,
    },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  return product; 
};



const toggleProductActive = async (productId: string) => {

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { isActive: true },
  });

  if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Product not found");


  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
    select: {
      id: true,
      isActive: true,
    }
  });

  return updatedProduct;
};


const updateProductInfo = async (
  productId: string,
  payload: { name?: string; description?: string },
  files?: { productImage?: Express.Multer.File | Express.Multer.File[] },
  promoId?: string,
) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true, promo: true }, 
  });

  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  let productImages: { url: string; isPrimary: boolean }[] = [];


  if (files?.productImage) {
    const imagesArray = Array.isArray(files.productImage)
      ? files.productImage
      : [files.productImage];

    productImages = await Promise.all(
      imagesArray.map(async (file) => {
        const uploaded = await fileUploader.uploadToDigitalOcean(file);
        return { url: uploaded.Location, isPrimary: false };
      })
    );
  }


  let promoUpdate = {};
  if (promoId) {
    promoUpdate = {
      promo: {
        connect: { id: promoId }, 
      },
    };
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      name: payload.name ?? existingProduct.name,
      description: payload.description ?? existingProduct.description,
      images: productImages.length
        ? {
            create: productImages,
          }
        : undefined,
      ...promoUpdate,
    },
    include: {
      images: true,
      promo: true,
    },
  });

  return updatedProduct;
};


const updateVariantInfo = async (
  variantId: string,
  productId: string,
  payload: { price?: number; stock?: number; isActive?: boolean }
) => {
  const existingVariant = await prisma.variant.findFirst({
    where: {
      id: variantId,
      productId: productId,
    }
  })
  if (!existingVariant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Variant not found");
  }
  const updatedVariant = await prisma.variant.update({
    where: { id: variantId },
    data: {
      price: payload.price,
      stock: payload.stock,
      isActive: payload.isActive,
    },
    include: {
      images: true,
      attributes: true,
    },
  });

  return updatedVariant;
};



export const productService = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  toggleProductActive,
  updateProductInfo,
  updateVariantInfo
};
