const requestAllPages = require('request-all-pages');
const Promise = require('bluebird');
const rpn = require('request-promise-native');
const csvWriter = require('csv-write-stream');
const fs = require('fs');

const getAllStargazers = async (owner, repoName, clientId, clientSecret) => new Promise((resolve, reject) => {
  console.log(`Getting all stargazers for ${repoName}`);

  const requestOpts = {
    uri: `https://api.github.com/repos/${owner}/${repoName}/stargazers?client_id=${clientId}&client_secret=${clientSecret}`,
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
  console.log(`Getting all public info for ${stargazerUrls.length} stargazers`);

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

  return userProfiles
    .map(userProfile => ({
      login: userProfile.login,
      name: userProfile.name,
      company: userProfile.company,
      publicEmail: userProfile.email
    }));
};

const writeCsv = async (headers, data, output) => {
  console.log('Writing to csv...');

  const writer = csvWriter({ headers })
  writer.pipe(fs.createWriteStream(output))
  data.forEach(row => {
    writer.write(row)
  });
  writer.end()
};

const grab = async (options) => {
  const { owner, repoName, clientId, clientSecret, concurrentRequests, onlyPublicEmails } = options;

  const stargazerUrls = await getAllStargazers(owner, repoName, clientId, clientSecret);
  const publicInfo = await getPublicInfo(stargazerUrls, clientId, clientSecret, concurrentRequests);

  const headers = [
    'Login',
    'Name',
    'Company',
    'Public email',
    'Event emails'
  ];

  let rows;
  if (onlyPublicEmails) {
    rows = publicInfo
      .filter(info => info.publicEmail != null)
      .map(info => ([
        info.login,
        info.name,
        info.company,
        info.publicEmail,
        ''
      ]));
  } else {
    // TODO: add logic for getting emails from user events 
  }

  const fileName = `${owner}.${repoName}.csv`;

  await writeCsv(
    headers,
    rows,
    fileName
  );

  console.log('Writing done!');
  console.log(`All stargazers: ${publicInfo.length}`);
  console.log(`With public email: ${rows.length}`);
};

module.exports = {
  grab
}
