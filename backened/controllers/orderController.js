const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await orderModel.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate("user", "name email");

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get single order-->order of currently logged in user
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await orderModel.find({ user: req.user._id });

  if (!orders) {
    return next(new ErrorHandler("No Order exist ", 404));
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

// Get All orders-->admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await orderModel.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    totalAmount,
    orders,
  });
});
// Update order status-->admin
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  console.log("order is", order);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await productModel.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// Delete Order-->admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await orderModel.findByIdAndDelete(req.params.id);
  if (!order) {
    return next(
      new ErrorHandler(`order not found with this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: "order deleted successfully",
    order,
  });
});
