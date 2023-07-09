const { query } = require("express");

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i", //i means case insensitive
          },
        }
      : {};
    console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  //   This filter for category ..queryStr m kch modify krna hoga
  filter() {
    //    const queryCopy = this.queryStr;   // isme reference mila h
    const queryCopy = { ...this.queryStr }; // isme value mili h n ki reference

    // console.log(queryCopy);
    // Removing field for category
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);
    // console.log(queryCopy);

    //    Filter for price and rating
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/, (key) => `$${key}`);

    // this.query =this.query.find(queryCopy);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }


  // pagination for showing result per page 
  pagination(resultPerPage){
    const currentPage = Number(this.queryStr.page) || 1;      // 50 page , you show 10 per page 
    
    const skip = resultPerPage*(currentPage-1);
    this.query= this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
