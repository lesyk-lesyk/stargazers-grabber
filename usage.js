const stargazersGrabber = require('./index');

try {
  stargazersGrabber.grab({
    uri: 'https://api.github.com/repos/Rebilly/generator-openapi-repo',
    clientId: '1307f97d56d4fa4740de',
    clientSecret: 'bf0ac69032caf8355850cb7c4c19d2137f44f2a2',
    concurrentRequests: 30,
    onlyPublicEmails: true,
    output: 'results.csv'
  });

} catch (error) {
  console.log(error);
}
