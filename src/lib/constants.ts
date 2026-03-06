export const TYPE_COLORS = {
  string: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700' },
  number: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
  boolean: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' },
  null: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' },
  object: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-300 dark:border-violet-700' },
  array: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-700' },
} as const

export const MAX_UNDO_STACK = 100

export const CODE_DEBOUNCE_MS = 300

export const SAMPLE_JSON = `{
  "company": {
    "name": "Northwind Traders",
    "founded": 2018,
    "public": false,
    "website": "https://northwind.example.com",
    "headquarters": {
      "city": "Portland",
      "state": "OR",
      "country": "US",
      "zip": "97201"
    },
    "socialMedia": {
      "twitter": "@northwind",
      "linkedin": "northwind-traders",
      "github": "northwind-dev"
    }
  },
  "employees": [
    {
      "id": 1,
      "name": "Alice Chen",
      "email": "alice@northwind.example.com",
      "role": "Engineering Lead",
      "department": "Engineering",
      "salary": 145000,
      "active": true,
      "startDate": "2019-03-15",
      "skills": ["TypeScript", "React", "Node.js", "PostgreSQL"],
      "address": {
        "street": "742 Evergreen Terrace",
        "city": "Portland",
        "zip": "97201"
      }
    },
    {
      "id": 2,
      "name": "Bob Martinez",
      "email": "bob@northwind.example.com",
      "role": "Product Designer",
      "department": "Design",
      "salary": 125000,
      "active": true,
      "startDate": "2020-07-01",
      "skills": ["Figma", "CSS", "User Research"],
      "address": {
        "street": "31 Spooner St",
        "city": "Portland",
        "zip": "97205"
      }
    },
    {
      "id": 3,
      "name": "Carol Nguyen",
      "email": "carol@northwind.example.com",
      "role": "Backend Developer",
      "department": "Engineering",
      "salary": 135000,
      "active": true,
      "startDate": "2021-01-10",
      "skills": ["Go", "Kubernetes", "gRPC", "Redis"],
      "address": {
        "street": "123 Main St",
        "city": "Beaverton",
        "zip": "97005"
      }
    },
    {
      "id": 4,
      "name": "David Park",
      "email": "david@northwind.example.com",
      "role": "QA Engineer",
      "department": "Engineering",
      "salary": 110000,
      "active": false,
      "startDate": "2020-11-20",
      "skills": ["Cypress", "Playwright", "Python"],
      "address": {
        "street": "456 Oak Ave",
        "city": "Lake Oswego",
        "zip": "97034"
      }
    },
    {
      "id": 5,
      "name": "Eva Schmidt",
      "email": "eva@northwind.example.com",
      "role": "DevOps Engineer",
      "department": "Infrastructure",
      "salary": 140000,
      "active": true,
      "startDate": "2022-04-18",
      "skills": ["AWS", "Terraform", "Docker", "CI/CD"],
      "address": {
        "street": "789 Pine Rd",
        "city": "Portland",
        "zip": "97210"
      }
    }
  ],
  "products": [
    {
      "sku": "NW-1001",
      "name": "Chai Tea",
      "category": "Beverages",
      "price": 18.00,
      "inStock": true,
      "quantity": 39,
      "supplier": "Exotic Liquids",
      "tags": ["organic", "fair-trade", "popular"]
    },
    {
      "sku": "NW-1002",
      "name": "Chang",
      "category": "Beverages",
      "price": 19.00,
      "inStock": true,
      "quantity": 17,
      "supplier": "Exotic Liquids",
      "tags": ["imported"]
    },
    {
      "sku": "NW-2001",
      "name": "Aniseed Syrup",
      "category": "Condiments",
      "price": 10.00,
      "inStock": true,
      "quantity": 13,
      "supplier": "Exotic Liquids",
      "tags": ["organic"]
    },
    {
      "sku": "NW-3001",
      "name": "Mishi Kobe Niku",
      "category": "Meat",
      "price": 97.00,
      "inStock": false,
      "quantity": 0,
      "supplier": "Tokyo Traders",
      "tags": ["premium", "imported"]
    },
    {
      "sku": "NW-4001",
      "name": "Gorgonzola Telino",
      "category": "Dairy",
      "price": 12.50,
      "inStock": true,
      "quantity": 65,
      "supplier": "Formaggi Fortini",
      "tags": ["italian", "popular"]
    },
    {
      "sku": "NW-4002",
      "name": "Mascarpone Fabioli",
      "category": "Dairy",
      "price": 32.00,
      "inStock": true,
      "quantity": 9,
      "supplier": "Formaggi Fortini",
      "tags": ["italian", "premium"]
    }
  ],
  "orders": [
    {
      "orderId": "ORD-5001",
      "customer": "Maria Anders",
      "date": "2025-01-15",
      "status": "delivered",
      "total": 440.00,
      "items": [
        { "sku": "NW-1001", "qty": 10, "unitPrice": 18.00 },
        { "sku": "NW-3001", "qty": 2, "unitPrice": 97.00 },
        { "sku": "NW-4001", "qty": 5, "unitPrice": 12.50 }
      ],
      "shippingAddress": {
        "street": "Obere Str. 57",
        "city": "Berlin",
        "country": "Germany"
      }
    },
    {
      "orderId": "ORD-5002",
      "customer": "Thomas Hardy",
      "date": "2025-02-03",
      "status": "shipped",
      "total": 236.00,
      "items": [
        { "sku": "NW-1002", "qty": 4, "unitPrice": 19.00 },
        { "sku": "NW-4002", "qty": 5, "unitPrice": 32.00 }
      ],
      "shippingAddress": {
        "street": "120 Hanover Sq",
        "city": "London",
        "country": "UK"
      }
    },
    {
      "orderId": "ORD-5003",
      "customer": "Christina Berglund",
      "date": "2025-02-28",
      "status": "processing",
      "total": 130.00,
      "items": [
        { "sku": "NW-2001", "qty": 13, "unitPrice": 10.00 }
      ],
      "shippingAddress": {
        "street": "Berguvsvägen 8",
        "city": "Luleå",
        "country": "Sweden"
      }
    }
  ],
  "config": {
    "api": {
      "baseUrl": "https://api.northwind.example.com/v2",
      "timeout": 30000,
      "retries": 3,
      "rateLimit": 100
    },
    "features": {
      "darkMode": true,
      "notifications": true,
      "analytics": false,
      "betaFeatures": false
    },
    "cache": {
      "enabled": true,
      "ttlSeconds": 3600,
      "maxItems": 500,
      "strategy": "lru"
    },
    "logging": {
      "level": "info",
      "format": "json",
      "destination": "stdout"
    }
  },
  "stats": {
    "totalRevenue": 806.00,
    "totalOrders": 3,
    "avgOrderValue": 268.67,
    "topCategory": "Dairy",
    "lastUpdated": "2025-03-01T12:00:00Z"
  },
  "tags": ["demo", "sample", "northwind"],
  "deprecated": null
}`

export type DataFormat = 'json' | 'yaml'
