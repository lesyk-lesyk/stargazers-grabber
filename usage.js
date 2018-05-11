require('dotenv').config();
const stargazersGrabber = require('./index');

try {
  stargazersGrabber.grab({
    uri: 'https://api.github.com/repos/Rebilly/generator-openapi-repo',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    concurrentRequests: 30,
    onlyPublicEmails: true,
    output: 'results.csv'
  });

} catch (error) {
  console.log(error);
}
