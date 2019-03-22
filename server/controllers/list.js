const _map = require('lodash/map');

const List = require('../models/list.model');
const Item = require('../models/item.model');
const {
  checkRole,
  filter,
  isValidMongoId
} = require('../common/utils/utilities');
const Cohort = require('../models/cohort.model');
const NotFoundException = require('../common/exceptions/NotFoundException');
const { responseWithLists } = require('../common/utils/utilities');

const createList = (req, resp) => {
  const { description, name, adminId, cohortId } = req.body;

  const list = new List({
    adminIds: adminId,
    cohortId,
    description,
    name
  });

  list.save((err, doc) => {
    if (err) {
      return resp
        .status(400)
        .send({ message: 'List not saved. Please try again.' });
    }

    const { _id, description, isFavourite, name } = doc;
    const data = cohortId
      ? { _id, description, isFavourite, name, cohortId }
      : { _id, description, isFavourite, name };
    resp
      .status(201)
      .location(`/lists/${doc._id}`)
      .send(data);
  });
};

const deleteListById = (req, resp) => {
  List.findOneAndDelete(
    { _id: req.params.id, adminIds: req.user._id },
    (err, doc) => {
      if (err) {
        return resp.status(400).send({
          message:
            'An error occurred while deleting the list. Please try again.'
        });
      }

      doc
        ? resp.status(200).send({
            message: `List "${doc.name}" successfully deleted.`
          })
        : resp.status(404).send({ message: 'List not found.' });
    }
  );
};

const getListsMetaData = (req, resp) => {
  const { cohortId } = req.params;
  const {
    user: { _id: userId }
  } = req;

  List.find(
    {
      cohortId,
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ],
      isArchived: false
    },
    `_id name description favIds ${cohortId ? 'cohortId' : ''}`,
    { sort: { created_at: -1 } },
    (err, docs) => {
      if (err) {
        return resp.status(400).send({
          message:
            'An error occurred while fetching the lists data. Please try again.'
        });
      }

      docs
        ? resp.status(200).json(responseWithLists(docs, userId))
        : resp.status(404).send({ message: 'No lists data found.' });
    }
  );
};

const getArchivedListsMetaData = (req, resp) => {
  const { cohortId } = req.params;
  const {
    user: { _id: userId }
  } = req;
  List.find(
    {
      cohortId,
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ],
      isArchived: true
    },
    `_id name description favIds isArchived ${cohortId ? 'cohortId' : ''}`,
    { sort: { created_at: -1 } },
    (err, docs) => {
      if (err) {
        return resp.status(400).send({
          message:
            'An error occurred while fetching the archived lists data. Please try again.'
        });
      }

      docs
        ? resp.status(200).json(responseWithLists(docs, userId))
        : resp.status(404).send({ message: 'No archived lists data found.' });
    }
  );
};

const addItemToList = (req, resp) => {
  const {
    item: { name, authorName, authorId },
    listId
  } = req.body;
  const {
    user: { _id: userId }
  } = req;

  const item = new Item({
    authorName,
    authorId,
    name
  });

  List.findOneAndUpdate(
    {
      _id: listId,
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ]
    },
    { $push: { items: item } },
    (err, doc) => {
      if (err) {
        return resp.status(400).send({
          message:
            'An error occurred while adding a new item. Please try again.'
        });
      }
      const listInstance = new List();
      doc
        ? resp
            .status(200)
            .send(listInstance.responseWithItem(item, listInstance, userId))
        : resp.status(404).send({ message: 'List  not found.' });
    }
  );
};

const getListData = (req, resp) => {
  const {
    params: { id: listId },
    user: { _id: userId }
  } = req;

  if (!isValidMongoId(listId)) {
    return resp
      .status(404)
      .send({ message: `Data of list id: ${listId} not found.` });
  }
  let list;
  List.findOne({
    _id: listId,
    $or: [
      { adminIds: userId },
      { ordererIds: userId },
      { purchaserIds: userId }
    ]
  })
    .exec()
    .then(doc => {
      if (!doc) {
        throw new NotFoundException(`Data of list id: ${listId} not found.`);
      }
      list = doc;
      const { cohortId } = list;
      if (cohortId) {
        return Cohort.findOne({ _id: cohortId })
          .exec()
          .then(cohort => {
            if (!cohort || cohort.isArchived) {
              throw new NotFoundException(
                `Data of list id: ${listId} not found.`
              );
            }
          });
      }
    })
    .then(() => {
      const { _id, adminIds, cohortId, description, isArchived, name } = list;
      const listInstance = new List();

      if (isArchived) {
        return resp.status(200).json({ cohortId, _id, isArchived, name });
      }

      const isAdmin = checkRole(adminIds, req.user._id);
      const items = listInstance.getListItems(userId, listInstance, list);

      return resp
        .status(200)
        .json({ _id, cohortId, description, isAdmin, isArchived, items, name });
    })
    .catch(err => {
      if (err instanceof NotFoundException) {
        const { status, message } = err;
        return resp.status(status).send({ message });
      }
      resp.status(400).send({
        message:
          'An error occurred while fetching the list data. Please try again.'
      });
    });
};

const updateListItem = (req, resp) => {
  const { isOrdered, itemId } = req.body;
  const { id: listId } = req.params;
  const {
    user: { _id: userId }
  } = req;

  /**
   * Create object with properties to update, but only these which
   * are passed in the request
   *  */
  const propertiesToUpdate = {};
  if (isOrdered !== undefined) {
    propertiesToUpdate['items.$.isOrdered'] = isOrdered;
  }

  List.findOneAndUpdate(
    {
      _id: listId,
      'items._id': itemId,
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ]
    },
    {
      $set: propertiesToUpdate
    },
    { new: true },
    (err, doc) => {
      if (err) {
        return resp.status(400).send({
          message:
            'An error occurred while updating the list data. Please try again.'
        });
      }
      const itemIndex = doc.items.findIndex(item => item._id.equals(itemId));
      const item = doc.items[itemIndex];
      const listInstance = new List();
      doc
        ? resp
            .status(200)
            .json(listInstance.responseWithItem(item, listInstance, userId))
        : resp.status(404).send({ message: 'List data not found.' });
    }
  );
};

const voteForItem = (req, resp) => {
  const { itemId } = req.body;
  const { id: listId } = req.params;
  const {
    user: { _id: userId }
  } = req;

  const dataToUpdate = req.route.path.includes('set-vote')
    ? {
        $pull: { 'items.$.voterIds': req.user._id }
      }
    : {
        $push: { 'items.$.voterIds': req.user._id }
      };

  List.findOneAndUpdate(
    {
      _id: listId,
      'items._id': itemId,
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ]
    },
    dataToUpdate,
    { new: true },
    (err, doc) => {
      if (err) {
        return resp.status(400).send({
          message: 'An error occurred while voting. Please try again.'
        });
      }
      const itemIndex = doc.items.findIndex(item => item._id.equals(itemId));
      const item = doc.items[itemIndex];
      const listInstance = new List();
      doc
        ? resp
            .status(200)
            .json(listInstance.responseWithItem(item, listInstance, userId))
        : resp.status(404).send({ message: 'List data not found.' });
    }
  );
};

const updateListById = (req, resp) => {
  const { description, isArchived, name } = req.body;
  const { id: listId } = req.params;
  const dataToUpdate = filter(x => x !== undefined)({
    description,
    isArchived,
    name
  });

  List.findOneAndUpdate(
    {
      _id: listId,
      $or: [{ adminIds: req.user._id }]
    },
    dataToUpdate,
    (err, doc) => {
      if (err) {
        return resp.status(400).send({
          message:
            'An error occurred while updating the list data. Please try again.'
        });
      }

      doc
        ? resp
            .status(200)
            .send({ message: `List "${doc.name}" successfully updated.` })
        : resp.status(404).send({ message: 'List data not found.' });
    }
  );
};

const handleFavourite = (req, resp) => {
  const { id: listId } = req.params;
  const dataToUpdate = req.route.path.includes('add-to-fav')
    ? {
        $push: { favIds: req.user._id }
      }
    : {
        $pull: { favIds: req.user._id }
      };

  List.findOneAndUpdate(
    {
      _id: listId,
      $or: [
        { adminIds: req.user._id },
        { ordererIds: req.user._id },
        { purchaserIds: req.user._id }
      ]
    },
    dataToUpdate,
    (err, doc) => {
      if (err) {
        return resp.status(400).send({
          message: "Can't mark list as favourite . Please try again."
        });
      }

      doc
        ? resp.status(200).send({
            message: `List "${doc.name}" successfully marked as favourite.`
          })
        : resp.status(404).send({ message: 'List data not found.' });
    }
  );
};

module.exports = {
  addItemToList,
  createList,
  deleteListById,
  getArchivedListsMetaData,
  getListData,
  getListsMetaData,
  handleFavourite,
  updateListById,
  updateListItem,
  voteForItem
};
