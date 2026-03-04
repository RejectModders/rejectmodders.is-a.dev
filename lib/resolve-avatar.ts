import { createHash } from "crypto"

/**
 * Wrap an external avatar URL through our caching proxy (/api/avatar?url=...).
 * This means browsers never hit GitHub/unavatar/etc. directly — only our edge
 * function does, and it caches the result for 24 h via Next.js Data Cache.
 *
 * Local paths (starting with /) are returned as-is.
 */
function proxied(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/")) return url // already a local asset
  return `/api/avatar?url=${encodeURIComponent(url)}`
}

/**
 * Extract a GitHub username from a GitHub URL or raw username string.
 */
function extractGithubUsername(github: string | null): string | null {
  if (!github) return null
  try {
    const url = new URL(github)
    if (url.hostname === "github.com") {
      const parts = url.pathname.split("/").filter(Boolean)
      return parts[0] ?? null
    }
  } catch {
    if (!github.includes("/") && !github.includes(".")) return github
  }
  return null
}

/**
 * Extract a Twitter/X username from a URL or raw handle.
 */
function extractTwitterUsername(twitter: string | null): string | null {
  if (!twitter) return null
  try {
    const url = new URL(twitter)
    if (url.hostname === "twitter.com" || url.hostname === "x.com") {
      const parts = url.pathname.split("/").filter(Boolean)
      return parts[0] ?? null
    }
  } catch {
    // raw username — strip leading @ if present
    const clean = twitter.startsWith("@") ? twitter.slice(1) : twitter
    if (!clean.includes("/") && !clean.includes(".")) return clean
  }
  return null
}

/**
 * Resolve a Twitter/X avatar via unavatar.io.
 * No API key needed — unavatar proxies public profile pictures.
 */
async function resolveTwitterAvatar(twitter: string | null): Promise<string | null> {
  const username = extractTwitterUsername(twitter)
  if (!username) return null
  const url = `https://unavatar.io/twitter/${username}?json`
  try {
    const res = await fetch(url, { next: { revalidate: 7200 } })
    if (res.ok) {
      const data = await res.json()
      // unavatar returns { url: "https://..." }
      if (data?.url && !data.url.includes("fallback")) return data.url
    }
  } catch {
    // silently fail
  }
  return null
}

/**
 * Resolve a YouTube channel avatar via YouTube Data API v3.
 * Requires YOUTUBE_API_KEY env var — skipped if not set.
 */
async function resolveYoutubeAvatar(youtube: string | null): Promise<string | null> {
  if (!youtube) return null
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  try {
    let identifier = youtube
    try {
      const url = new URL(youtube)
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts[0] === "channel" && parts[1]) {
        identifier = parts[1]
      } else if (parts[0]?.startsWith("@")) {
        identifier = parts[0]
      } else if ((parts[0] === "c" || parts[0] === "user") && parts[1]) {
        identifier = parts[1]
      } else if (parts[0]) {
        identifier = parts[0]
      }
    } catch {
      // raw handle/ID
    }

    const isChannelId = identifier.startsWith("UC") && identifier.length > 20
    let channelId: string | null = null

    if (isChannelId) {
      channelId = identifier
    } else {
      const handle = identifier.startsWith("@") ? identifier.slice(1) : identifier
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`,
        { next: { revalidate: 7200 } }
      )
      if (res.ok) {
        const data = await res.json()
        channelId = data?.items?.[0]?.id ?? null
        const thumb =
          data?.items?.[0]?.snippet?.thumbnails?.high?.url ??
          data?.items?.[0]?.snippet?.thumbnails?.default?.url
        if (thumb) return thumb
      }
    }

    if (channelId) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`,
        { next: { revalidate: 7200 } }
      )
      if (res.ok) {
        const data = await res.json()
        return (
          data?.items?.[0]?.snippet?.thumbnails?.high?.url ??
          data?.items?.[0]?.snippet?.thumbnails?.default?.url ??
          null
        )
      }
    }
  } catch {
    // silently fail
  }
  return null
}

/**
 * Check if a Gravatar exists for the given email.
 * Returns the avatar URL if a custom one exists, null otherwise.
 */
async function resolveGravatarAvatar(email: string | null): Promise<string | null> {
  if (!email) return null
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex")
  const checkUrl = `https://www.gravatar.com/avatar/${hash}?s=200&d=404`
  try {
    const res = await fetch(checkUrl, { method: "HEAD", next: { revalidate: 7200 } })
    if (res.ok) return `https://www.gravatar.com/avatar/${hash}?s=200`
  } catch {
    // silently fail
  }
  return null
}

/**
 * Build a GitHub avatar URL from a username.
 * Always works — no API key needed.
 */
function buildGithubAvatarUrl(username: string): string {
  return `https://github.com/${username}.png?size=200`
}

export interface FriendRaw {
  name: string
  isGF: boolean
  discord: string | null
  github: string | null
  twitter: string | null
  website: string | null
  youtube: string | null
  email: string | null
  /**
   * Custom avatar — set this to any direct image URL (imgur, Discord CDN,
   * a friend's personal site, etc.) and it will always be used as-is,
   * skipping all auto-resolution below.
   *
   * Examples:
   *   "https://i.imgur.com/abc123.png"
   *   "https://cdn.discordapp.com/avatars/123/abc.png"
   *   "https://example.com/my-photo.jpg"
   */
  avatar: string | null
}

export interface FriendResolved extends FriendRaw {
  resolvedAvatar: string | null
}

/**
 * Resolve the best available avatar for a friend.
 *
 * Priority order:
 * 1. Explicit `avatar` field  — any direct image URL, always wins
 * 2. GitHub                   — derived from github URL/username, no key needed
 * 3. Twitter/X                — via unavatar.io proxy, no key needed
 * 4. Gravatar                 — from email MD5, only if a custom one is set
 * 5. YouTube                  — channel thumbnail, requires YOUTUBE_API_KEY
 * 6. null                     — fallback icon shown in UI
 */
export async function resolveAvatar(friend: FriendRaw): Promise<string | null> {
  // 1. Custom avatar — always takes priority, no lookups needed
  // Local paths (e.g. /friends/amanda.png) are passed through as-is;
  // external URLs (e.g. an imgur link) are proxied through our cache.
  if (friend.avatar) return proxied(friend.avatar)

  // 2. GitHub — always available, no API key needed
  const githubUsername = extractGithubUsername(friend.github)
  if (githubUsername) return proxied(buildGithubAvatarUrl(githubUsername))

  // 3. Twitter/X — via unavatar.io, no API key needed
  const twitterAvatar = await resolveTwitterAvatar(friend.twitter)
  if (twitterAvatar) return proxied(twitterAvatar)

  // 4. Gravatar from email
  const gravatar = await resolveGravatarAvatar(friend.email)
  if (gravatar) return proxied(gravatar)

  // 5. YouTube (requires YOUTUBE_API_KEY in .env.local)
  const ytAvatar = await resolveYoutubeAvatar(friend.youtube)
  if (ytAvatar) return proxied(ytAvatar)

  return null
}

/**
 * Resolve avatars for all friends in parallel.
 */
export async function resolveAllAvatars(friends: FriendRaw[]): Promise<FriendResolved[]> {
  return Promise.all(
    friends.map(async (friend) => ({
      ...friend,
      resolvedAvatar: await resolveAvatar(friend),
    }))
  )
}
