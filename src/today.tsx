import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

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

      if (n.name !== 'today') return;

      n.type = 'html';
      n.value = createTodayNode();
      console.log(n);
    });
  };
};

const createTodayNode = function() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const day = now.getDay();

  var html = [];
  html.push('<fieldset>');
  html.push('<legend>' + now.toISOString().slice(0, 10) + '</legend>');
  html.push(year.toString());
  html.push(progress(new Date(year, 0, 1), new Date(year + 1, 0, 1), now));
  html.push(now.toLocaleDateString('en', {month: 'long'}));
  html.push(progress(new Date(year, month, 1), new Date(year, month+1, 1), now));
  html.push(now.toLocaleDateString('en', {weekday: 'long'}));
  html.push(progress(new Date(year, month, date), new Date(year, month, date + 1), now));
  html.push('/fieldset>');

  return html.join();
}

const msecInDay = 24 * 60 * 60 * 1000;

const progress = function(start: Date, end: Date, now: Date): string {
  const total = (end.getTime() - start.getTime()) / msecInDay;
  const current = (now.getTime() - start.getTime()) / msecInDay;
  const percent = Math.floor((current / total) * 100);

  return `<meter value="${current}" min="0" max="${total}" title="${percent}% (${current}/${total})" style="width:75px">${percent}% (${current}/${total})</meter>`;
}