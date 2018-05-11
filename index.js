const requestAllPages = require('request-all-pages');
const Promise = require('bluebird');
const rpn = require('request-promise-native');

const getAllStargazers = async (uri, clientId, clientSecret) => new Promise((resolve, reject) => {
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

const getPublicInfo = async (stargazerUrls, clientId, clientSecret, concurrentRequests) => {
  const userProfiles = await Promise.map(stargazerUrls, stargazerUrl => (
    rpn({
      uri: stargazerUrl,
      qs: {
        client_id: clientId,
        client_secret: clientSecret
      },
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    })
  ), { concurrency: concurrentRequests || 30 });

  // console.log('Stargazers count: %d', userProfiles.length);

  return userProfiles
    .map(userProfile => ({
      login: userProfile.login,
      name: userProfile.name,
      publicEmail: userProfile.email,
      company: userProfile.company,
      profileUrl: userProfile.url
    }));
};

const grab = async (options) => {
  const { uri, clientId, clientSecret, output, concurrentRequests, onlyPublicEmails } = options;

  const stargazerUrls = await getAllStargazers(uri, clientId, clientSecret);
  const publicInfo = await getPublicInfo(stargazerUrls, clientId, clientSecret, concurrentRequests);

  console.log(publicInfo);
};


module.exports = {
  grab
}
