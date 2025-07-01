// Utility functions for handling links in messages

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const extractUrls = (text) => {
  if (!text) return [];
  
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
  return text.match(urlRegex) || [];
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

// Enhanced patterns for different types of clickable content
export const patterns = {
  url: /(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.\-~!*'();@&=+$,?#\[\]])*)?|www\.(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.\-~!*'();@&=+$,?#\[\]])*)?|(?:[-\w.])+\.(?:com|org|net|edu|gov|mil|int|co|io|me|ly|to|tv|fm|gg|tk|ml|ga|cf|xyz|tech|app|dev|blog|shop|news|info|online|site|website|store|cloud|ai|data)(?:\/(?:[\w\/_.\-~!*'();@&=+$,?#\[\]])*)?)/gi,
  email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  phone: /(\+?[1-9]\d{1,14}|\(\d{3}\)\s?\d{3}-?\d{4}|\d{3}-?\d{3}-?\d{4})/g
};

export const renderMessageWithLinks = (text, isSender, options = {}) => {
  if (!text) return null;
  
  const {
    openInNewTab = true,
    maxUrlLength = 50,
    enableEmails = true,
    enablePhones = true
  } = options;
  
  // Combined regex for all patterns
  const combinedRegex = new RegExp(
    `(${patterns.url.source}|${enableEmails ? patterns.email.source : ''}|${enablePhones ? patterns.phone.source : ''})`,
    'gi'
  );
  
  const parts = text.split(combinedRegex).filter(part => part !== undefined && part !== '');
  
  return parts.map((part, index) => {
    // Check if it's a URL
    if (patterns.url.test(part)) {
      const formattedUrl = formatUrl(part);
      const displayUrl = truncateUrl(part, maxUrlLength);
      
      return (
        <a
          key={index}
          href={formattedUrl}
          target={openInNewTab ? "_blank" : "_self"}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          className={`inline-flex items-center underline hover:no-underline transition-all duration-200 rounded px-1 ${
            isSender 
              ? 'text-blue-100 hover:text-white hover:bg-blue-500/20' 
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/20'
          }`}
          onClick={(e) => e.stopPropagation()}
          title={formattedUrl}
        >
          🔗 {displayUrl}
        </a>
      );
    }
    
    // Check if it's an email
    if (enableEmails && patterns.email.test(part)) {
      return (
        <a
          key={index}
          href={`mailto:${part}`}
          className={`inline-flex items-center underline hover:no-underline transition-all duration-200 rounded px-1 ${
            isSender 
              ? 'text-blue-100 hover:text-white hover:bg-blue-500/20' 
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/20'
          }`}
          onClick={(e) => e.stopPropagation()}
          title={`Send email to ${part}`}
        >
          📧 {part}
        </a>
      );
    }
    
    // Check if it's a phone number
    if (enablePhones && patterns.phone.test(part)) {
      return (
        <a
          key={index}
          href={`tel:${part.replace(/\D/g, '')}`}
          className={`inline-flex items-center underline hover:no-underline transition-all duration-200 rounded px-1 ${
            isSender 
              ? 'text-blue-100 hover:text-white hover:bg-blue-500/20' 
              : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/20'
          }`}
          onClick={(e) => e.stopPropagation()}
          title={`Call ${part}`}
        >
          📞 {part}
        </a>
      );
    }
    
    return part;
  });
};
