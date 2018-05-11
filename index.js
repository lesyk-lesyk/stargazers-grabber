const requestAllPages = require('request-all-pages');
const Promise = require('bluebird');
const rpn = require('request-promise-native');

const clientId = '1307f97d56d4fa4740de';
const clientSecret = 'bf0ac69032caf8355850cb7c4c19d2137f44f2a2';

const getAllStargazers = (uri) => new Promise((resolve, reject) => {
  const requestOpts = {
    uri: `${uri}/stargazers?client_id=${clientId}&client_secret=${clientSecret}`,
    json: true,
    body: {},
    headers: { 'user-agent': 'request-all-pages' }
  };

  requestAllPages(requestOpts, { startPage: 1, pagesPer: 100 }, (err, pages) => {
    if (err) reject(err);

    const userUrls = pages
      .reduce((acc, page) => {
        acc = acc.concat(page.body.map(user => user.url));
        return acc;
      }, []);

    resolve(userUrls);
  });
});

const uri = `https://api.github.com/repos/Rebilly/generator-openapi-repo`;

getAllStargazers(uri)
  .then(userUrls => {
    const concurentItems = 10;
    return Promise.map(userUrls, userUrl => (
      rpn({
        uri: userUrl,
        qs: {
          client_id: clientId,
          client_secret: clientSecret
        },
        headers: {
          'User-Agent': 'Request-Promise'
        },
        json: true
      })
    ), { concurrency: concurentItems })
  })
  .then(userProfiles => {
    console.log('Stargazers count: %d', userProfiles.length);
    const emails = userProfiles
      .map(userProfile => userProfile.email)
      .filter(email => email != null);

    console.log('Public email count: %d', emails.length);
    console.log(emails);
  })
  .catch(err => console.log(err));
