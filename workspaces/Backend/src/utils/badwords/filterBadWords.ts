// | bad-words package | to custom see https://www.npmjs.com/package/bad-words

export function filterBadWords(text: string): string {
  if (text === null || text.trim() === '') return '';
  else if (!/\w/.test(text)) return text;
  else {
    var Filter = require('bad-words');
    var filter = new Filter();

    return filter.clean(text);
  }
}

/*
[!] Regular expression : / regexp /

https://regex101.com/
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions

\w matches any word character (equivalent to [a-zA-Z0-9_])
[a-z] + [A-Z] + [0-9] + '_' (underscore)


*/
