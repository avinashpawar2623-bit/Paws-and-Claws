const BlogPost = require("../models/BlogPost");
const Product = require("../models/Product");
const VendorShop = require("../models/VendorShop");
const env = require("../config/env");

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getBaseUrl = () => String(env.clientUrl || "http://localhost:5173").replace(/\/$/, "");

const getRobotsTxt = async (_req, res) => {
  const baseUrl = getBaseUrl();
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  res.type("text/plain");
  return res.status(200).send(content);
};

const getSitemapXml = async (_req, res) => {
  const baseUrl = getBaseUrl();
  const [products, posts, shops] = await Promise.all([
    Product.find().select("_id updatedAt"),
    BlogPost.find({ published: true }).select("slug updatedAt publishedAt"),
    VendorShop.find().select("slug updatedAt"),
  ]);

  const staticUrls = [
    { loc: `${baseUrl}/`, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/products`, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/blog`, lastmod: new Date().toISOString() },
  ];

  const dynamicUrls = [
    ...products.map((item) => ({
      loc: `${baseUrl}/products/${item._id.toString()}`,
      lastmod: new Date(item.updatedAt || Date.now()).toISOString(),
    })),
    ...posts.map((item) => ({
      loc: `${baseUrl}/blog/${item.slug}`,
      lastmod: new Date(item.updatedAt || item.publishedAt || Date.now()).toISOString(),
    })),
    ...shops.map((item) => ({
      loc: `${baseUrl}/shops/${item.slug}`,
      lastmod: new Date(item.updatedAt || Date.now()).toISOString(),
    })),
  ];

  const allUrls = [...staticUrls, ...dynamicUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.type("application/xml");
  return res.status(200).send(xml);
};

module.exports = { getRobotsTxt, getSitemapXml };
