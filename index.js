const postcss = require('postcss');

const pi = (o) => parseInt(o, 10);
const pf = (o) => parseFloat(o);

module.exports = postcss.plugin('postcss-transition', (opts) => (root) => {
  const $opts = Object.assign(
    {
      min: '320px',
      max: '1200px',
      functionName: 'fluid',
    },
    opts
  );
  const regex = new RegExp(`${$opts.functionName}\\(([^)]+)\\)`, 'gi');
  const medias = [];

  root.walkDecls((decl) => {
    if (decl.value.indexOf(`${$opts.functionName}(`) === -1) {
      return;
    }

    let min = decl.value.replace(regex, (_, values) => values.split(',').map((a) => a.trim())[0]);
    let max = decl.value.replace(regex, (_, values) => values.split(',').map((a) => a.trim())[1]);

    const value = decl.value.replace(regex, (_, values) => {
      const { minVal, maxVal } = parseValues(values);

      return `calc(${minVal} + ${pf(maxVal) - pf(minVal)} * (100vw - ${$opts.min}) / ${pi($opts.max) - pi($opts.min)})`;
      // TODO: Rem
      // `calc(${minValue} + ${maxValueInt} * (1px + ((100vw - ${$opts.min}) / (${p($opts.max)} - ${p($opts.min)})) - 1px))`
    });

    medias.push({
      selector: decl.parent.selector,
      prop: decl.prop,
      value,
    });

    decl.remove();
  });

  if (medias.length) {
    addMediaRules(root, `(min-width: ${$opts.min}) and (max-width: ${$opts.max})`, medias);
  }
});

function addMediaRules(root, params, children) {
  const m = postcss.atRule({ name: 'media', params });

  let selectors = {};

  for (let ch of children) {
    if (!selectors[ch.selector]) {
      selectors[ch.selector] = [{ prop: ch.prop, value: ch.value }];
    } else {
      selectors[ch.selector].push({ prop: ch.prop, value: ch.value });
    }
  }

  for (let selector in selectors) {
    const r = postcss.rule({ selector: selector });

    for (let i of selectors[selector]) {
      const v = postcss.decl({ prop: i.prop, value: i.value });
      r.append(v);
    }

    m.append(r);
  }

  root.append(m);
}

function parseValues(values) {
  const $values = values.split(',').map((a) => a.trim());

  return {
    minVal: $values[0],
    maxVal: $values[1],
  };
}
