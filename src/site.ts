// Site-wide settings that change now and then.
export const site = {
  // Keeps search engines out while the site is unfinished. Set to false at launch.
  noindex: true,

  email: 'holyhellstudio.games@gmail.com',
  social: [
    { label: 'X', url: 'https://x.com/HolyHellStudio' },
    { label: 'Threads', url: 'https://www.threads.com/@holyhellstudio' },
  ],

  // When the Steam page is live, put its URL here and the wishlist button appears on the home page.
  steamUrl: null as string | null,

  // Paste the analytics snippet's script URL and site id here when there is one (GoatCounter, Plausible, etc.).
  analytics: null as { src: string; attrs?: Record<string, string> } | null,
};
