
import React from 'react';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = (baseUrl: string, dynamicUrls: SitemapUrl[] = []): string => {
  const staticUrls: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/experiences`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/submit`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/chat`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/chat/conversations`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/resume-ats`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/auth`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/profile`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/docs`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/terms`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: 0.3
    }
  ];

  const allUrls = [...staticUrls, ...dynamicUrls];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
};

const SitemapGenerator: React.FC = () => {
  return null; // This is a utility component
};

export default SitemapGenerator;
