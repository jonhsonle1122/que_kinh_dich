export const responseHandler = (req, res, next) => {
  res.success = (data = null, message = "Success", code = 0) => {
    return res.status(200).json({
      errorCode: code,
      message,
      data,
    });
  };

  res.error = (message = "Error", code = 1, status = 400) => {
    return res.status(status).json({
      errorCode: code,
      message,
      data: null,
    });
  };

  next();
};
