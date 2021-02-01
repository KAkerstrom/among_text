const error = (message) => {
  return {
    error: true,
    message,
  };
};

module.exports = { error };
