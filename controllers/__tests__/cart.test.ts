import { buildEndpointRegister } from "../../common/requests";
import { Item, calculateCartController } from "../cart";

describe("#calculateCartController", () => {
  const { originalHandler: handler } = calculateCartController;

  it("provides expected result from provided challenge data", () => {
    const { resource } = handler({
      cart: {
        reference: "2d832fe0-6c96-4515-9be7-4c00983539c1",
        lineItems: [
          { name: "Peanut Butter", price: 39.0, collection: "BEST-SELLERS" },
          { name: "Banana Cake", price: 34.99, collection: "DEFAULT" },
          { name: "Cocoa", price: 34.99, collection: "KETO" },
          { name: "Fruity", price: 32, collection: "DEFAULT" },
        ],
      },
    });

    expect(resource).toEqual({
      total: 130.381,
      items: [
        { name: "Cocoa", price: 34.99, collection: "KETO", finalPrice: 34.99 },
        {
          name: "Peanut Butter",
          price: 39.0,
          collection: "BEST-SELLERS",
          finalPrice: 35.1,
        },
        {
          name: "Banana Cake",
          price: 34.99,
          collection: "DEFAULT",
          finalPrice: 31.49,
        },
        { name: "Fruity", price: 32, collection: "DEFAULT", finalPrice: 28.8 },
      ],
    });
  });

  const builMockData = (items: Item[]) => ({
    cart: {
      reference: "2d832fe0-6c96-4515-9be7-4c00983539c1",
      lineItems: items,
    },
  });

  it("doesn't give discount to KETO Collection", () => {
    const { resource } = handler(
      builMockData([
        { name: "Cocoa 1", price: 10, collection: "KETO" },
        { name: "Cocoa 2", price: 10, collection: "KETO" },
        { name: "Cocoa 3", price: 10, collection: "KETO" },
        { name: "Cocoa 4", price: 10, collection: "KETO" },
      ])
    );

    expect(resource).toEqual({
      total: 40,
      items: [
        { name: "Cocoa 1", price: 10, collection: "KETO", finalPrice: 10 },
        { name: "Cocoa 2", price: 10, collection: "KETO", finalPrice: 10 },
        { name: "Cocoa 3", price: 10, collection: "KETO", finalPrice: 10 },
        { name: "Cocoa 4", price: 10, collection: "KETO", finalPrice: 10 },
      ],
    });
  });

  describe("gives discount to non special items", () => {
    const items = [
      { name: "Test Keto", price: 10, collection: "KETO", finalPrice: 10 },
      {
        name: "Test Normal 1",
        price: 10,
        collection: "DEFAULT",
        finalPrice: 10,
      },
      {
        name: "Test Normal 2",
        price: 10,
        collection: "DEFAULT",
        finalPrice: 10,
      },
      {
        name: "Test Normal 3",
        price: 10,
        collection: "DEFAULT",
        finalPrice: 10,
      },
      {
        name: "Test Normal 4",
        price: 10,
        collection: "DEFAULT",
        finalPrice: 10,
      },
      {
        name: "Test Normal 5",
        price: 10,
        collection: "DEFAULT",
        finalPrice: 10,
      },
    ];

    it("doesn't discount if one or less items", () => {
      const { resource } = handler(builMockData(items.slice(0, 2)));

      expect(resource).toEqual({
        total: 20,
        items: [
          { name: "Test Keto", price: 10, collection: "KETO", finalPrice: 10 },
          {
            name: "Test Normal 1",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 10,
          },
        ],
      });
    });
    it("discounts 5% if 2 items", () => {
      const { resource } = handler(builMockData(items.slice(0, 3)));

      expect(resource).toEqual({
        total: 29,
        items: [
          { name: "Test Keto", price: 10, collection: "KETO", finalPrice: 10 },
          {
            name: "Test Normal 1",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 9.5,
          },
          {
            name: "Test Normal 2",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 9.5,
          },
        ],
      });
    });
    it("discounts 10% if 3 items", () => {
      const { resource } = handler(builMockData(items.slice(0, 4)));

      expect(resource).toEqual({
        total: 37,
        items: [
          { name: "Test Keto", price: 10, collection: "KETO", finalPrice: 10 },
          {
            name: "Test Normal 1",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 9,
          },
          {
            name: "Test Normal 2",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 9,
          },
          {
            name: "Test Normal 3",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 9,
          },
        ],
      });
    });

    it("discounts 20% if 4 items", () => {
      const { resource } = handler(builMockData(items.slice(0, 5)));

      expect(resource).toEqual({
        total: 42,
        items: [
          { name: "Test Keto", price: 10, collection: "KETO", finalPrice: 10 },
          {
            name: "Test Normal 1",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 8,
          },
          {
            name: "Test Normal 2",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 8,
          },
          {
            name: "Test Normal 3",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 8,
          },
          {
            name: "Test Normal 4",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 8,
          },
        ],
      });
    });

    it("discounts 24% if 5 or more items", () => {
      const { resource } = handler(builMockData(items));

      expect(resource).toEqual({
        total: 47.5,
        items: [
          { name: "Test Keto", price: 10, collection: "KETO", finalPrice: 10 },
          {
            name: "Test Normal 1",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 7.5,
          },
          {
            name: "Test Normal 2",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 7.5,
          },
          {
            name: "Test Normal 3",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 7.5,
          },
          {
            name: "Test Normal 4",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 7.5,
          },
          {
            name: "Test Normal 5",
            price: 10,
            collection: "DEFAULT",
            finalPrice: 7.5,
          },
        ],
      });
    });
  });
});
