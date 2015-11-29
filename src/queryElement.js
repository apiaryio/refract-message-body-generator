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

  const results = lodash.where(element.content, query);

  return lodash
    .chain(element.content)
    .map((nestedElement) => {
      return queryElement(nestedElement, query);
    })
    .flatten()
    .concat(results)
    .value();
}

export default queryElement;
