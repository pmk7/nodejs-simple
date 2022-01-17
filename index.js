const parse = require('url-parse');
const fs = require('fs');
const http = require('http');
const slugify = require('slugify');
const { URL } = require('url');

const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////
///FILES
// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// Non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
//   console.log(data);
// });
// console.log("Will read file");

/////////////////////////////
/// SERVER

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

console.log(slugs);

const server = http.createServer((req, res) => {
  const baseUrl = `http://${req.headers.host}`;
  const reqUrl = new URL(req.url, baseUrl);

  const query = Number(reqUrl.search.split('=')[1]);
  const pathName = reqUrl.pathname;

  /// Overview Page
  if (pathName === '/' || pathName === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');

    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);

    /// Product Page
  } else if (pathName === '/product') {
    const product = dataObj.find((el) => el.id === query);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const prodHtml = replaceTemplate(tempProduct, product);
    res.end(prodHtml);

    /// API
  } else if (pathName === '/api') {
    return fs.readFile(
      `${__dirname}/dev-data/data.json`,
      'utf-8',
      (err, data) => {
        const productData = JSON.parse(data);
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(data);
      }
    );

    /// Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
    });
    res.end('<h1>Page not found!</h1>');
  }
  ///   res.end("Hello from the server side");
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
