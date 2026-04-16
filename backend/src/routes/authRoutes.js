const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
} = require("../controllers/authController");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    validateRequest,
  ],
  register
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
    validateRequest,
  ],
  login
);
router.post("/logout", logout);
router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required."), validateRequest],
  refreshToken
);
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required."), validateRequest],
  forgotPassword
);

module.exports = router;
