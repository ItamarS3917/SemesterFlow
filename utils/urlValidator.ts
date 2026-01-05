/**
 * URL Validation Utility
 * Ensures only safe, trusted file-sharing links are accepted
 */

// Trusted domains for file attachments
const TRUSTED_DOMAINS = [
  // Dropbox
  'dropbox.com',
  'www.dropbox.com',
  'dl.dropboxusercontent.com',

  // OneDrive / Microsoft
  'onedrive.live.com',
  '1drv.ms',
  'sharepoint.com',

  // Other trusted services
  'box.com',
  'app.box.com',
  'icloud.com',
  'mega.nz',
  'mega.io',
];

// Suspicious patterns that might indicate malicious links
const SUSPICIOUS_PATTERNS = [
  /bit\.ly/i, // URL shorteners (can hide destination)
  /tinyurl/i,
  /goo\.gl/i,
  /ow\.ly/i,
  /t\.co/i,
  /<script/i, // Script injection attempts
  /javascript:/i, // JavaScript protocol
  /data:/i, // Data URLs
  /file:/i, // Local file protocol
  /\.exe$/i, // Executable files
  /\.bat$/i,
  /\.cmd$/i,
  /\.scr$/i,
  /\.vbs$/i,
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  url?: string;
}

/**
 * Validates if a URL is safe and from a trusted domain
 */
export const validateAttachmentUrl = (input: string): ValidationResult => {
  // Remove whitespace
  const trimmed = input.trim();

  // Check if empty
  if (!trimmed) {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Check minimum length
  if (trimmed.length < 10) {
    return { isValid: false, error: 'URL is too short to be valid' };
  }

  // Try to parse as URL
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch (e) {
    return { isValid: false, error: 'Invalid URL format. Make sure it starts with https://' };
  }

  // Only allow HTTPS (secure connections)
  if (url.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTPS URLs are allowed for security' };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error:
          'This URL contains suspicious patterns. Please use direct links from trusted services.',
      };
    }
  }

  // Check if domain is trusted
  const hostname = url.hostname.toLowerCase();
  const isTrusted = TRUSTED_DOMAINS.some((domain) => {
    return hostname === domain || hostname.endsWith('.' + domain);
  });

  if (!isTrusted) {
    return {
      isValid: false,
      error: `Domain "${hostname}" is not in the trusted list. Please use Dropbox, OneDrive, or other supported services.`,
    };
  }

  // All checks passed!
  return {
    isValid: true,
    url: trimmed,
  };
};

/**
 * Extracts the service name from a URL for display
 */
export const getServiceName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('dropbox')) return 'Dropbox';
    if (hostname.includes('onedrive') || hostname.includes('1drv')) return 'OneDrive';
    if (hostname.includes('sharepoint')) return 'SharePoint';
    if (hostname.includes('box')) return 'Box';
    if (hostname.includes('icloud')) return 'iCloud';
    if (hostname.includes('mega')) return 'MEGA';

    return 'Cloud Storage';
  } catch {
    return 'Link';
  }
};

/**
 * Shortens a URL for display (keeps it readable)
 */
export const shortenUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) return url;

  const start = url.substring(0, maxLength - 15);
  const end = url.substring(url.length - 12);

  return `${start}...${end}`;
};
