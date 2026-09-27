// backend/services/categoryService.js
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";

/* ============ ADMIN OPERATIONS ============ */

export const createCategory = async ({ name, description, image, status }) => {
  const existing = await Category.findOne({
    name: { $regex: `^${name.trim()}$`, $options: "i" },
  });
  if (existing) throw new ApiError(409, "Category name already exists");

  const category = await Category.create({
    name: name.trim(),
    description: description?.trim() || "",
    image: image?.trim() || "",
    status: status || "active",
  });

  return category.toObject();
};

export const updateCategory = async (id, payload) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  if (payload.name && payload.name.trim() !== category.name) {
    const clash = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: `^${payload.name.trim()}$`, $options: "i" },
    });
    if (clash) throw new ApiError(409, "Category name already exists");
    category.name = payload.name.trim();
  }

  if (payload.description !== undefined)
    category.description = payload.description?.trim() || "";
  if (payload.image !== undefined) category.image = payload.image?.trim() || "";
  if (payload.status !== undefined) category.status = payload.status;

  await category.save();
  return category.toObject();
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  await category.deleteOne();
  return { message: "Category deleted" };
};

/* ============ PUBLIC / LIST OPERATIONS ============ */

export const listCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const query = {};

  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: "i" };
  }
  if (status && ["active", "inactive"].includes(status)) {
    query.status = status;
  }

  const total = await Category.countDocuments(query);
  const items = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return {
    items: items.map((c) => c.toObject()),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category.toObject();
};