import { describe, it, expect } from 'vitest';
import { validateAttachmentUrl, getServiceName, shortenUrl } from '../../utils/urlValidator';

describe('urlValidator', () => {
  describe('validateAttachmentUrl', () => {
    it('should reject empty URLs', () => {
      const result = validateAttachmentUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL cannot be empty');
    });

    it('should reject URLs that are too short', () => {
      const result = validateAttachmentUrl('https://');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL is too short to be valid');
    });

    it('should reject invalid URL format', () => {
      const result = validateAttachmentUrl('not-a-valid-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid URL format');
    });

    it('should reject non-HTTPS URLs', () => {
      const result = validateAttachmentUrl('http://dropbox.com/file');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only HTTPS URLs are allowed for security');
    });

    it('should reject URLs with suspicious patterns', () => {
      const result = validateAttachmentUrl('https://bit.ly/something');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('suspicious patterns');
    });

    it('should reject URLs from untrusted domains', () => {
      const result = validateAttachmentUrl('https://example.com/file');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not in the trusted list');
    });

    it('should accept valid Dropbox URLs', () => {
      const result = validateAttachmentUrl('https://www.dropbox.com/s/abc123/file.pdf');
      expect(result.isValid).toBe(true);
      expect(result.url).toBe('https://www.dropbox.com/s/abc123/file.pdf');
    });

    it('should accept valid OneDrive URLs', () => {
      const result = validateAttachmentUrl('https://onedrive.live.com/file');
      expect(result.isValid).toBe(true);
    });

    it('should accept valid Box URLs', () => {
      const result = validateAttachmentUrl('https://app.box.com/file');
      expect(result.isValid).toBe(true);
    });
  });

  describe('getServiceName', () => {
    it('should identify Dropbox URLs', () => {
      expect(getServiceName('https://www.dropbox.com/file')).toBe('Dropbox');
    });

    it('should identify OneDrive URLs', () => {
      expect(getServiceName('https://onedrive.live.com/file')).toBe('OneDrive');
    });

    it('should identify SharePoint URLs', () => {
      expect(getServiceName('https://sharepoint.com/file')).toBe('SharePoint');
    });

    it('should identify Box URLs', () => {
      expect(getServiceName('https://app.box.com/file')).toBe('Box');
    });

    it('should return "Link" for invalid URLs', () => {
      expect(getServiceName('not-a-url')).toBe('Link');
    });

    it('should return "Cloud Storage" for unknown services', () => {
      expect(getServiceName('https://unknown-service.com/file')).toBe('Cloud Storage');
    });
  });

  describe('shortenUrl', () => {
    it('should not shorten URLs shorter than max length', () => {
      const url = 'https://example.com';
      expect(shortenUrl(url, 50)).toBe(url);
    });

    it('should shorten long URLs', () => {
      const url = 'https://www.dropbox.com/s/verylongfilename123456789/somefile.pdf?dl=0';
      const shortened = shortenUrl(url, 50);
      expect(shortened).toContain('...');
      expect(shortened.length).toBeLessThan(url.length);
    });

    it('should preserve start and end of URL when shortening', () => {
      const url = 'https://www.dropbox.com/s/verylongfilename123456789/somefile.pdf?dl=0';
      const shortened = shortenUrl(url, 50);
      expect(shortened).toContain('https://www.dropbox.com');
      expect(shortened).toContain('pdf?dl=0');
    });
  });
});
