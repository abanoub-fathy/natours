class APIFeatures {
  constructor(model, reqQuery) {
    this.reqQuery = reqQuery;
    this.dbQuery = model.find();
  }

  filter() {
    // copy the query params
    let queryParams = { ...this.reqQuery };

    // define the params we will exclude in the filter
    const excludedParams = ['limit', 'page', 'sort', 'fields'];

    // delete the excluded params
    excludedParams.forEach((param) => delete queryParams[param]);

    // replace the query to be compatible with mongodb
    let queryStr = JSON.stringify(queryParams);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    // update the query params
    queryParams = JSON.parse(queryStr);

    // use find method on the dbQuery
    this.dbQuery.find(queryParams);

    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      let sortParams = this.reqQuery.sort.split(',').join(' ');
      this.dbQuery.sort(`${sortParams} -_id`);
    } else {
      this.dbQuery.sort('-createdAt -_id');
    }

    return this;
  }

  paginate() {
    let limit = +this.reqQuery.limit || 100;
    let page = +this.reqQuery.page || 1;

    // calculate skip value
    let skip = (page - 1) * limit;

    // apply the limit and skip on the dbQuery
    this.dbQuery.limit(limit).skip(skip);

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const selectedFields = this.reqQuery.fields.split(',').join(' ');
      this.dbQuery.select(selectedFields);
    } else {
      this.dbQuery.select('-__v');
    }

    return this;
  }
}

module.exports = APIFeatures;
