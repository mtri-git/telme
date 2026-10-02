// Utility functions for handling links in messages

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const formatUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

export const truncateUrl = (url, maxLength = 50) => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};

// Characters a link may not end with (so "see google.com." doesn't swallow the period)
const TRAILING = `[^\\s<>.,:;"'!?)\\]]`;
const TLDS = 'com|org|net|edu|gov|mil|int|co|io|me|ly|to|tv|fm|gg|vn|xyz|tech|app|dev|blog|shop|news|info|online|site|website|store|cloud|ai|data';

// Pattern sources (no capturing groups, no global flag) so they can be combined safely
export const patterns = {
  email: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}`,
  url:
    `https?:\\/\\/[^\\s<>]*${TRAILING}` +
    `|www\\.[^\\s<>]*${TRAILING}` +
    `|\\b(?:[-a-zA-Z0-9]+\\.)+(?:${TLDS})\\b(?:\\/[^\\s<>]*${TRAILING})?`,
  // 9–15 digits, optionally grouped with spaces, dots or dashes; plain numbers like "2024" are ignored
  phone: `(?:\\+\\d|\\b\\d)(?:[\\s.-]?\\d){8,14}\\b`,
};

export const extractUrls = (text) => {
  if (!text) return [];
  return text.match(new RegExp(patterns.url, 'gi')) || [];
};

const linkClassName = (isSender) =>
  `underline underline-offset-2 break-all rounded transition-colors ${
    isSender
      ? 'text-white hover:text-blue-100'
      : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
  }`;

export const renderMessageWithLinks = (text, isSender, options = {}) => {
  if (!text) return null;

  const {
    openInNewTab = true,
    maxUrlLength = 50,
    enableEmails = true,
    enablePhones = true
  } = options;

  // Email goes first so "a@b.com" isn't split into text + the URL "b.com"
  const alternatives = [
    enableEmails && `(?<email>${patterns.email})`,
    `(?<url>${patterns.url})`,
    enablePhones && `(?<phone>${patterns.phone})`,
  ].filter(Boolean);
  const combinedRegex = new RegExp(alternatives.join('|'), 'gi');

  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(combinedRegex)) {
    const [value] = match;
    const { email, url, phone } = match.groups;
    const key = match.index;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    lastIndex = match.index + value.length;

    if (url) {
      const formattedUrl = formatUrl(url);
      parts.push(
        <a
          key={key}
          href={formattedUrl}
          target={openInNewTab ? "_blank" : "_self"}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          className={linkClassName(isSender)}
          onClick={(e) => e.stopPropagation()}
          title={formattedUrl}
        >
          {truncateUrl(url, maxUrlLength)}
        </a>
      );
    } else if (email) {
      parts.push(
        <a
          key={key}
          href={`mailto:${email}`}
          className={linkClassName(isSender)}
          onClick={(e) => e.stopPropagation()}
          title={`Send email to ${email}`}
        >
          {email}
        </a>
      );
    } else if (phone) {
      parts.push(
        <a
          key={key}
          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
          className={linkClassName(isSender)}
          onClick={(e) => e.stopPropagation()}
          title={`Call ${phone}`}
        >
          {phone}
        </a>
      );
    }
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};
