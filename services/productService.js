import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";

/* ============ ADMIN ============ */

export const createProduct = async (payload) => {
  // Validate category exists
  const category = await Category.findById(payload.categoryId);
  if (!category) throw new ApiError(400, "Category not found");

  const product = await Product.create({
    name: payload.name.trim(),
    description: payload.description.trim(),
    price: payload.price,
    discount: payload.discount ?? 0,
    categoryId: payload.categoryId,
    brand: payload.brand?.trim() || "",
    stock: payload.stock,
    images: payload.images || [],
    status: payload.status || "active",
  });

  return product.toObject();
};

export const updateProduct = async (id, payload) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (payload.categoryId) {
    const category = await Category.findById(payload.categoryId);
    if (!category) throw new ApiError(400, "Category not found");
    product.categoryId = payload.categoryId;
  }

  if (payload.name !== undefined) product.name = payload.name.trim();
  if (payload.description !== undefined)
    product.description = payload.description.trim();
  if (payload.price !== undefined) product.price = payload.price;
  if (payload.discount !== undefined) product.discount = payload.discount;
  if (payload.brand !== undefined) product.brand = payload.brand?.trim() || "";
  if (payload.stock !== undefined) product.stock = payload.stock;
  if (payload.images !== undefined) product.images = payload.images;
  if (payload.status !== undefined) product.status = payload.status;

  await product.save();
  return product.toObject();
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  await product.deleteOne();
  return { message: "Product deleted" };
};

/* ============ PUBLIC / LIST ============ */

export const listProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  status = "",
  minPrice,
  maxPrice,
  sort = "-createdAt",
} = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const query = {};

  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: "i" };
  }
  if (category) {
    if (!/^[a-f\d]{24}$/i.test(category)) {
      throw new ApiError(400, "Invalid category id");
    }
    query.categoryId = category;
  }
  if (status && ["active", "inactive"].includes(status)) {
    query.status = status;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  const total = await Product.countDocuments(query);
  const items = await Product.find(query)
    .populate("categoryId", "name")
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return {
    items: items.map((p) => p.toObject()),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate("categoryId", "name");
  if (!product) throw new ApiError(404, "Product not found");
  return product.toObject();
};