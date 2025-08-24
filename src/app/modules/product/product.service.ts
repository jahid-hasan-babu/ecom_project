
import { OrderStatus, Product } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import { ICreateProduct } from "./product.interface";
import { fileUploader } from "../../middlewares/fileUploader";


const createProduct1 = async (
  payload: ICreateProduct,
  files: any,
  promoId?: string
) => {
  // ---------------- Product Images ----------------
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

  // ---------------- Variant Images ----------------
  const variantFiles = files?.variantImages || [];
  const variantsWithImages = await Promise.all(
    (payload.variants || []).map(async (variant, index) => {
      // Assign files to variant
      const assignedFiles = variantFiles[index] ? [variantFiles[index]] : [];

      // Upload all files for this variant
      const images = await Promise.all(
        assignedFiles.map(async (file: Express.Multer.File) => {
          const uploaded = await fileUploader.uploadToDigitalOcean(file);
          return { url: uploaded.Location, isPrimary: false };
        })
      );

      return { ...variant, images };
    })
  );

  // ---------------- Create Product ----------------
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


// Helper to split an array into N parts as evenly as possible
const splitImages = (images: Express.Multer.File[], parts: number): Express.Multer.File[][] => {
  const result: Express.Multer.File[][] = [];
  let start = 0;
  const total = images.length;

  for (let i = 0; i < parts; i++) {
    // Calculate remaining images and remaining slots
    const remainingImages = total - start;
    const remainingSlots = parts - i;
    const take = Math.ceil(remainingImages / remainingSlots);

    result.push(images.slice(start, start + take));
    start += take;
  }

  return result;
};

export const createProduct = async (
  payload: ICreateProduct,
  files: any,
  promoId?: string
) => {
  // ---------------- Product Images ----------------
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

  // ---------------- Variant Images ----------------
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

  // ---------------- Create Product ----------------
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







export const productService = {
 createProduct
};
