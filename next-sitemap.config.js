/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://skywardparts.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,

  // Exclude dynamic sitemaps
  exclude: ["/sitemap-group-*.xml", "/sitemap-subgroup-*.xml"],

  // Add manually generated sitemap index
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://skywardparts.com/sitemap-index.xml",
    ],
  },
};
