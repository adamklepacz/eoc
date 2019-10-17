const { EmailReportsFrequency } = require('../../common/variables');
const { getItemsForReport } = require('../../common/utils');
const { sendReport } = require('../../mailer');
const User = require('../../models/user.model');
const List = require('../../models/list.model');

const days = {
  0: EmailReportsFrequency.SUNDAY,
  1: EmailReportsFrequency.MONDAY,
  2: EmailReportsFrequency.TUESDAY,
  3: EmailReportsFrequency.WEDNESDAY,
  4: EmailReportsFrequency.THURSDAY,
  5: EmailReportsFrequency.FRIDAY,
  6: EmailReportsFrequency.SATURDAY
};

const sendReports = (agenda, jobName) => {
  agenda.define(jobName, async job => {
    const day = new Date().getDay();
    const reportDay = days[day];
    const { HOST } = process.env;

    try {
      const users = await User.find(
        { emailReportsFrequency: reportDay },
        'displayName email'
      )
        .lean()
        .exec();
      const reportsData = await Promise.all(
        users.map(async user => getItemsForReport(List, user))
      );

      await Promise.all(
        reportsData.map(async report => sendReport(HOST, report))
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });
};

module.exports = sendReports;
