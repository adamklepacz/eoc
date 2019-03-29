const express = require('express');

const router = express.Router();

const {
  addMember,
  addToFavourites,
  createCohort,
  deleteCohortById,
  getArchivedCohortsMetaData,
  getCohortDetails,
  getCohortsMetaData,
  getMembers,
  removeFromFavourites,
  removeMember,
  removeOwner,
  setAsMember,
  setAsOwner,
  updateCohortById
} = require('../controllers/cohort');
const { authorize } = require('../middleware/authorize');

router.get('/meta-data', authorize, getCohortsMetaData);
router.post('/create', authorize, createCohort);
router.get('/archived', authorize, getArchivedCohortsMetaData);
router.patch('/:id/update', authorize, updateCohortById);
router.get('/:id/data', authorize, getCohortDetails);
router.delete('/:id/delete', authorize, deleteCohortById);
router.patch('/:id/add-to-fav', authorize, addToFavourites);
router.patch('/:id/remove-from-fav', authorize, removeFromFavourites);
router.patch('/:id/remove-owner', authorize, removeOwner);
router.patch('/:id/remove-member', authorize, removeMember);
router.patch('/:id/set-as-owner', authorize, setAsOwner);
router.patch('/:id/set-as-member', authorize, setAsMember);
router.get('/:id/get-members', authorize, getMembers);
router.patch('/:id/add-member', authorize, addMember);

module.exports = app => app.use('/cohorts', router);
