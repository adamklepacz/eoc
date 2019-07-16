const io = require('socket.io');
const passportSocketIo = require('passport.socketio');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const cookieParser = require('cookie-parser');

const sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection
});
const {
  addComment,
  addItemToList,
  addListMember,
  addMemberRoleInList,
  addOwnerRoleInList,
  archiveItem,
  deleteItem,
  removeMemberRoleInList,
  removeOwnerRoleInList,
  restoreItem,
  sendListsOnAddCohortMember,
  updateItemState,
  updateItem
} = require('./list');
const {
  addCohortMember,
  addOwnerRoleInCohort,
  removeOwnerRoleInCohort
} = require('./cohort');

const socketListenTo = server => {
  const ioInstance = io(server, { forceNew: true });

  ioInstance.use(
    passportSocketIo.authorize({
      key: 'connect.sid',
      secret: process.env.EXPRESS_SESSION_KEY,
      store: sessionStore,
      passport,
      cookieParser
    })
  );

  const cohortViewClients = new Map();
  const allCohortsViewClients = new Map();
  const dashboardViewClients = new Map();
  const listViewClients = new Map();

  ioInstance.on('connection', socket => {
    const {
      request: { user }
    } = socket;
    const userExist = user || false;

    if (!userExist) {
      return;
    }

    socket.on('joinSackRoom', data => {
      const { room, userId } = data;

      socket.join(room);
      listViewClients.set(userId, socket.id);
    });

    socket.on('leaveSackRoom', data => {
      const { room, userId } = data;

      socket.leave(room);
      listViewClients.delete(userId, socket.id);
    });

    socket.on('joinCohortRoom', data => {
      const { room, userId } = data;

      socket.join(room);
      cohortViewClients.set(userId, socket.id);
    });

    socket.on('leaveCohortRoom', data => {
      const { room, userId } = data;

      socket.leave(room);
      cohortViewClients.delete(userId, socket.id);
    });

    socket.on('enterCohortsView', userId =>
      allCohortsViewClients.set(userId, socket.id)
    );

    socket.on('leaveCohortsView', userId =>
      allCohortsViewClients.delete(userId)
    );

    socket.on('enterDashboardView', userId =>
      dashboardViewClients.set(userId, socket.id)
    );

    socket.on('leaveDashboardView', userId =>
      dashboardViewClients.delete(userId)
    );

    socket.on('error', () => {
      /* Ignore error.
       * Don't show any information to a user
       * on the client app, because sockets are
       * not the main feature in this app
       */
    });

    addItemToList(socket);
    addListMember(socket, dashboardViewClients, cohortViewClients);
    addMemberRoleInList(socket, listViewClients);
    addOwnerRoleInList(socket, listViewClients);
    archiveItem(socket);
    updateItemState(socket);
    deleteItem(socket);
    removeMemberRoleInList(socket, listViewClients);
    removeOwnerRoleInList(socket, listViewClients);
    restoreItem(socket);
    updateItem(socket);
    addComment(socket);
    sendListsOnAddCohortMember(socket, dashboardViewClients);

    addCohortMember(socket, allCohortsViewClients);
    addOwnerRoleInCohort(socket, cohortViewClients);
    removeOwnerRoleInCohort(socket, cohortViewClients);
  });
};

module.exports = socketListenTo;
