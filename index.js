const postcss = require('postcss');

const PLUGIN_NAME = 'postcss-fluid-type';

const pi = (o) => parseInt(o, 10);
const pf = (o) => parseFloat(o);

module.exports = (opts = {}) => {
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      const $opts = Object.assign(
        {
          min: '320px',
          max: '1200px',
          functionName: 'fluid',
        },
        opts
      );
      const regex = new RegExp(`${$opts.functionName}\\(([^)]+)\\)`, 'gi');

      root.walkDecls((decl) => {
        if (decl.value.indexOf(`${$opts.functionName}(`) === -1) {
          return;
        }

        decl.value = decl.value.replace(regex, (_, values /*, index*/) => {
          const { minVal, maxVal } = parseValues(values);

          // TODO: Rem
          // return `calc(${minValue} + ${maxValueInt} * (1px + ((100vw - ${$opts.min}) / (${p($opts.max)} - ${p($opts.min)})) - 1px))`;
          // Px
          return `clamp(${minVal}, ${minVal} + ${pf(maxVal) - pf(minVal)} * (100vw - ${$opts.min}) / ${pi($opts.max) - pi($opts.min)}, ${maxVal})`;
        });
      });
    }
  }
}

function parseValues(values) {
  const $values = values.split(',').map((a) => a.trim());

  return {
    minVal: $values[0],
    maxVal: $values[1],
  };
}
