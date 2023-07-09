const productModel = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

// exports.createProduct = async (req, res) => {
//   try {
//     const product = await productModel.create(req.body);
//     res.json({
//       message: "Product created Successfully",
//       data: product,
//     });
//   } catch (err) {
//     res.json({
//       message: "Error occured in creating product" + err,
//     });
//   }
// };

// 2nd way with async error handler
// create product-- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await productModel.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// get all products
exports.getAllProducts = async (req, res) => {
  try {
    const resultPerPage = 6;
    const productsCount = await productModel.countDocuments();
    const apiFeature = new ApiFeatures(productModel.find(), req.query)
      .search()
      .filter();

    // const products = await productModel.find();
    let products = await apiFeature.query.clone();
    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage);
    products = await apiFeature.query;
    if (products.length > 0) {
      res.status(200).json({
        message: "Products fetched successfully",
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
      });
    } else {
      res.json({
        message: "No Products found",
      });
    }
  } catch (err) {
    res.json({
      message: "Error occured in getting getAllProducts" + err,
    });
  }
};

// Update product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await productModel.findById(req.params.id);

  //  console.log("Product:", product);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  // console.log("Updated product:", product);
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    let id = req.params.id;
    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      res.json({
        message: "Product not found",
      });
    }

    // deleting image from cloudinary
    for (let i = 0; i < product.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    res.status(500).json({
      message: "Product deleted sucessfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error in deleting product",
    });
  }
};

// Get product details
exports.getProductDetails = async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    message: "product info fetched successfully",
    data: product,
  });
};

// create new review or update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await productModel.findById(productId);
  console.log(product);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.rating = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res) => {
  const product = await productModel.findById(req.query.id);
  if (!product) {
    return next(new ErrorHandler(`Product not found`, 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const productId = req.query.productId;
  const reviewId = req.query.id;

  console.log(
    "Review and product id backened" + reviewId + " and " + productId
  );

  if (!productId || !reviewId) {
    return next(new ErrorHandler("Invalid parameters provided", 400));
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await productModel.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review Deleted Successfully",
  });
});

// get all products (admin)
exports.getAdminProducts = async (req, res) => {
  const products = await productModel.find();

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    products,
  });
};
