const {
  CohortActionTypes,
  CohortHeaderStatusTypes
} = require('../common/variables');
const Cohort = require('../models/cohort.model');
const { responseWithCohort } = require('../common/utils');
const { emitCohortMetaData } = require('./helpers');

const addCohortMember = (socket, clients) =>
  socket.on(CohortActionTypes.ADD_MEMBER_SUCCESS, data => {
    const { cohortId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortActionTypes.ADD_MEMBER_SUCCESS, data);

    if (clients.size > 0) {
      emitCohortMetaData(socket, clients, cohortId);
    }
  });

const leaveCohort = (socket, clients) =>
  socket.on(CohortActionTypes.LEAVE_SUCCESS, data => {
    const { cohortId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortActionTypes.REMOVE_MEMBER_SUCCESS, data);

    if (clients.size > 0) {
      emitCohortMetaData(cohortId, clients, socket);
    }
  });

const addOwnerRoleInCohort = (socket, clients) => {
  socket.on(CohortActionTypes.ADD_OWNER_ROLE_SUCCESS, data => {
    const { cohortId, userId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortActionTypes.ADD_OWNER_ROLE_SUCCESS, {
        ...data,
        isCurrentUserRoleChanging: false
      });

    if (clients.has(userId)) {
      socket.broadcast
        .to(clients.get(userId))
        .emit(CohortActionTypes.ADD_OWNER_ROLE_SUCCESS, {
          ...data,
          isCurrentUserRoleChanging: true
        });
    }
  });
};

const removeOwnerRoleInCohort = (socket, clients) => {
  socket.on(CohortActionTypes.REMOVE_OWNER_ROLE_SUCCESS, data => {
    const { cohortId, userId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortActionTypes.REMOVE_OWNER_ROLE_SUCCESS, {
        ...data,
        isCurrentUserRoleChanging: false
      });

    if (clients.has(userId)) {
      socket.broadcast
        .to(clients.get(userId))
        .emit(CohortActionTypes.REMOVE_OWNER_ROLE_SUCCESS, {
          ...data,
          isCurrentUserRoleChanging: true
        });
    }
  });
};

const updateCohort = (socket, allCohortsViewClients) => {
  socket.on(CohortActionTypes.UPDATE_SUCCESS, data => {
    const { cohortId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortActionTypes.UPDATE_SUCCESS, data);

    if (allCohortsViewClients.size > 0) {
      Cohort.findOne({
        _id: cohortId
      })
        .lean()
        .exec()
        .then(doc => {
          if (doc) {
            const { memberIds } = doc;
            const cohort = responseWithCohort(doc);

            memberIds.forEach(id => {
              const memberId = id.toString();

              if (allCohortsViewClients.has(memberId)) {
                socket.broadcast
                  .to(allCohortsViewClients.get(memberId))
                  .emit(CohortActionTypes.UPDATE_SUCCESS, cohort);
              }
            });
          }
        });
    }
  });
};

const updateCohortHeaderStatus = socket => {
  socket.on(CohortHeaderStatusTypes.UNLOCK, data => {
    const { cohortId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortHeaderStatusTypes.UNLOCK, data);
  });

  socket.on(CohortHeaderStatusTypes.LOCK, data => {
    const { cohortId } = data;

    socket.broadcast
      .to(`cohort-${cohortId}`)
      .emit(CohortHeaderStatusTypes.LOCK, data);
  });
};

module.exports = {
  addCohortMember,
  addOwnerRoleInCohort,
  leaveCohort,
  removeOwnerRoleInCohort,
  updateCohort,
  updateCohortHeaderStatus
};
