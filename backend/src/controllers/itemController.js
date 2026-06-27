const prisma = require("../config/prisma");

const createItem = async (req, res) => {
  try {
    const { name, code, category, quantity, description } = req.body;

    if (!name || !code || !category || quantity === undefined) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const item = await prisma.item.create({
      data: {
        name,
        code,
        category,
        quantity: Number(quantity),
        description,
      },
    });

    return res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create item",
      error: error.message,
    });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get items" });
  }
};

const getItemById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get item" });
  }
};

const updateItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, code, category, quantity, description } = req.body;

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        code,
        category,
        quantity: Number(quantity),
        description,
      },
    });

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update item",
      error: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.item.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};  