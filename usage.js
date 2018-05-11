require('dotenv').config();
const stargazersGrabber = require('./index');

const owner = 'Rebilly';
const repoName = `RebillyAPI`;

try {
  stargazersGrabber.grab({
    owner,
    repoName,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    concurrentRequests: 30,
    onlyPublicEmails: true
  });

} catch (error) {
  console.log(error);
}
