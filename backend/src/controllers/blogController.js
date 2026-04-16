const BlogPost = require("../models/BlogPost");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const listBlogPosts = async (req, res) => {
  const query = { published: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.tag) query.tags = req.query.tag;

  const posts = await BlogPost.find(query)
    .select("title slug excerpt category tags coverImageUrl seoTitle seoDescription publishedAt")
    .sort({ publishedAt: -1 })
    .limit(Math.min(Math.max(Number(req.query.limit || 12), 1), 50));

  return res.status(200).json({ success: true, posts });
};

const getBlogPostBySlug = async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, published: true }).populate(
    "authorId",
    "name"
  );
  if (!post) {
    return res.status(404).json({ success: false, message: "Blog post not found." });
  }
  return res.status(200).json({ success: true, post });
};

const createBlogPost = async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    coverImageUrl,
    seoTitle,
    seoDescription,
    published,
    publishedAt,
  } = req.body;

  const finalSlug = slugify(slug || title);
  const existing = await BlogPost.findOne({ slug: finalSlug });
  if (existing) {
    return res.status(409).json({ success: false, message: "Blog slug already exists." });
  }

  const post = await BlogPost.create({
    title,
    slug: finalSlug,
    excerpt: excerpt || "",
    content,
    category: category || "general",
    tags: Array.isArray(tags) ? tags : [],
    coverImageUrl: coverImageUrl || "",
    seoTitle: seoTitle || "",
    seoDescription: seoDescription || "",
    published: published !== undefined ? Boolean(published) : true,
    publishedAt: publishedAt || new Date(),
    authorId: req.user._id,
  });

  return res.status(201).json({ success: true, message: "Blog post created.", post });
};

module.exports = { listBlogPosts, getBlogPostBySlug, createBlogPost };
