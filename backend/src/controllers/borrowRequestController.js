const prisma = require("../config/prisma");

const createBorrowRequest = async (req, res) => {
  try {
    const { itemId, quantity, notes } = req.body;
    const requestedQuantity = Number(quantity);

    if (!itemId || !quantity) {
      return res.status(400).json({
        message: "Item and quantity are required",
      });
    }

    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive number",
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

    if (requestedQuantity > item.quantity) {
      return res.status(400).json({
        message: "Requested quantity exceeds stock",
      });
    }

    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        userId: req.user.id,
        itemId: Number(itemId),
        quantity: requestedQuantity,
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
      where: req.user.role === "admin" ? undefined : { userId: req.user.id },
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

    const result = await prisma.$transaction(async (tx) => {
      const borrowRequest = await tx.borrowRequest.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!borrowRequest) {
        return { errorStatus: 404, message: "Borrow request not found" };
      }

      if (borrowRequest.status !== "pending") {
        return { errorStatus: 400, message: "Request already processed" };
      }

      if (borrowRequest.quantity > borrowRequest.item.quantity) {
        return { errorStatus: 400, message: "Item stock is not enough" };
      }

      const updatedItem = await tx.item.updateMany({
        where: {
          id: borrowRequest.itemId,
          quantity: {
            gte: borrowRequest.quantity,
          },
        },
        data: {
          quantity: {
            decrement: borrowRequest.quantity,
          },
        },
      });

      if (updatedItem.count === 0) {
        return { errorStatus: 400, message: "Item stock is not enough" };
      }

      return tx.borrowRequest.update({
        where: { id },
        data: {
          status: "approved",
        },
      });
    });

    if (result.errorStatus) {
      return res.status(result.errorStatus).json({
        message: result.message,
      });
    }

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

const rejectBorrowRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
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

    const updatedRequest = await prisma.borrowRequest.update({
      where: { id },
      data: {
        status: "rejected",
      },
    });

    return res.status(200).json({
      message: "Borrow request rejected",
      borrowRequest: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reject borrow request",
      error: error.message,
    });
  }
};

const returnBorrowRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const borrowRequest = await prisma.borrowRequest.findUnique({
      where: { id },
      include: {
        item: true,
      },
    });

    if (!borrowRequest) {
      return res.status(404).json({
        message: "Borrow request not found",
      });
    }

    if (borrowRequest.status !== "approved") {
      return res.status(400).json({
        message: "Only approved request can be returned",
      });
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: {
          id: borrowRequest.itemId,
        },
        data: {
          quantity: {
            increment: borrowRequest.quantity,
          },
        },
      });

      return tx.borrowRequest.update({
        where: { id },
        data: {
          status: "returned",
        },
      });
    });

    return res.status(200).json({
      message: "Borrow request returned successfully",
      borrowRequest: updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to return borrow request",
      error: error.message,
    });
  }
};

module.exports = {
  createBorrowRequest,
  getBorrowRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  returnBorrowRequest,
};
