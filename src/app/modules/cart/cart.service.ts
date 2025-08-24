import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { ObjectId } from "bson";
import prisma from "../../lib/prisma";


const generateGuestToken = () => new ObjectId().toString();


export const getOrCreateCart = async (token?: string, userId?: string) => {
  if (!token) token = generateGuestToken();

  let cart = await prisma.cart.findUnique({
    where: { token },
    include: {
      items: {
        include: {
          variant: {
            include: {
              images: true, 
              product: true, 
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { token, userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                images: true,
                product: true,
              },
            },
          },
        },
      },
    });
  } else if (userId && !cart.userId) {
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                images: true,
                product: true,
              },
            },
          },
        },
      },
    });
  }

  return cart;
};;

const addItemToCart = async (
  variantId: string,
  quantity: number,
  token?: string,
  userId?: string
) => {
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) throw new ApiError(httpStatus.NOT_FOUND, "Variant not found");

  const cart = await getOrCreateCart(token, userId);


  const existingItem = cart.items.find(item => item.variantId === variantId);

  if (existingItem) {
    const updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { variant: true },
    });

    return { cart, token: cart.token, updatedItem };
  }


  const newItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId,
      quantity,
    },
    include: { variant: true },
  });

  return { cart, token: cart.token, newItem };
};


const updateCartItem = async (cartItemId: string, quantity: number) => {
  const existingCartItem = await prisma.cartItem.findFirst({
     where: {id: cartItemId}
  })
  
  if (!existingCartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Item not found");
  }
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
  return;
};


const removeCartItem = async (cartItemId: string) => {
  const existingCartItem = await prisma.cartItem.findFirst({
     where: {id: cartItemId}
  })
  
  if (!existingCartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Item not found");
  }
  return prisma.cartItem.delete({ where: { id: cartItemId } });
};


export const applyPromoToCart = async (token: string, promoCode: string) => {
  const cart = await getOrCreateCart(token);

  const promo = await prisma.promo.findUnique({ where: { code: promoCode } });
  if (!promo) throw new Error("Invalid promo code");

  return prisma.cart.update({
    where: { id: cart.id },
    data: { promoId: promo.id },
    include: { items: true, promo: true },
  });
};






export const CartServices = {
  addItemToCart,
  getOrCreateCart,
  updateCartItem,
  removeCartItem
};
