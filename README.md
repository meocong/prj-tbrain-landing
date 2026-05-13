## Created by AlphaTechSolutions Company.

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## How to deploy:
1. Access to production server (related to server information, please ask Mr. Nhat)
2. Access to working screen:
```bash
screen -r client
```
3. Pull the latest source code:
```bash
git pull
```
4. Build the NextJS project:
```bash
npm run build
```
5. Restart pm2:
```bash
pm2 restart 1
```



