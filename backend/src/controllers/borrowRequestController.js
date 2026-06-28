const prisma = require("../config/prisma");

const createBorrowRequest = async (req, res) => {
  try {
    const { itemId, quantity, notes } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        message: "Item and quantity are required",
      });
    }

    const item = await prisma.item.findUnique({
      where: { id: Number(itemId) },
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (Number(quantity) > item.quantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds stock",
      });
    }

    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        userId: req.user.id,
        itemId: Number(itemId),
        quantity: Number(quantity),
        notes,
        status: "pending",
      },
    });

    return res.status(201).json({
      message: "Borrow request created successfully",
      borrowRequest,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create borrow request",
      error: error.message,
    });
  }
};

const getBorrowRequests = async (req, res) => {
  try {
    const borrowRequests = await prisma.borrowRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        item: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(borrowRequests);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get borrow requests",
      error: error.message,
    });
  }
};

const approveBorrowRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!borrowRequest) {
      return res.status(404).json({
        message: "Borrow request not found",
      });
    }

    if (borrowRequest.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    if (borrowRequest.quantity > borrowRequest.item.quantity) {
      return res.status(400).json({
        message: "Item stock is not enough",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: {
          id: borrowRequest.itemId,
        },
        data: {
          quantity: borrowRequest.item.quantity - borrowRequest.quantity,
        },
      });

      const updatedRequest = await tx.borrowRequest.update({
        where: { id },
        data: {
          status: "approved",
        },
      });

      return updatedRequest;
    });

    return res.status(200).json({
      message: "Borrow request approved",
      borrowRequest: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to approve borrow request",
      error: error.message,
    });
  }
};

module.exports = {
  createBorrowRequest,
  getBorrowRequests,
  approveBorrowRequest,
};