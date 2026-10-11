const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrasiaplast = onRequest({"region":"europe-west1","maxInstances":10,"minInstances":0}, (req, res) => server.then(it => it.handle(req, res)));
  