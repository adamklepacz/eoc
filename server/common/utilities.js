const mongoose = require('mongoose');

const fromEntries = convertedArray =>
  convertedArray.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

const filter = f => object =>
  fromEntries(
    Object.entries(object).filter(([key, value]) => f(value, key, object))
  );

const checkRole = (ids, userIdFromReq) => {
  const userId = mongoose.Types.ObjectId(userIdFromReq);
  return ids.some(id => id.equals(userId));
};

module.exports = { checkRole, filter };
