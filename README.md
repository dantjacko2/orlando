# Orlando: complete setup guide

This version includes:

- A shared schedule for both families
- Full-app access and in-app schedule editing with one universal PIN: `190526`
- Automatic live updates on every phone
- Automatic **Overlap** labels when both families have the same stated location in the same time slot
- No overlap generated from **Flexible time**
- A shared trip-photo gallery
- A separate food gallery with visual one-to-five-star ratings
- Uploading, viewing and downloading for anyone with the URL

## What the three services do

- **Supabase** stores the schedule, photographs, captions and ratings.
- **GitHub** stores the app's code.
- **Vercel** publishes the app and gives you the URL.

## Part 1: Create Supabase

1. Go to `https://supabase.com` and create a free account.
2. Select **New project**.
3. Name it `Orlando`.
4. Choose the Free plan and create a database password. Save the password somewhere safe.
5. Wait for the project to finish being created.
6. In the left menu, select **SQL Editor**.
7. Select **New query**.
8. On your computer, open `supabase-setup.sql` from this folder with Notepad or TextEdit.
9. Copy everything in that file and paste it into the Supabase SQL Editor.
10. Select **Run**. You should receive a success message.

The SQL file creates the schedule, shared galleries, storage rules, live updates, the access check and the hashed universal PIN. The PIN is not stored as readable text in the database.

## Part 2: Copy the Supabase connection details

1. In Supabase, open **Project Settings**, then **API Keys**, or use the **Connect** button.
2. Copy the **Project URL**. It looks like `https://something.supabase.co`.
3. Copy the **Publishable key**. It normally starts with `sb_publishable_`.
4. Keep both values in a temporary note.
5. Never use the secret key or service-role key in this app.

## Part 3: Upload the app to GitHub

1. Go to `https://github.com` and create a free account or sign in.
2. Select the plus sign, then **New repository**.
3. Name it `orlando` and set it to **Private**.
4. Do not add a README, licence or `.gitignore` on GitHub.
5. Select **Create repository**.
6. Select **uploading an existing file** or **Add file > Upload files**.
7. Open this `orlando-live-final` folder on your computer.
8. Select everything *inside* the folder and drag it onto GitHub. Do not upload the outer folder by itself.
9. Enter `Initial Orlando app` as the commit message.
10. Select **Commit changes**.

The repository front page should show `src`, `public`, `package.json`, `supabase-setup.sql` and `vercel.json`.

## Part 4: Publish with Vercel

1. Go to `https://vercel.com` and sign in with GitHub.
2. Select **Add New > Project**.
3. Find the private GitHub repository called `orlando` and select **Import**.
4. Vercel should identify the framework as **Vite**.
5. If Vercel asks for settings, use:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Expand **Environment Variables**.
7. Add this first variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: your Supabase Project URL
8. Add this second variable:
   - Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Value: your Supabase Publishable key
9. Select **Deploy**.
10. When deployment completes, select **Visit**.

## Part 5: Test it

1. Open the Vercel URL. The Orlando unlock screen should appear.
2. Enter the universal PIN `190526`.
3. Confirm that the schedule and galleries become visible.
4. Open **Plans** and select a date.
5. Tap the pencil beside either family's activity.
6. Change the location or details.
7. Enter the same universal PIN `190526` again.
8. Select **Save for everyone**.
9. Open the URL on another phone, enter `190526`, and confirm the change appears.
10. Test a normal photo upload under **Photos**.
11. Test a meal photo, restaurant, dish, review and star rating under **Food**.

A device remembers successful general access in its browser storage. Clearing Safari or browser website data will make the access screen appear again.

## Add it to an iPhone

1. Open the Vercel URL in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Keep the name `Orlando` and tap **Add**.

## Important privacy information

Anyone who has both the URL and universal PIN can enter the app, view the itinerary and galleries, and upload photographs. The same PIN is required again when editing either schedule. Do not post the URL or PIN publicly.


## Browser-only GitHub package

This package is deliberately flat. Upload every file directly to the top level of the GitHub repository. Do not create `src` or `public` folders.
