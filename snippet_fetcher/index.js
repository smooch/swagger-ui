const fs = require('fs-extra');
const axios = require('axios');
const marked = require('marked');
const cheerio = require('cheerio');

const data = {};

const libs = [
  {
    language: 'python',
    docsDir: 'https://github.com/smooch/smooch-python/tree/master/docs',
    rawDir: 'https://raw.githubusercontent.com/smooch/smooch-python/master/docs',
  },
  {
    language: 'ruby',
    docsDir: 'https://github.com/smooch/smooch-ruby/tree/master/docs',
    rawDir: 'https://raw.githubusercontent.com/smooch/smooch-ruby/master/docs',
  },
  {
    language: 'java',
    docsDir: 'https://github.com/smooch/smooch-java/tree/master/docs',
    rawDir: 'https://raw.githubusercontent.com/smooch/smooch-java/master/docs',
  },
];

const camel = (str) => str
  .replace(/_(.)/g, (char) => char.toUpperCase())
  .replace(/_/g, '');

async function fetchFileNames(url) {
  const response = await axios.get(url);
  const document = cheerio.load(marked(response.data));
  return document('.js-navigation-open')
    .toArray()
    .map(element => element.attribs.title)
    .filter(title => title)
    .filter(title => title.includes('Api'));
}

async function fetchSnippets(fileName, config) {
  const response = await axios.get(`${config.rawDir}/${fileName}`);
  const document = cheerio.load(marked(response.data));
  const language = config.language;
  const className = fileName.replace('Api.md', '');
  data[className] = data[className] || {};
  return document('h1')
    .toArray()
    .map(element => element.attribs.id)
    .filter(elementId => elementId)
    .filter(elementId => elementId[0] === '-')
    .map(elementId => {
      const snippet = document(`#${elementId} ~ pre`).first().text();
      const method = document(`#${elementId} > strong`).first().text();
      const id = camel(method);
      data[className][id] = data[className][id] || [];
      data[className][id].push({ language, className, snippet, method, id });
    });
}

async function parseSnippets() {
  for (const config of libs) {
    const fileNames = await fetchFileNames(config.docsDir);
    for (const fileName of fileNames) {
      const snippets = await fetchSnippets(fileName, config);
    }
  }

  await fs.writeJson('dist/snippets.json', data);
}

module.exports = parseSnippets;
