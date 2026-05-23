export type AppOption = {
    logoUrl?: string | null;
    id: string;
    providerId?: number;
    name: string;
    category: string;
    logoFileName?: string;
};

export const appOptions: AppOption[] = [
    { id: "netflix", providerId: 1, name: "Netflix", category: "الترفيه", logoFileName: "netflix-logo.png" },
    { id: "spotify", providerId: 2, name: "Spotify", category: "الترفيه", logoFileName: "spotify-logo.png" },
    { id: "youtube-premium", providerId: 3, name: "YouTube Premium", category: "الترفيه", logoFileName: "youtube-premium-logo.png" },
    { id: "canva", providerId: 4, name: "Canva", category: "العمل", logoFileName: "canva-pro-logo.png" },
    { id: "adobe-creative-cloud", providerId: 5, name: "Adobe Creative Cloud", category: "العمل", logoFileName: "adobe-creative-cloud-logo.png" },
    { id: "microsoft-365", providerId: 6, name: "Microsoft 365", category: "العمل", logoFileName: "microsoft-365-logo.png" },
    { id: "google-one", providerId: 7, name: "Google One", category: "أخرى", logoFileName: "google-one-logo.png" },
    { id: "dropbox", providerId: 8, name: "Dropbox", category: "العمل", logoFileName: "dropbox-logo.png" },
    { id: "notion", providerId: 9, name: "Notion", category: "العمل", logoFileName: "notion-plus-logo.png" },
    { id: "chatgpt", providerId: 10, name: "ChatGPT", category: "العمل", logoFileName: "chatgpt-logo.png" },
    { id: "shahid", providerId: 11, name: "Shahid", category: "الترفيه", logoFileName: "shahid-logo.png" },
    { id: "osn-plus", providerId: 12, name: "OSN+", category: "الترفيه", logoFileName: "osn-plus-logo.png" },
    { id: "starzplay", providerId: 13, name: "STARZPLAY", category: "الترفيه", logoFileName: "starzplay-logo.png" },
    { id: "amazon-prime", providerId: 14, name: "Amazon Prime", category: "الترفيه", logoFileName: "amazon-prime-logo.png" },

    { id: "apple-music", providerId: 15, name: "Apple Music", category: "الترفيه", logoFileName: "apple-music-logo.png" },
    { id: "disney-plus", providerId: 16, name: "Disney+", category: "الترفيه", logoFileName: "disney-plus-logo.png" },
    { id: "deezer", providerId: 17, name: "Deezer", category: "الترفيه", logoFileName: "deezer-logo.png" },
    { id: "crunchyroll", providerId: 18, name: "Crunchyroll", category: "الترفيه", logoFileName: "crunchyroll-logo.png" },
    { id: "twitch-turbo", providerId: 19, name: "Twitch Turbo", category: "الترفيه", logoFileName: "twitch-turbo-logo.png" },
    { id: "jahez", providerId: 20, name: "Jahez", category: "الترفيه", logoFileName: "jahez-logo.png" },
    { id: "hungerstation", providerId: 21, name: "HungerStation", category: "الترفيه", logoFileName: "hungerstation-logo.png" },
    { id: "stc-tv", providerId: 22, name: "STC TV", category: "الترفيه", logoFileName: "stc-tv-logo.png" },
    { id: "thmanyah", providerId: 23, name: "Thmanyah", category: "الترفيه", logoFileName: "thmanyah-logo.png" },

    { id: "slack", providerId: 24, name: "Slack", category: "العمل", logoFileName: "slack-logo.png" },
    { id: "zoom", providerId: 25, name: "Zoom", category: "العمل", logoFileName: "zoom-logo.png" },
    { id: "figma", providerId: 26, name: "Figma", category: "العمل", logoFileName: "figma-logo.png" },
    { id: "github-pro", providerId: 27, name: "GitHub Pro", category: "العمل", logoFileName: "github-pro-logo.png" },
    { id: "grammarly", providerId: 28, name: "Grammarly", category: "العمل", logoFileName: "grammarly-logo.png" },
    { id: "trello", providerId: 29, name: "Trello", category: "العمل", logoFileName: "trello-logo.png" },
    { id: "monday", providerId: 30, name: "Monday.com", category: "العمل", logoFileName: "monday-logo.png" },
    { id: "asana", providerId: 31, name: "Asana", category: "العمل", logoFileName: "asana-logo.png" },
    { id: "jira", providerId: 32, name: "Jira", category: "العمل", logoFileName: "jira-logo.png" },
    { id: "adobe-acrobat", providerId: 33, name: "Adobe Acrobat", category: "العمل", logoFileName: "adobe-acrobat-logo.png" },
    { id: "salla", providerId: 34, name: "Salla", category: "العمل", logoFileName: "salla-logo.png" },
    { id: "zid", providerId: 35, name: "Zid", category: "العمل", logoFileName: "zid-logo.png" },
    { id: "gemini", providerId: 36, name: "Gemini", category: "العمل", logoFileName: "gemini-logo.png" },
    { id: "claude", providerId: 37, name: "Claude", category: "العمل", logoFileName: "claude-logo.png" },

    { id: "udemy", providerId: 38, name: "Udemy", category: "التعليم", logoFileName: "udemy-logo.png" },
    { id: "linkedin-learning", providerId: 39, name: "LinkedIn Learning", category: "التعليم", logoFileName: "linkedin-learning-logo.png" },
    { id: "quizlet", providerId: 40, name: "Quizlet", category: "التعليم", logoFileName: "quizlet-logo.png" },

    { id: "calm", providerId: 41, name: "Calm", category: "الصحة", logoFileName: "calm-logo.png" },
    { id: "headspace", providerId: 42, name: "Headspace", category: "الصحة", logoFileName: "headspace-logo.png" },
    { id: "myfitnesspal", providerId: 43, name: "MyFitnessPal", category: "الصحة", logoFileName: "myfitnesspal-logo.png" },
    { id: "fitbit-premium", providerId: 44, name: "Fitbit Premium", category: "الصحة", logoFileName: "fitbit-premium-logo.png" },

    { id: "icloud-plus", providerId: 45, name: "iCloud+", category: "أخرى", logoFileName: "icloud-plus-logo.png" },
    { id: "ninja", providerId: 46, name: "Ninja", category: "أخرى", logoFileName: "ninja-logo.png" },

    { id: "other", name: "تطبيق آخر", category: "أخرى" },
];
