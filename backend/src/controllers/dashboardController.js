const prisma = require("../config/prisma");

const getDashboardStats = async (req, res) => {
  try {
    const totalItems = await prisma.item.count();

    const totalBorrowRequests = await prisma.borrowRequest.count();

    const pendingRequests = await prisma.borrowRequest.count({
      where: { status: "pending" },
    });

    const approvedRequests = await prisma.borrowRequest.count({
      where: { status: "approved" },
    });

    const rejectedRequests = await prisma.borrowRequest.count({
      where: { status: "rejected" },
    });

    const returnedRequests = await prisma.borrowRequest.count({
      where: { status: "returned" },
    });

    const totalUsers = await prisma.user.count();

    return res.json({
      totalItems,
      totalUsers,
      totalBorrowRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      returnedRequests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
