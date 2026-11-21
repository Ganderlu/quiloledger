This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin console

The protected admin workspace is available at `/admin`. It reads registered profiles and contact messages from Firestore, verifies account status through Firebase Authentication, and supports disabling or re-enabling accounts and resolving inbox messages.

Before using it, configure these server-only variables in `.env.local` and in your production host:

- `FIREBASE_PROJECT_ID`: Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: service account client email.
- `FIREBASE_PRIVATE_KEY`: service account private key. Keep the escaped `\n` characters if the key is stored on one line.
- `ADMIN_EMAILS`: comma-separated list of verified Firebase account emails permitted to use the console.

Create a Firebase service account in the Firebase/GCP console and grant only the project permissions the admin API needs (Firebase Authentication user management and Firestore data access). Never use a `NEXT_PUBLIC_` prefix for these credentials or commit `.env.local`. Restart the development server after adding the values. Admin requests are checked on the server; Firebase Admin credentials bypass Firestore security rules and must be kept private.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
