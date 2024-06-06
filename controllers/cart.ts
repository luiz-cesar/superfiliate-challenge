import * as zod from "zod";
import { partition, reduce } from "ramda";
import {
  RequestMethod,
  ResponseStatus,
  buildEndpointRegister,
} from "../common/requests";

export type Item = {
  name: string;
  price: number;
  collection: string;
};

const NOT_DISCOUNTABLE_COLLECTIONS = ["KETO"];

const getDiscountPercentage = (numItems: number) => {
  if (numItems <= 1) return 1;
  if (numItems === 2) return 0.95;
  if (numItems === 3) return 0.9;
  if (numItems === 4) return 0.8;
  return 0.75;
};

const sumPrices = reduce<Item, number>((acc, { price }) => acc + price, 0);

const isDiscountableItem = (item: Item) =>
  !NOT_DISCOUNTABLE_COLLECTIONS.includes(item.collection);

export const calculateCartController = buildEndpointRegister({
  method: RequestMethod.GET,
  path: "/cart",
  validator: zod.object({
    cart: zod.object({
      reference: zod.string(),
      lineItems: zod
        .object({
          name: zod.string(),
          price: zod.coerce.number(),
          collection: zod.string(),
        })
        .array(),
    }),
  }),
  handler: (data) => {
    const items = data.cart.lineItems;

    const [withDiscount, withoutDiscount] = partition(
      isDiscountableItem,
      items
    );

    const discount = getDiscountPercentage(withDiscount.length);

    const total =
      sumPrices(withoutDiscount) + sumPrices(withDiscount) * discount;

    const responseData = {
      items: [
        ...withoutDiscount.map((item) => ({
          ...item,
          finalPrice: item.price,
        })),
        ...withDiscount.map((item) => ({
          ...item,
          finalPrice: Math.round(item.price * discount * 1e2) / 1e2,
        })),
      ],
      total,
    };

    return {
      status: ResponseStatus.Success,
      resource: responseData,
    };
  },
});
