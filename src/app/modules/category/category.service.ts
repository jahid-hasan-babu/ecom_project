import { Request } from "express";
import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import toSnakeCase from "../../utils/toSnakeCase";


type TCategory = {
  name: string;
};
const createCategoryIntoDb = async (req: Request) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const payload = req.body as TCategory;
    const createLink = toSnakeCase(payload.name);
    const isCategoryExist = await prisma.category.findUnique({
      where: {
        slug: createLink,
      },
      select: {
        id: true,
      },
    });
    if (isCategoryExist) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Category already exist");
    }


    const data = {
      name: payload.name,
      slug: createLink,
    };

    const result = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
    return result;
  });

  return transaction;
};


const getCategoryListFromDb = async (req: Request) => {
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

  const result = await prisma.category.findMany({
    where: {...where, isDeleted: false},
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
  const totalCategory = await prisma.category.count({
    where: where,
  });

  return {
    meta: {
      total: totalCategory,
      page: numberPage,
      limit: numberLimit,
      pages: Math.ceil(totalCategory / numberLimit),
    },
    data: result,
  };
};

const getByIdFromDb = async (id: string) => {
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Category id is required");
  }
  const result = await prisma.category.findUnique({ where: { id } });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return result;
};

const updateIntoDb = async (req: Request) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const id = req.params.id;
    const bodyData = req.body as any;
    const createLink = toSnakeCase(bodyData.name);

    if (!id) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Category id is required");
    }

    

    const data = {
      name: bodyData.name,
      slug: createLink,
    };

    const result = await prisma.category.update({
      where: { id },
      data: {
        ...(bodyData.name && { name: data.name }),
        ...(bodyData.slug && { slug: data.slug }),
      },
    });
    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {

  const existingCategory = await prisma.category.findUnique({
    where: {id : id, isDeleted: false},
  });
  if(!existingCategory){
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  const result = await prisma.category.update({
    where: {id: id},
    data:{ isDeleted: true }
  })

  return result;
};


export const CategoryService = {
  createCategoryIntoDb,
  getCategoryListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
