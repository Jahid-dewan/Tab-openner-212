import { TwitterPostInfo } from '../types';

/**
 * Validates and normalizes an X / Twitter post URL.
 * Supports x.com, twitter.com, mobile.twitter.com, etc.
 */
export function parseTwitterUrl(input: string): TwitterPostInfo {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawUrl: '',
      cleanedUrl: '',
      username: null,
      statusId: null,
      errorMessage: 'Please enter a Twitter or X post URL.',
    };
  }

  // Auto-prepend https:// if missing
  let candidate = trimmed;
  if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname.toLowerCase();

    const isTwitterDomain =
      hostname === 'x.com' ||
      hostname === 'www.x.com' ||
      hostname === 'twitter.com' ||
      hostname === 'www.twitter.com' ||
      hostname === 'mobile.twitter.com' ||
      hostname === 'm.twitter.com';

    if (!isTwitterDomain) {
      return {
        isValid: false,
        rawUrl: trimmed,
        cleanedUrl: candidate,
        username: null,
        statusId: null,
        errorMessage: 'URL must be from x.com or twitter.com (e.g., https://x.com/username/status/123456789)',
      };
    }

    // Pattern matches: /username/status/id or /username/statuses/id
    const pathname = parsed.pathname;
    const match = pathname.match(/^\/([a-zA-Z0-9_]{1,25})\/status(?:es)?\/([0-9]+)/i);

    if (!match) {
      return {
        isValid: false,
        rawUrl: trimmed,
        cleanedUrl: candidate,
        username: null,
        statusId: null,
        errorMessage: 'Invalid format. Must point to a specific post: /username/status/[number]',
      };
    }

    const username = match[1];
    const statusId = match[2];

    // Build canonical clean URL: https://x.com/[username]/status/[statusId]
    const cleanedUrl = `https://x.com/${username}/status/${statusId}`;

    return {
      isValid: true,
      rawUrl: trimmed,
      cleanedUrl,
      username,
      statusId,
    };
  } catch {
    return {
      isValid: false,
      rawUrl: trimmed,
      cleanedUrl: '',
      username: null,
      statusId: null,
      errorMessage: 'Invalid URL format.',
    };
  }
}

export const SAMPLE_TWEETS = [
  {
    label: 'NASA Mars Rover',
    url: 'https://x.com/NASA/status/1884674391268344192',
    description: 'Latest deep space mission broadcast',
  },
  {
    label: 'X Announcement',
    url: 'https://x.com/X/status/1785368294246596954',
    description: 'Official platform news',
  },
  {
    label: 'SpaceX Starship',
    url: 'https://x.com/SpaceX/status/1859011925343469850',
    description: 'Starship flight test milestones',
  },
];
