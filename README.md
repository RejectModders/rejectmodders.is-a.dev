# rejectmodders.dev

My personal site. Built with Next.js, Tailwind CSS, and TypeScript.

---

## Adding yourself to the friends list

Think you belong on this page? If we actually know each other, open a pull request and add yourself. Here's exactly how.

### 1. Fork & clone

```bash
git clone https://github.com/<your-username>/rejectmodders.dev.git
cd rejectmodders.dev
```

### 2. Install dependencies

```bash
npm install
```

### 3. Edit `data/friends.json`

Add a new object to the array. All fields except `name` and `isGF` are optional — just set anything you don't have to `null`.

```jsonc
{
  "name": "Your Name",        // required — whatever you go by
  "isGF": false,              // always false unless you're Amanda
  "discord": "123456789",     // user ID  or  full URL
  "github": "your-username",  // username or  full URL
  "twitter": "your-handle",   // handle   or  full URL
  "website": "https://...",   // full URL
  "youtube": "your-handle",   // handle   or  full URL
  "email": "you@example.com", // plain address
  "avatar": null              // see below
}
```

#### Avatar — auto-resolution

You don't need to set an avatar at all. If `"avatar"` is `null`, the site automatically tries to find one in this order:

| Priority | Source | What's needed |
|---|---|---|
| 1 | **Explicit `avatar` field** | Any direct image URL — always wins if set |
| 2 | **GitHub** | Fill in `"github"` — pulls `github.com/<username>.png`, no API key |
| 3 | **Twitter / X** | Fill in `"twitter"` — fetched via unavatar.io, no API key |
| 4 | **Gravatar** | Fill in `"email"` — only resolves if you have a custom Gravatar set up |
| 5 | **YouTube** | Fill in `"youtube"` — requires a `YOUTUBE_API_KEY` env var on the server |
| 6 | Fallback icon | Shown if nothing above resolves |

So in most cases just filling in `"github"` is enough and you're done. If you'd rather use something custom:

- **Local image** — drop the file in `public/friends/yourname.png` (`.jpg` / `.gif` also work) and set `"avatar": "/friends/yourname.png"`
- **Remote URL** — set `"avatar": "https://..."` directly and it'll be used as-is, no lookups happen

### 4. Run locally to double-check

```bash
npm run dev
```

Open [http://localhost:3000/friends](http://localhost:3000/friends) and make sure your card looks right.

### 5. Open the PR

Commit your changes and push to your fork, then open a pull request against `main` on this repo.

```bash
git checkout -b add-yourname
git add data/friends.json public/friends/   # include any image you added
git commit -m "friends: add YourName"
git push origin add-yourname
```

Then head to [github.com/RejectModders/rejectmodders.dev](https://github.com/RejectModders/rejectmodders.dev) and open a PR from your fork.

---

## Tech stack

| Thing | What |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) |
| Animations | [Framer Motion](https://framer.com/motion) |
| Deployment | [Vercel](https://vercel.com) |

