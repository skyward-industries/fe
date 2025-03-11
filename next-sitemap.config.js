/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://skywardparts.com",
  generateRobotsTxt: true,
  changefreq: "daily",
  priority: 0.7,

  // Exclude dynamic sitemaps
  exclude: ["/sitemap-group-*", "/sitemap-subgroup-*"],

  // Add manually generated sitemap index
  robotsTxtOptions: {
    additionalSitemaps: ["https://skywardparts.com/sitemap-index.xml"],
  },
};
