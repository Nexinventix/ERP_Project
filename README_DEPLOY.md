# Deploying ERP_Project to Render and Vercel

## Render
1. Push your code to GitHub.
2. Go to https://dashboard.render.com/ and create a new Web Service.
3. Connect your GitHub repo, set build command to `npm run build` (if using TypeScript) and start command to `npm start`.
4. Add environment variables from `.env.example` in the Render dashboard.
5. Deploy and monitor logs for errors.

## Vercel
1. Push your code to GitHub.
2. Go to https://vercel.com/ and create a new Project.
3. Import your repo, let Vercel detect your settings, or use the provided `vercel.json`.
4. Set environment variables in the Vercel dashboard.
5. Deploy and monitor for errors.

## Notes
- Make sure your MongoDB and other services are accessible from the cloud.
- For Vercel, the entry point is set to `src/server.ts` in `vercel.json`. Adjust if your main file differs.
- Both platforms redeploy on git push.

## Railway
1. Push your code to GitHub.
2. Go to https://railway.app/ and sign in.
3. Click "New Project" and select "Deploy from GitHub repo".
4. Choose your repo and follow the prompts.
5. Set environment variables in Railway using values from `.env.example`.
6. Click "Deploy" and monitor build logs for errors.
7. Your app will be live at the Railway-provided URL.

### Notes
- Ensure your database and services are accessible from Railway.
- Railway redeploys on git push.
- For custom build/start commands, set them in the Railway dashboard (e.g., `npm run build` and `npm start`).
URL - erpproject-production-8c62.up.railway.app
---
For further help, see the official docs:
- [Render Node Guide](https://render.com/docs/deploy-node-express-app)
- [Vercel Node Guide](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [Railway Node Guide](https://docs.railway.app/deploy/quickstart)
