const express = require("express");
const { body, param } = require("express-validator");
const {
  listBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
} = require("../controllers/blogController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", listBlogPosts);
router.get(
  "/:slug",
  [param("slug").isString().notEmpty().withMessage("Invalid blog slug."), validateRequest],
  getBlogPostBySlug
);
router.post(
  "/",
  protect,
  allowRoles("admin"),
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("content").isString().notEmpty().withMessage("Content is required."),
    body("excerpt").optional().isString(),
    body("category").optional().isString(),
    body("tags").optional().isArray(),
    body("coverImageUrl").optional().isString(),
    body("seoTitle").optional().isString(),
    body("seoDescription").optional().isString(),
    validateRequest,
  ],
  createBlogPost
);

module.exports = router;
