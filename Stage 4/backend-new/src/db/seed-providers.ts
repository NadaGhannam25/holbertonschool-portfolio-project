import 'dotenv/config';
import { db } from './index';
import { subscriptionProviders } from './schema';

const providers = [
  {
    name: 'Netflix',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/netflix.com',
    websiteUrl: 'https://www.netflix.com',
    cancelUrl: 'https://www.netflix.com/cancelplan',
    isPopular: true,
  },
  {
    name: 'Spotify',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/spotify.com',
    websiteUrl: 'https://www.spotify.com',
    cancelUrl: 'https://www.spotify.com/account/subscription',
    isPopular: true,
  },
  {
    name: 'YouTube Premium',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/youtube.com',
    websiteUrl: 'https://www.youtube.com/premium',
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    isPopular: true,
  },
  {
    name: 'Canva',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/canva.com',
    websiteUrl: 'https://www.canva.com',
    cancelUrl: 'https://www.canva.com/settings/billing-and-plans',
    isPopular: true,
  },
  {
    name: 'Adobe Creative Cloud',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/adobe.com',
    websiteUrl: 'https://www.adobe.com/creativecloud.html',
    cancelUrl: 'https://account.adobe.com/plans',
    isPopular: true,
  },
  {
    name: 'Microsoft 365',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    websiteUrl: 'https://www.microsoft.com/microsoft-365',
    cancelUrl: 'https://account.microsoft.com/services',
    isPopular: true,
  },
  {
    name: 'Google One',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/google.com',
    websiteUrl: 'https://one.google.com',
    cancelUrl: 'https://one.google.com/settings',
    isPopular: true,
  },
  {
    name: 'Dropbox',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/dropbox.com',
    websiteUrl: 'https://www.dropbox.com',
    cancelUrl: 'https://www.dropbox.com/account/plan',
    isPopular: true,
  },
  {
    name: 'Notion',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/notion.so',
    websiteUrl: 'https://www.notion.so',
    cancelUrl: 'https://www.notion.so/help/billing',
    isPopular: true,
  },
  {
    name: 'ChatGPT',
    categoryId: 2,
    logoUrl: 'https://logo.clearbit.com/openai.com',
    websiteUrl: 'https://chatgpt.com',
    cancelUrl: 'https://chatgpt.com/#settings/Subscription',
    isPopular: true,
  },
  {
    name: 'Shahid',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/shahid.net',
    websiteUrl: 'https://shahid.mbc.net',
    cancelUrl: 'https://shahid.mbc.net/account',
    isPopular: true,
  },
  {
    name: 'OSN+',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/osnplus.com',
    websiteUrl: 'https://www.osnplus.com',
    cancelUrl: 'https://www.osnplus.com',
    isPopular: true,
  },
  {
    name: 'STARZPLAY',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/starzplay.com',
    websiteUrl: 'https://starzplay.com',
    cancelUrl: 'https://starzplay.com/account',
    isPopular: true,
  },
  {
    name: 'Amazon Prime',
    categoryId: 1,
    logoUrl: 'https://logo.clearbit.com/amazon.com',
    websiteUrl: 'https://www.amazon.com/prime',
    cancelUrl: 'https://www.amazon.com/amazonprime',
    isPopular: true,
  },
];

async function seedProviders() {
  for (const provider of providers) {
    await db
      .insert(subscriptionProviders)
      .values(provider)
      .onConflictDoNothing();
  }

  console.log('Subscription providers seeded successfully');
}

seedProviders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed providers:', error);
    process.exit(1);
  });
