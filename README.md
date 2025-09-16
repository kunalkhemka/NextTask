# NextTask

NextTask is a modern project management tool built with Next.js, Prisma, and Clerk for authentication. It enables teams to organize work by organizations, projects, sprints, and issues, supporting efficient collaboration and tracking.

## Features

- Organization-based project management
- Sprint planning and tracking
- Issue tracking with priorities and statuses
- User authentication and role-based access (admin, member)
- Drag-and-drop issue ordering
- Responsive UI using Radix UI and Tailwind CSS

## Tech Stack

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Clerk](https://clerk.com/) (authentication)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-org/NextTask.git
    cd NextTask
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Copy `.env.local.example` to `.env.local` and fill in your environment variables.

4. Set up the database:
    ```sh
    npx prisma migrate dev
    ```

5. Start the development server:
    ```sh
    npm run dev
    ```

## Folder Structure

- `app/` – Next.js app directory
- `components/` – Reusable React components
- `actions/` – Server actions and business logic
- `lib/` – Utility functions and helpers
- `prisma/` – Prisma schema and migrations
- `public/` – Static assets


Working app can be accessed at: https://next-task-tuo1.vercel.app/