const ShoppingList = require('../models/shoppingList.model');
const Product = require('../models/item.model');
const filter = require('../common/utilities');

const createNewList = (req, resp) => {
  const { description, name, adminId } = req.body;

  const shoppingList = new ShoppingList({
    description,
    name,
    adminIds: adminId
  });

  shoppingList.save((err, doc) => {
    err
      ? resp.status(400).send(err.message)
      : resp
          .location(`/shopping-list/${doc._id}`)
          .status(201)
          .send(doc);
  });
};

// Get all the lists
const getAllShoppingLists = (req, resp) => {
  ShoppingList.find(
    {
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ]
    },
    null,
    { sort: { created_at: -1 } },
    (err, shoppingLists) => {
      err
        ? resp.status(400).send(err.message)
        : resp.status(200).send(shoppingLists);
    }
  );
};

const getShoppingListById = (req, resp) => {
  ShoppingList.findById({ _id: req.params.id }, (err, doc) => {
    if (!doc) return resp.status(404).send('No shopping list of given id');

    return err
      ? resp.status(400).send(err.message)
      : resp.status(200).json(doc);
  });
};

const getShoppingListsMetaData = (req, resp) => {
  ShoppingList.find(
    {
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ]
    },
    '_id name description',
    { sort: { created_at: -1 } },
    (err, docs) => {
      err ? resp.status(404).send(err.message) : resp.status(200).send(docs);
    }
  );
};

const addProductToList = (req, resp) => {
  const {
    product: { name, isOrdered, authorName, authorId, voterIds },
    listId
  } = req.body;

  const product = new Product({
    authorName,
    authorId,
    isOrdered,
    name,
    createdAt: new Date(Date.now()).toISOString(),
    voterIds
  });

  ShoppingList.findOneAndUpdate(
    {
      _id: listId
    },
    { $push: { products: product } },
    (err, data) => {
      err ? resp.status(404).send(err) : resp.status(200).send(product);
    }
  );
};

const getProductsForGivenList = (req, resp) => {
  ShoppingList.find({ _id: req.params.id }, 'products', (err, documents) => {
    err ? resp.status(404).send(err) : resp.status(200).send(documents);
  });
};

const updateShoppingListItem = (req, resp) => {
  const { name, isOrdered, author, voterIds, _id, listId } = req.body;

  const newData = filter(x => x !== undefined)({
    name,
    isOrdered,
    author,
    createdAt: new Date(Date.now()).toISOString(),
    voterIds,
    _id
  });

  ShoppingList.find({ _id: listId, 'products._id': _id })
    .exec()
    .then(res => console.info(res));
  // console.info(test, '!!!');

  ShoppingList.find({ _id: listId }, function(err, doc) {
    const list = new ShoppingList();
    console.log(list);
  });

  // ShoppingList.findOneAndUpdate({ _id: listId }, (err, doc) => {
  //   let updatedItems = [...doc.products];

  //   updatedItems.map(item =>
  //     item._id == _id ? (item.isOrdered = 'test') : item.isOrdered
  //   );
  // });

  // ShoppingList.update({"shoppingLists.list.products.item.id": "item id here" },
  //   { "$set": { "shoppinglists.$.list.$.products.$.item.name": "New Item"}},function(err,result) {
  //      console.log(err,result);
  //   });
};

module.exports = {
  addProductToList,
  createNewList,
  getAllShoppingLists,
  getProductsForGivenList,
  getShoppingListById,
  getShoppingListsMetaData,
  updateShoppingListItem
};
