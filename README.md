# The Vault — a repack-site-style catalog, minus the piracy

A dark, "release archive" styled catalog site. Every card = one item (cover
image, title, description, tags) with a **Download** button that redirects
straight out to wherever you actually host the file (SwiftUpload, Mega,
Gofile, your own server, whatever). This site never stores or serves the
actual files — it's just the front door.

You manage everything from a proper `/admin` panel with email+password
login — no code edits, no redeploying by hand.

## How it's built (and why)

You asked for static hosting (Netlify/Vercel/GitHub Pages) **and** a real
username+password-protected admin panel. Plain static hosting has no
server to check a password against, so this uses:

- **Frontend**: plain HTML/CSS/JS (`index.html`, `style.css`, `app.js`) —
  reads `items.json` and renders the grid. No framework, no build tooling
  required to view it.
- **Admin panel**: [Decap CMS](https://decapcms.org) (the actively
  maintained fork of the old Netlify CMS) — gives you the "add item, add
  image, add description, add link" form for free.
- **Login**: **Netlify Identity** — real email + password accounts, not
  just a hidden URL. Only people you invite can log in.
- **Storage**: entries are just JSON files committed straight to your Git
  repo (`content/items/*.json`), and uploaded cover images go into
  `assets/uploads/`. There's no database to run or pay for.
- **Publishing**: every time you save an item in `/admin`, Decap commits
  it to your repo. That commit triggers a Netlify rebuild, which runs
  `scripts/build-items.js` to regenerate `items.json`. Your live site
  updates automatically ~30–60 seconds later.

This means: **Netlify specifically** (not Vercel or GitHub Pages) — it's
the only one of the three with built-in Identity + Git Gateway, which is
what makes the login work without you running a backend.

## One-time setup

1. **Push this folder to a GitHub repo** (Decap needs a real Git repo to
   commit entries to).
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin <your-empty-github-repo-url>
   git push -u origin main
   ```

2. **Create a new Netlify site from that repo**
   - [app.netlify.com](https://app.netlify.com) → **Add new site → Import
     an existing project** → pick your GitHub repo.
   - Build command and publish directory are already set via
     `netlify.toml`, so you can leave those fields as-is.

3. **Turn on Identity**
   - In your new site: **Site configuration → Identity → Enable Identity**.
   - Under **Registration**, set it to **Invite only** (important —
     otherwise anyone can sign themselves up as an admin).

4. **Turn on Git Gateway**
   - Still in Identity settings → **Services → Git Gateway → Enable Git
     Gateway**. This is what lets logged-in Identity users save content
     without needing their own GitHub account.

5. **Invite yourself**
   - Identity tab → **Invite users** → enter your email.
   - You'll get an email with a link — it drops you on your homepage,
     which redirects you into `/admin` to set your password.

6. **Log in and start adding items**
   - Go to `https://your-site.netlify.app/admin`
   - Log in with the email/password you just set.
   - Click **New Item**, fill in Title, Cover Image, Description, and the
     Download Link (your SwiftUpload URL etc.), hit **Publish**.
   - Wait for the deploy to finish (Netlify's **Deploys** tab shows
     progress), then refresh your homepage — the new card is live.

## Customizing

- **Site name**: edit the two spots that say `THE VAULT` in `index.html`
  (and the `<title>`), and `THE VAULT` again in `admin/index.html`'s
  `<title>`.
- **Colors/fonts**: everything is driven by CSS variables at the top of
  `style.css` (`--bg`, `--accent`, `--font-display`, etc.) — change those
  and the whole site updates.
- **Remove the placeholder cards**: delete `content/items/sample-item-one.json`
  and `sample-item-two.json` (or just delete them from `/admin` once
  you're logged in — it's the same thing).
- **Extra fields** (e.g. file size, version number): add a field to
  `admin/config.yml` under `fields:`, then reference it in the
  `cardTemplate()` function in `app.js`.

## Local preview (optional)

You can preview the catalog layout locally without any of the Netlify
setup — the admin panel won't work locally, but the grid will:

```bash
node scripts/build-items.js   # regenerates items.json from content/items/
python3 -m http.server 8080   # or any static file server
# open http://localhost:8080
```

## Notes

- Nothing here ever handles or stores the actual downloadable files — the
  Download button is a plain link to whatever URL you paste in, so your
  Netlify bandwidth/storage stays effectively zero regardless of file
  sizes.
- Only people you explicitly invite via the Identity tab can log into
  `/admin` — there's no self-signup.
