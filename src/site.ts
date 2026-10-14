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

  // The demo build on the Play page: the most recent upload in Lost Faith > Build on Drive (go by upload date,
  // not the file name). It must be shared as "Anyone with the link"; the id is in its share link
  // (drive.google.com/file/d/<id>/view).
  // Set to null to hide the Download page's button and the home page link.
  build: {
    version: '0.3.0',
    date: '2026-10-11',
    size: '152 MB',
    driveId: '1iNzLXglbYP7VoyV64h8jbgCzq-03lfAy',
  } as { version: string; date: string; size: string; driveId: string } | null,

  // Demo feedback forms (the "send" link from Google Forms). The Chinese form is shared by sc and tc.
  feedback: {
    en: 'https://docs.google.com/forms/d/e/1FAIpQLSc9mk18YixdKNtU4wzZ6vPNHg6TsroPpavHIrUKsfpCJNv72Q/viewform',
    zh: 'https://docs.google.com/forms/d/e/1FAIpQLSdnEmutk6jStLP5xew2GaEt2m_Rn7vgdtbb1HOKMvYjLjoUTw/viewform',
  },

  // Paste the analytics snippet's script URL and site id here when there is one (GoatCounter, Plausible, etc.).
  analytics: null as { src: string; attrs?: Record<string, string> } | null,
};
