const VendorShop = require("../models/VendorShop");
const User = require("../models/User");
const Product = require("../models/Product");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getMyVendorShop = async (req, res) => {
  let shop = await VendorShop.findOne({ vendorId: req.user._id });
  if (!shop) {
    const fallbackName = `${req.user.name}'s Shop`;
    shop = await VendorShop.create({
      vendorId: req.user._id,
      shopName: fallbackName,
      slug: `${slugify(req.user.name)}-${req.user._id.toString().slice(-6)}`,
    });
  }

  return res.status(200).json({ success: true, shop });
};

const upsertMyVendorShop = async (req, res) => {
  const {
    shopName,
    slug,
    description,
    logoUrl,
    bannerUrl,
    accentColor,
  } = req.body;

  let shop = await VendorShop.findOne({ vendorId: req.user._id });
  const nextSlug = slugify(slug || shopName || req.user.name);
  const existingSlugOwner = await VendorShop.findOne({ slug: nextSlug });

  if (existingSlugOwner && existingSlugOwner.vendorId.toString() !== req.user._id.toString()) {
    return res.status(409).json({ success: false, message: "Shop slug is already in use." });
  }

  if (!shop) {
    shop = await VendorShop.create({
      vendorId: req.user._id,
      shopName: shopName || `${req.user.name}'s Shop`,
      slug: nextSlug || `${req.user._id.toString().slice(-6)}`,
      description: description || "",
      logoUrl: logoUrl || "",
      bannerUrl: bannerUrl || "",
      accentColor: accentColor || "#6b7280",
    });
  } else {
    if (shopName !== undefined) shop.shopName = shopName;
    if (nextSlug) shop.slug = nextSlug;
    if (description !== undefined) shop.description = description;
    if (logoUrl !== undefined) shop.logoUrl = logoUrl;
    if (bannerUrl !== undefined) shop.bannerUrl = bannerUrl;
    if (accentColor !== undefined) shop.accentColor = accentColor;
    await shop.save();
  }

  return res.status(200).json({ success: true, message: "Vendor shop updated.", shop });
};

const getVendorShopBySlug = async (req, res) => {
  const shop = await VendorShop.findOne({ slug: req.params.slug });
  if (!shop) {
    return res.status(404).json({ success: false, message: "Vendor shop not found." });
  }

  const [vendor, products] = await Promise.all([
    User.findById(shop.vendorId).select("name email profileImage"),
    Product.find({ vendor: shop.vendorId }).sort({ createdAt: -1 }).limit(24),
  ]);

  return res.status(200).json({ success: true, shop, vendor, products });
};

module.exports = {
  getMyVendorShop,
  upsertMyVendorShop,
  getVendorShopBySlug,
};
