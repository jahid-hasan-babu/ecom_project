import { Request } from "express";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import toSnakeCase from "../../utils/toSnakeCase";
import ApiError from "../../errors/ApiError";


type TBrand = {
  name: string;
};
const createBrandIntoDb = async (req: Request) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const payload = req.body as TBrand;
    const createLink = toSnakeCase(payload.name);

    const isBrandExist = await prisma.brand.findUnique({
      where: {
        slug: createLink,
      },
      select: {
        id: true,
      },
    });
    if (isBrandExist) {
      throw new ApiError(httpStatus.ALREADY_REPORTED, "Brand already exist");
    }

    const data = {
      name: payload.name,
      slug: createLink,
    };

    const result = await prisma.brand.create({
      data: data,
    });
    return result;
  });

  return transaction;
};


const getBrandListFromDb = async (req: Request) => {
  const { searchTerm, limit, page } = req.query;
  const numberLimit = Number(limit) || 10;
  const numberPage = Number(page) || 1;
  const skip = (numberPage - 1) * numberLimit || 0;

  const whereConditions: any = [];
  if (searchTerm) {
    whereConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  const result = await prisma.brand.findMany({
    where: where,
    select: {
      id: true,
      name: true,
    },
    skip: skip,
    take: numberLimit,
    orderBy: {
      createdAt: "desc",
    },
  });
  const totalBrand = await prisma.brand.count({
    where: where,
  });

  return {
    meta: {
      total: totalBrand,
      page: numberPage,
      limit: numberLimit,
      pages: Math.ceil(totalBrand / numberLimit),
    },
    data: result,
  };
};

const getByIdFromDb = async (id: string) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Brand id is required");
  }
  const result = await prisma.brand.findUnique({ where: { id } });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
  }
  return result;
};

const updateIntoDb = async (req: Request) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const id = req.params.id;
    const bodyData = req.body as any;
    const createLink = toSnakeCase(bodyData.name);

    if (!id) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Brand id is required");
    }
    const isBrandExist = await prisma.brand.findUnique({
      where: {
        id
      }
    });
    if (!isBrandExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Brand not found!")
    }

    const result = await prisma.brand.update({
      where: { id },
      data: {
        ...(bodyData.name && { name: bodyData.name, slug: createLink }),
        ...(bodyData.location && { location: bodyData.location }),
      },
    });

    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const existingBrand = await prisma.brand.findUnique({
    where: {
      id: id,
      isDeleted: false
    }
  });
  if(!existingBrand){
    throw new ApiError(httpStatus.NOT_FOUND, "Brand not found");
  }

   const result = await prisma.brand.update({ where: { id }, data:{ isDeleted:true} });
   return result;
 
};

export const brandService = {
  createBrandIntoDb,
  getBrandListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
