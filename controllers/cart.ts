import * as zod from "zod";
// PRO: Ramda is a really cool library, but could probably
// use the reduce function from the array standard library.
import { partition, reduce } from "ramda";
import {
  RequestMethod,
  ResponseStatus,
  buildEndpointRegister,
} from "../common/requests";

// PRO: Usage of typescript
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
  // PRO: Usage of validations!
  validator: zod.object({
    cart: zod.object({
      reference: zod.string(),
      lineItems: zod
        .object({
          name: zod.string(),
          // CON: I would probably also validate for negative prices. If a malicious user
          // sends a cart with negative value items, the final price could be zero or even negative.
          price: zod.coerce.number(),
          collection: zod.string(),
        })
        .array(),
    }),
  }),
  handler: (data) => {
    const items = data.cart.lineItems;

    // PRO: Great strategy! breaking the problem into two "parts".
    const [withDiscount, withoutDiscount] = partition(
      isDiscountableItem,
      items
    );

    const discount = getDiscountPercentage(withDiscount.length);

    // This is more like a personal preference, but I think it would easier to read
    // if you calculate the total by summing responseData.items -> finalPrice. Just
    // to make it very explicit that the total is just a sum of all items in the cart.
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
      // CON: Improve the precision of the total value. On e-commerce we usually
      // work with decimal values, but here the API return values like 12.2199999999999999
      // instead of 12.22 or 12.21.
      total,
    };

    return {
      status: ResponseStatus.Success,
      resource: responseData,
    };
  },
});
