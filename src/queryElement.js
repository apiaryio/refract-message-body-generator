import lodash from 'lodash';

/**
 * Queries the whole Refract tree and finds a respective
 * element(s) which matches the query.
 */
function queryElement(element, query) {
  if (!element.content) {
    return [];
  }

  if (!lodash.isArray(element.content)) {
    return [];
  }

  let results = lodash.where(element.content, query);

  return lodash
    .chain(element.content)
    .map(function(element) {
      return queryElement(element, query);
    })
    .flatten()
    .concat(results)
    .value()
}

export default queryElement;
