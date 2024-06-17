# Cereal Shopping Calculator
Coding challenge from Superfiliate. [Challenge prompt](https://github.com/Superfiliate/hiring/blob/main/the-cereal-offer.md)

Authored by @luiz-cesar

Project contains server and API logic. Core business logic is present at `controllers/cart.ts`

## Setup
Download npm and node. Run `npm install` from root directory.

## Running
Run `npm start` from the root directory. Use [postman](https://www.postman.com/) or some other HTTP tool to send a GET request to `localhost:8080/cart` with a JSON body following this pattern
```json
{
  "cart": {
    "reference": "2d832fe0-6c96-4515-9be7-4c00983539c1",
    "lineItems": [
      { "name": "Peanut Butter", "price": "39.0", "collection": "BEST-SELLERS" },
      { "name": "Banana Cake", "price": "34.99", "collection": "DEFAULT" },
      { "name": "Cocoa", "price": "34.99", "collection": "KETO" },
      { "name": "Fruity", "price": "32", "collection": "DEFAULT" }
    ]
  }
}
```

You should see a result like this in the response body
```json
{
    "items": [
        {
            "name": "Cocoa",
            "price": 34.99,
            "collection": "KETO",
            "finalPrice": 34.99
        },
        {
            "name": "Peanut Butter",
            "price": 39,
            "collection": "BEST-SELLERS",
            "finalPrice": 35.1
        },
        {
            "name": "Banana Cake",
            "price": 34.99,
            "collection": "DEFAULT",
            "finalPrice": 31.49
        },
        {
            "name": "Fruity",
            "price": 32,
            "collection": "DEFAULT",
            "finalPrice": 28.8
        }
    ],
    "total": 130.381
}
```

## Running tests
Run `npm test` from the root directory. A test case with the same data from the section above was added.
