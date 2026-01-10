# Google Sheet Setup - Column Headers

Your Google Sheet needs these EXACT column headers in Row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | createdAt | status | customerName | customerPhone | customerAddress | total | items |

## Example Data (Row 2):
| id | createdAt | status | customerName | customerPhone | customerAddress | total | items |
|---|---|---|---|---|---|---|---|
| 1735891234567 | 2026-01-03T10:30:00.000Z | pending | João Silva | 11999999999 | Rua ABC, 123 | 45.50 | [{"id":1,"name":"Pizza","quantity":2,"price":22.75}] |

## Important Notes:
- The `items` column will contain JSON data
- The `total` column is a number
- The `status` can be: pending, accepted, delivered
- All headers must be in the first row (Row 1)
- No spaces before or after the header names
- No spaces before or after the header names

# Sheet: Restaurants
Columns:
id, slug, name, password, isOpen, image, banner, approved, phone, address, deliveryTime, instagram, zipCode, hours, responsibleName, email, whatsapp, pixKey, type, ratingSum, ratingCount
