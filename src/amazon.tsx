import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import './amazon.css'

interface GrowiNode extends Node {
  name: string;
  type: string;
  attributes: {[key: string]: string}
  children: GrowiNode[];
  value: string;
}

export const plugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      const n = node as unknown as GrowiNode;

      if (n.name !== 'amazon') return;

      console.log('amazon plugin:', n);
      const asin = n.attributes['asin'];
      const title = n.attributes['title'];
      const url = n.attributes['url'];

      // UUIDを計算する
      const uuid = "amazon-" + Math.random().toString(36).slice(2);

      // GrowiNode の value には、複雑な HTML を直接書けないため、id 属性を付与してから
      // DOM 上で書き換える方法を取る
      n.type = 'html';
      n.value = `<div id="${uuid}"></div>`

      const id = setInterval(() => {
        if (document.querySelector('#' + uuid) != null) {
          document.querySelector('#' + uuid)!.innerHTML = createAmazon(asin, title, url);
          clearInterval(id);
        }
      }, 100);
    });
  };
};

const getAsin = (href: string): string => {
  try {
    // https://www.amazon.co.jp/%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3Node-js-%E4%BB%8A%E6%9D%91-%E8%AC%99%E5%A3%AB/dp/4873119235/
    const url = new URL(href);
    if (url.host === 'www.amazon.co.jp') {
      const asin = url.pathname.split('/')[3]
      if (asin) return asin;
    }
  }
  catch (e) {
    // do nothing
  }
  return "";
};

const getTitle = (href: string): string => {
  try {
    // https://www.amazon.co.jp/%E3%83%8F%E3%83%B3%E3%82%BA%E3%82%AA%E3%83%B3Node-js-%E4%BB%8A%E6%9D%91-%E8%AC%99%E5%A3%AB/dp/4873119235/
    const url = new URL(href);
    if (url.host === 'www.amazon.co.jp') {
      const title = decodeURI(url.pathname.split('/')[1]);
      if (title) return title;
    }
  }
  catch (e) {
    // do nothing
  }
  return "";
};

const isbn10to13 = (code : string) : string => {
  const newCode="978" + code.substring(0,9);
  return newCode + checksum13(newCode);
}

const isbn13to10 = (code : string) : string => {
  const oldCode = code.substring(3,12);
  return oldCode + checksum10(oldCode);
}

const isIsbn10 = (code : string) : boolean => {
  return code.endsWith(checksum10(code));
}

const isIsbn13 = (code : string) : boolean => {
  return code.endsWith(checksum13(code));
}

const checksum10 = (code : string) : string => {
  let sum=0;
  for( let cnt=0 ; cnt<9 ; cnt++ ){
    sum=sum + (code.charCodeAt(cnt)-'0'.charCodeAt(0)) * (10-cnt);
  }
  const checksum = ( 11 - (sum % 11) );
  return checksum == 10 ? "X" : String.fromCharCode('0'.charCodeAt(0) + checksum);
}

const checksum13 = (code : string) : string => {
  var sum=0;
  for(let cnt=0 ; cnt<12 ; cnt++ ){
    sum=sum + (code.charCodeAt(cnt) - '0'.charCodeAt(0)) * (cnt%2==0 ? 1 : 3);
  }
  const checksum = ( 10 - (sum % 10) );
  return String.fromCharCode('0'.charCodeAt(0) + checksum);
};

const createAmazon = function(asin: string, title: string, url: string) : string  {
  if (url) {
    const extractedAsin = getAsin(url);
    const extractedTitle = getTitle(url);
    if (isIsbn10(extractedAsin)) {
      const isbn13 = isbn10to13(extractedAsin);
      return _createAmazonBook(isbn13, title || extractedTitle, url);
    } else if (isIsbn13(extractedAsin)) {
      return _createAmazonBook(extractedAsin, title || extractedTitle, url);
    } else {
      return _createAmazonItem(extractedAsin, title || extractedTitle, url);
    }
  }
  if (isIsbn10(asin)) {
    const isbn13 = isbn10to13(asin);
    const amazonUrl = `https://www.amazon.co.jp/dp/${asin}`;
    return _createAmazonBook(isbn13, title, amazonUrl);
  } else if (isIsbn13(asin)) {
    const isbn10 = isbn13to10(asin);
    const amazonUrl = `https://www.amazon.co.jp/dp/${isbn10}`;
    return _createAmazonBook(asin, title, amazonUrl);
  } else {
    const amazonUrl = `https://www.amazon.co.jp/dp/${asin}`;
    return _createAmazonItem(asin, title, amazonUrl);
  }
}

const _createAmazonBook = function(isbn13: string, title: string, url: string) : string  {

  const html = [];
  html.push(`<div class="amazon">`);
  html.push(`<a href="${ url }">`)
  html.push(`<img src="https://img.hanmoto.com/bd/img/${ isbn13 }.jpg"/>`)
  html.push(`<br>`);
  html.push(`${ title ? title : isbn13 }`);
  html.push(`</a>`);
  html.push(`</div>`);

  return html.join('');
}

const _createAmazonItem = function(asin: string, title: string, url: string) : string  {

  const html = [];
  html.push(`<div class="amazon">`);
  html.push(`<a href="${ url }">`)
  html.push(`${ title ? title : asin }`);
  html.push(`</a>`);
  html.push(`</div>`);

  return html.join('');
}