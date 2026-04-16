const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const env = require("../config/env");
const connectDatabase = require("../config/database");
const User = require("../models/User");
const Product = require("../models/Product");

const run = async () => {
  await connectDatabase(env.mongoUri);

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const vendorPassword = await bcrypt.hash("Vendor@123", 10);
  const customerPassword = await bcrypt.hash("Customer@123", 10);

  await User.deleteMany({});
  await Product.deleteMany({});

  const [admin, vendor] = await User.create([
    {
      name: "System Admin",
      email: "admin@pawsandclaws.local",
      password: adminPassword,
      role: "admin",
    },
    {
      name: "Main Vendor",
      email: "vendor@pawsandclaws.local",
      password: vendorPassword,
      role: "vendor",
    },
    {
      name: "Demo Customer",
      email: "customer@pawsandclaws.local",
      password: customerPassword,
      role: "customer",
    },
  ]);

  await Product.create([
    {
      name: "Premium Dog Food",
      description: "Balanced nutrition for adult dogs.",
      category: "food",
      price: 45.99,
      stock: 30,
      vendor: vendor._id,
    },
    {
      name: "Cat Wellness Drops",
      description: "Daily health support for cats.",
      category: "health",
      price: 19.5,
      stock: 50,
      vendor: vendor._id,
    },
    {
      name: "Interactive Feather Toy",
      description: "Keeps your pet active and engaged.",
      category: "toys",
      price: 12.99,
      stock: 80,
      vendor: vendor._id,
    },
    {
      name: "Comfort Collar",
      description: "Soft and durable collar for everyday use.",
      category: "accessories",
      price: 14.25,
      stock: 40,
      vendor: vendor._id,
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin: admin@pawsandclaws.local / Admin@123");
  console.log("Vendor: vendor@pawsandclaws.local / Vendor@123");
  console.log("Customer: customer@pawsandclaws.local / Customer@123");

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
