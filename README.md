# Comic Marketplace 🛒

A Next.js application allowing users to browse comic samples, request custom comics by uploading images, and simulate a checkout process. Includes an admin panel for managing custom orders.

## 📘 Project Overview

Comic Marketplace is a web application where users can explore a gallery of predefined comic book samples or request a unique, customized comic. Users can upload their own images and add notes for customization requests. The app features a shopping cart, a simulated checkout process, and a user profile section to view past orders. An admin panel allows administrators to view and manage the status of custom comic orders.

**Key Features:**

-   Browse and view details of sample comic products.
-   Submit a request for a custom comic, including image upload and notes.
-   Shopping cart functionality for both sample and custom items.
-   Simulated checkout and order placement.
-   User authentication (login/register) with mock token persistence.
-   "My Orders" page for authenticated users to view their order history.
-   Admin panel (`/admin/orders`) to view and manage the status of custom orders (accessible only to admin users).
-   Responsive design optimized for various screen sizes.

## 🧰 Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (using App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: [SQLite](https://www.sqlite.org/index.html)
-   **State Management**: React Context API (`useAuth`, `useCart`)
-   **Data Fetching**: React Query (`@tanstack/react-query`) for client-side fetching, API Routes for backend logic.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Requirements

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd comic-marketplace
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

### Database Setup & Seeding

1.  **Generate Prisma Client:** Prisma Client is usually generated automatically after `npm install` (due to the `postinstall` script), but you can run it manually if needed:
    ```bash
    npx prisma generate
    ```

2.  **Apply Migrations:** This will create the SQLite database file (`data/database.sqlite`) and apply the schema.
    ```bash
    npx prisma migrate dev --name init
    ```
    *(You might be prompted to reset the database if it already exists)*

3.  **Seed the database:** This script populates the database with initial sample users, products, and an example order.
    ```bash
    npx prisma db seed
    ```
    *(Requires `tsx` to run, which should be in devDependencies)*

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
# or
# yarn dev
```

The application will typically be available at [http://localhost:9002](http://localhost:9002) (or another port if 9002 is busy).

## 🌐 API Routes

The application uses Next.js API Routes (under `/app/api/`) to simulate a backend:

-   `/api/products`:
    -   `GET`: Fetches all available comic products.
-   `/api/products/[id]`:
    -   `GET`: Fetches details for a specific product by its ID.
-   `/api/orders`:
    -   `GET`: Fetches orders (can be filtered by `userId` or `custom=true`).
    -   `POST`: Creates a new order.
-   `/api/orders/[orderId]/status`:
    -   `PATCH`: Updates the status of a specific order.
-   `/api/auth/login`:
    -   `POST`: Handles user login (validates against DB, returns mock token).
-   `/api/auth/register`:
    -   `POST`: Handles user registration (creates user in DB, returns mock token).
-   `/api/upload`:
    -   `POST`: Simulates image upload and returns a placeholder image URL.

These routes interact with the SQLite database via Prisma.

## 👨‍💻 Local Development Notes

-   The development server runs on port `9002` by default (configurable in `package.json`).
-   Authentication uses a mock token stored in `localStorage`. Passwords are currently stored in plain text in the database (for development purposes only).
-   Admin access is determined by the `isAdmin` flag on the `User` model.

## ✅ Authentication

-   Basic email/password authentication is implemented.
-   Login and Registration forms are available.
-   Successful authentication stores a mock token and user info in `localStorage`.
-   The `useAuth` hook provides global access to the user's authentication state.
-   Passwords are **not hashed** in this development version.

## 🗃️ Prisma & Database

-   Prisma is used as the ORM to interact with the SQLite database.
-   The database schema is defined in `prisma/schema.prisma`.
-   The SQLite database file is located at `data/database.sqlite`. Make sure the `data` directory exists or Prisma can create it.
-   Migrations are managed using `npx prisma migrate dev`.

## 📷 Image Upload

-   The `/api/upload` endpoint currently **mocks** the image upload process.
-   It simulates a delay and returns a placeholder image URL from `picsum.photos`.
-   A real storage solution (like Firebase Storage, Cloudinary, or S3) would be needed for a production environment.

## 🧪 Mock Mode

To simulate API data without requiring a real database, you can enable **Mock Mode**:

1. Open the `.env` file
2. Add or edit the following line:
   ```env
   USE_MOCK=true
   ```
3. Restart the development server (`npm run dev`).

When `USE_MOCK=true`, the API routes (`/api/auth/login`, `/api/orders`, etc.) will use hardcoded mock data from `src/lib/mockUsers.ts` and `src/lib/mockOrders.ts` instead of interacting with the Prisma database.

**Mock User Credentials:**
- **Admin:** `admin.mock@comichub.com` / `password`
- **Regular User:** `test.mock@example.com` / `password`

This is useful for frontend development or testing without needing the database running. To switch back to using the real database, set `USE_MOCK=false` or remove the line from `.env`.


## 🧪 Prisma Studio

You can use Prisma Studio to visually browse and manage the data in your SQLite database:

```bash
npx prisma studio
```

This will open a web interface, usually at `http://localhost:5555`.

## 📦 Deployment

*(Placeholder - Add deployment instructions here when applicable)*

Instructions for deploying this Next.js application to platforms like Vercel, Netlify, or others would go here. Considerations for database hosting and environment variables would also be included.

