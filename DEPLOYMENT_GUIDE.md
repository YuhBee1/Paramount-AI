# Paramount AI: Easy Deployment Guide for Vercel

**What this guide does:** It walks you through putting Paramount AI online using GitHub and Vercel. You do not need to be a software developer to follow it. Every unfamiliar word is explained when it first appears.

**Repository:** [YuhBee1/Paramount-AI](https://github.com/YuhBee1/Paramount-AI)
**Website host:** Vercel
**Database:** A MySQL-compatible database
**Important:** Never paste real passwords or private keys into GitHub, this guide, screenshots, or support messages.

## The short version

There are four services involved:

1. **GitHub** stores the Paramount AI source code.
2. **Vercel** turns that source code into a live website and automatically updates it when you push changes.
3. **The database** stores users, projects, conversations, jobs, credits, and settings.
4. **Manus services and storage** provide login, AI responses, image generation, and file storage.

You will connect these services by entering settings called **environment variables**. An environment variable is simply a named setting, such as `DATABASE_URL`, whose value is kept outside the code. Passwords and API keys belong there.

## Before you begin

Have these things ready:

- A GitHub account that can open [YuhBee1/Paramount-AI](https://github.com/YuhBee1/Paramount-AI).
- A Vercel account.
- A production database with a MySQL-compatible connection address.
- Your Manus OAuth login details.
- Your Manus Forge API address and server-side API key.
- A production domain name, if you want a custom address instead of a Vercel address.
- A password manager. This is where you should keep passwords and API keys.

If you do not have one of these items, stop at that step. Do not invent a value or use a random example from the internet.

## Part 1: Connect GitHub to Vercel

### Step 1: Open Vercel

Go to [vercel.com](https://vercel.com) and sign in. Choose **Add New… → Project**.

### Step 2: Choose the GitHub repository

Choose **Import Git Repository**, connect GitHub if Vercel asks for permission, and select:

```text
YuhBee1/Paramount-AI
```

If you cannot see the repository, Vercel's GitHub connection does not have access to it. Reconnect GitHub from Vercel's account or team settings, then try again.

### Step 3: Choose the project settings

Use these values when Vercel shows the setup screen:

| Vercel field | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | `.` (the repository root) |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm build` |
| Output Directory | `dist/public` |
| Production Branch | `main` |

The repository already contains `vercel.json`, so Vercel may fill in some of these values automatically. If a dashboard value conflicts with the file, use the values above.

Do not add a custom Start Command. Vercel serves the website files and runs the API through the included Function file. A **Function** is a small server program that Vercel starts when someone calls the API.

Do not click Deploy yet if you have not added the environment variables below. The first deployment will fail if the application cannot find its database or login settings.

## Part 2: Add the settings and keys

In the Vercel project, open **Settings → Environment Variables**. Add each setting one at a time. For the first working deployment, select **Production** for each required value.

A setting has three parts:

- **Name:** the exact name in the first column below.
- **Value:** the value supplied by your service provider.
- **Environment:** choose Production. Add Preview later when you create a test environment.

### Required settings

| Name | What it means | Where its value comes from |
|---|---|---|
| `DATABASE_URL` | The address and password for the production database | Your database provider |
| `JWT_SECRET` | The private key used to keep people signed in | Generate a long random value and store it in your password manager |
| `VITE_APP_ID` | Your Manus login application ID | Manus OAuth application settings |
| `OAUTH_SERVER_URL` | The address of the Manus login service | Manus OAuth settings |
| `VITE_OAUTH_PORTAL_URL` | The page where users begin signing in | Manus OAuth settings |
| `OWNER_OPEN_ID` | Your Manus owner identifier | Your Manus account or project configuration |
| `BUILT_IN_FORGE_API_URL` | The address of the Manus AI service | Manus Forge configuration |
| `BUILT_IN_FORGE_API_KEY` | The private server key for AI and image requests | Manus Forge configuration |

### Recommended settings

| Name | What it means |
|---|---|
| `OWNER_NAME` | The name displayed for the owner account |
| `VITE_APP_TITLE` | The title shown in the browser tab |
| `VITE_APP_LOGO` | The logo setting, if you have one configured |
| `VITE_ANALYTICS_ENDPOINT` | Analytics service address, if analytics is approved |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID, if analytics is approved |

### Settings you should treat carefully

Names beginning with `VITE_` can be included in the browser website bundle. That means a visitor may be able to see them. Do not put a powerful private key in a `VITE_` setting.

`BUILT_IN_FORGE_API_KEY`, `DATABASE_URL`, and `JWT_SECRET` are private. They must stay server-side. Never copy them into `VITE_FRONTEND_FORGE_API_KEY` or any other browser-facing setting.

`VITE_FRONTEND_FORGE_API_URL` and `VITE_FRONTEND_FORGE_API_KEY` are optional. Leave them empty unless a specific browser feature requires them. Prefer server-side requests whenever possible.

### How to create `JWT_SECRET`

If you do not already have a secure secret, use your password manager's password generator. Choose a long random value, preferably at least 32 characters. Do not use a person's name, a sentence, or a password that is used anywhere else.

Changing `JWT_SECRET` later signs everyone out. That is normal, but plan it as a maintenance action.

## Part 3: Prepare the database

The database is where the application remembers things. Without it, users, projects, conversations, and settings disappear or cannot be created.

### Step 1: Create a production database

Create a MySQL-compatible database with your chosen provider. Create a separate database for testing if possible. Do not use a personal laptop database for the live website.

Ask the database provider for a connection string. It normally looks similar to this, but your provider will give you the real value:

```text
mysql://username:password@hostname:3306/database_name
```

The example above is only a shape. Do not enter it as-is.

### Step 2: Back it up

Turn on automatic backups. Before the first live migration, confirm that the provider can restore a backup into a separate test database. A backup is only useful if you know how to restore it.

### Step 3: Apply the Paramount AI tables

A **migration** is a carefully recorded database change. The repository contains migrations that create the Paramount AI tables.

For a first setup, an administrator or developer should run these commands from a copy of the repository:

```bash
pnpm install --frozen-lockfile
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Run them with the production `DATABASE_URL` available to that terminal. Never send the database password in a chat message. If the migration reports a problem, stop and ask for help before deleting or changing tables.

Do not run migrations from a website request. Do not place `pnpm drizzle-kit migrate` inside the Vercel Function. It should run once as a controlled release task.

## Part 4: Configure login

In the Manus OAuth settings, add the production callback address required by the project. Use your final HTTPS domain. Do not use an old preview URL for the permanent login setup.

Before launching, confirm:

- The application ID matches `VITE_APP_ID`.
- The OAuth server address matches `OAUTH_SERVER_URL`.
- The login portal matches `VITE_OAUTH_PORTAL_URL`.
- The owner identifier matches `OWNER_OPEN_ID`.
- The callback address uses HTTPS.
- The callback address points to the Paramount AI production domain.

If login sends you to the wrong site, check these values first. Do not change cookies or code until the OAuth values have been checked.

## Part 5: Deploy the first version

After the required settings are saved, go back to **Deployments** in Vercel and choose **Redeploy**, or push a new commit to the `main` branch.

Vercel will:

1. Download the code from GitHub.
2. Install the packages.
3. Build the website.
4. Publish the browser files from `dist/public`.
5. Make the API Function available under `/api`.

Wait for the deployment to show **Ready**. Open the deployment URL. You should see the Paramount AI landing page.

If Vercel reports a failed build, open the build log and look at the first error. Later errors are often consequences of the first one.

## Part 6: Add your domain

If you have a custom domain, open **Settings → Domains** in Vercel and add it. Vercel will show the DNS records you need to add at your domain provider.

Wait until Vercel confirms the domain is connected and HTTPS is active. Then update your Manus OAuth callback settings to use that final domain.

Test the domain in a private browser window. Confirm that:

- The address begins with `https://`.
- The landing page loads.
- Login starts from the correct domain.
- Login returns to the correct domain.
- Signing out works.

## Part 7: Test the important features

Use this checklist after the first successful deployment:

- [ ] The home page opens.
- [ ] A new user can sign in.
- [ ] The owner can sign out and sign in again.
- [ ] The owner can create a project.
- [ ] A conversation can be started.
- [ ] A short AI request works when the Forge key is active.
- [ ] Image generation works when the image service is active.
- [ ] A small file can be uploaded.
- [ ] The file is still available after refreshing the page.
- [ ] An API key can be created and revoked.
- [ ] The usage page opens.
- [ ] A dataset can be registered and its consent status changed.
- [ ] A normal user cannot open administrator controls.
- [ ] Database records remain after a new Vercel deployment.

Test with a small file and a short AI prompt first. Do not begin with a large upload or an expensive request.

## Part 8: Preview versus Production

Vercel normally creates a **Preview** deployment for branches other than `main` and a **Production** deployment from `main`.

Use different databases and AI keys for Preview and Production whenever possible. This prevents testing from changing live customer data or spending production credits.

In Vercel's Environment Variables screen, select the correct environment when adding a value:

- **Production:** the live website from `main`.
- **Preview:** test deployments from other branches or pull requests.
- **Development:** local development values.

Do not put the Production database URL into Preview unless you deliberately accept that risk.

## Part 9: Changing keys later

Changing a key means replacing an old password or API key with a new one. Use this safe order:

1. Create the new key at the service that issued the old key.
2. Save the new value in Vercel under the same environment variable name.
3. Redeploy the Vercel project. Old deployments keep their old environment values.
4. Test login, database access, AI, image generation, storage, or whichever service uses the key.
5. Revoke the old key only after the new deployment works.
6. Write down the date of the change in your private operations record.

### Special cases

- Changing `BUILT_IN_FORGE_API_KEY` can stop AI and image requests until the new deployment is live.
- Changing `DATABASE_URL` can make the website use a different set of data. Check it three times before saving.
- Changing `JWT_SECRET` signs out all current users.
- Changing OAuth values can prevent every user from logging in.
- Changing a `VITE_` value requires a new build because it is included in the website files.

## Part 10: Updating the website

For a normal update:

1. Make the change in a new GitHub branch.
2. Open a pull request into `main`.
3. Let Vercel create a Preview deployment.
4. Test the Preview URL.
5. Merge the pull request only after the Preview works.
6. Vercel automatically deploys the new `main` commit to Production.

Before merging a code change, the project should pass:

```bash
pnpm check
pnpm test
pnpm build
```

The current project also uses Drizzle migrations. If a change modifies the database, review the generated SQL, back up the database, apply the migration once, and then deploy the code that uses it.

## Part 11: Going back after a bad update

Vercel keeps previous deployments. If the newest release is broken, open the previous working deployment and choose the Vercel option to promote or redeploy it to Production.

This is safe for code problems when the database structure has not changed. If a migration has already changed the database, ask an administrator before restoring anything. A code rollback does not automatically undo a database change.

Never force-push over `main` as a first response. Keep the history so the cause can be found.

## Part 12: Common problems

### “I cannot see the GitHub repository in Vercel.”

Reconnect GitHub in Vercel and grant access to `YuhBee1/Paramount-AI`. For a personal GitHub repository, your Vercel account must be the repository owner or have the required connection permission.

### “The Vercel build failed.”

Open the build log. Check the first error. Confirm the Install Command is `pnpm install --frozen-lockfile`, the Build Command is `pnpm build`, and the Output Directory is `dist/public`.

### “The page is blank or a route gives 404.”

Confirm that the deployment contains `vercel.json` and that its Output Directory is `dist/public`. The file also contains the rule that sends browser routes such as `/app` back to the single-page application.

### “The website opens, but login fails.”

Check the four OAuth values and the callback URL. Confirm that the callback uses your current HTTPS domain, not an old Vercel preview address.

### “AI or image generation fails.”

Check `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` in the Vercel environment used by the deployment. Confirm that the key is active and that the request is small enough to finish within the Function time limit.

### “The database is empty.”

Check `DATABASE_URL`. Then confirm that the Drizzle migrations were applied to that exact database. A correct migration against the wrong database does not help the live website.

### “My new key did not change anything.”

Vercel applies environment-variable changes to new deployments. Redeploy after changing a value. A deployment that was already running will not automatically receive the new value.

### “Uploads or generated files disappear.”

Files must live in the configured object storage. The Vercel Function filesystem is temporary. Check the storage configuration and confirm that the database contains the object reference.

### “A long AI task stops.”

Vercel Functions are request-based and have time limits. Long tasks need a queue and a separate worker service. Do not try to keep a request open forever.

## Part 13: What is not ready to turn on yet

The current release is a strong platform foundation, but these items need separate production work before being advertised as complete:

- A secure isolated code-execution worker.
- Durable distributed queues for long-running work.
- Full audio, music, and video provider adapters.
- Payment collection and webhook reconciliation.
- Multi-factor authentication and device management.
- Full document retrieval and indexing.
- A distributed rate limiter for multiple Function instances.
- A complete backup restoration drill.

Keeping these items disabled is safer than presenting a screen that looks complete but does not yet have its security and operational controls.

## Final checklist

Only call the deployment complete when all of these are true:

- [ ] GitHub is connected to the Vercel project.
- [ ] The Production Branch is `main`.
- [ ] The Vercel build settings match this guide.
- [ ] All required Production environment variables are entered.
- [ ] No real secrets are committed to GitHub.
- [ ] The database exists and migrations are applied.
- [ ] Database backups are enabled.
- [ ] OAuth uses the final HTTPS domain.
- [ ] The home page loads.
- [ ] Sign-in and sign-out work.
- [ ] Project creation works.
- [ ] AI and image requests work, if their keys are enabled.
- [ ] A small upload works.
- [ ] API-key creation and revocation work.
- [ ] Administrator controls reject normal users.
- [ ] Preview uses safe test settings.
- [ ] A rollback deployment has been identified.
- [ ] Someone is responsible for future key rotations and backups.

## Official references

[1]: https://vercel.com/docs/git/vercel-for-github "Deploying GitHub Projects with Vercel"

[2]: https://vercel.com/docs/project-configuration/vercel-json "Vercel project configuration"

[3]: https://vercel.com/docs/environment-variables "Vercel environment variables"

[4]: https://orm.drizzle.team/docs/kit-overview "Drizzle Kit documentation"
