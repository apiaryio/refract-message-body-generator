import lodash from 'lodash';
import { assert } from 'chai';

import generateMessageBodies from '../src/index';
import queryElement from '../src/queryElement';
import { HTTP_REQUEST_QUERY, HTTP_RESPONSE_QUERY } from '../src/queries';

describe('#generateMessageBodies', () => {
  describe('Generate a message body for a HTTP Request', () => {
    let results;

    before(() => {
      const fixture = lodash.cloneDeep(require('./fixtures/refract/param-no-response.json'));
      const element = generateMessageBodies(fixture);

      results = queryElement(element, HTTP_REQUEST_QUERY);
    });

    it('Request contains ‘messageBodySchema’ and ‘messageBody’', () => {
      assert.strictEqual(results[0].content.length, 2);
    });

    it('‘messageBodySchema’ has not been mutated', () => {
      assert.deepEqual(results[0].content[0], {
        attributes: {
          contentType: 'application/schema+json',
        },
        content: '{"type":"string"}',
        element: 'asset',
        meta: {
          classes: [
            'messageBodySchema',
          ],
        },
      });
    });

    it('‘messageBody’ element equals to ‘asset’', () => {
      assert.strictEqual(results[0].content[1].element, 'asset');
    });

    it('‘messageBody’ content equals to a string', () => {
      assert.isString(results[0].content[1].content);
    });

    it('‘messageBody’ attributes has not been mutated', () => {
      assert.deepEqual(results[0].content[1].attributes, {
        contentType: 'application/json',
      });
    });

    it('‘messageBody’ meta has not been mutated', () => {
      assert.deepEqual(results[0].content[1].meta, {
        classes: [
          'messageBody',
        ],
      });
    });
  });

  describe('Generate multiple message bodies', () => {
    let httpRequests;
    let httpResponses;

    before(() => {
      const fixture = lodash.cloneDeep(require('./fixtures/refract/params.json'));
      const element = generateMessageBodies(fixture);

      httpRequests = queryElement(element, HTTP_REQUEST_QUERY);
      httpResponses = queryElement(element, HTTP_RESPONSE_QUERY);
    });

    describe('First request', () => {
      it('First request has not been mutated', () => {
        assert.deepEqual(httpRequests[0], {
          element: 'httpRequest',
          meta: {},
          attributes: {
            method: 'GET',
          },
          content: [],
        });
      });
    });

    describe('Second request', () => {
      it('‘messageBodySchema’ has not been mutated', () => {
        assert.deepEqual(httpRequests[1].content[0], {
          element: 'asset',
          meta: {
            classes: [
              'messageBodySchema',
            ],
          },
          attributes: {
            contentType: 'application/schema+json',
          },
          content: '{"type":"string"}',
        });
      });

      it('‘messageBody’ element equals to ‘asset’', () => {
        assert.strictEqual(httpRequests[1].content[1].element, 'asset');
      });

      it('‘messageBody’ content equals to a string', () => {
        assert.isString(httpRequests[1].content[1].content);
      });

      it('‘messageBody’ attributes has not been mutated', () => {
        assert.deepEqual(httpRequests[1].content[1].attributes, {
          contentType: 'application/json',
        });
      });

      it('‘messageBody’ meta has not been mutated', () => {
        assert.deepEqual(httpRequests[1].content[1].meta, {
          classes: [
            'messageBody',
          ],
        });
      });
    });

    describe('First response', () => {
      it('First response has not been mutated', () => {
        assert.deepEqual(httpResponses[0], {
          element: 'httpResponse',
          meta: {},
          attributes: {},
          content: [],
        });
      });
    });

    describe('Second response', () => {
      it('‘messageBodySchema’ has not been mutated', () => {
        assert.deepEqual(httpResponses[1].content[0], {
          element: 'asset',
          meta: {
            classes: [
              'messageBodySchema',
            ],
          },
          attributes: {
            contentType: 'application/schema+json',
          },
          content: '{"type":"string"}',
        });
      });

      it('‘messageBody’ element equals to ‘asset’', () => {
        assert.strictEqual(httpResponses[1].content[1].element, 'asset');
      });

      it('‘messageBody’ content equals to a string', () => {
        assert.isString(httpResponses[1].content[1].content);
      });

      it('‘messageBody’ attributes has not been mutated', () => {
        assert.deepEqual(httpResponses[1].content[1].attributes, {
          contentType: 'application/json',
        });
      });

      it('‘messageBody’ meta has not been mutated', () => {
        assert.deepEqual(httpResponses[1].content[1].meta, {
          classes: [
            'messageBody',
          ],
        });
      });
    });
  });

  describe('Do not override existing message bodies', () => {
    let httpResponses;

    before(() => {
      const fixture = lodash.cloneDeep(require('./fixtures/refract/params-response-message-body.json'));
      const element = generateMessageBodies(fixture);

      httpResponses = queryElement(element, HTTP_RESPONSE_QUERY);
    });

    describe('Response containing a message body', () => {
      it('Response\'s content has not been changed', () => {
        assert.deepEqual(httpResponses[0].content, [
          {
            element: 'asset',
            meta: {
              classes: [
                'messageBodySchema',
              ],
            },
            attributes: {
              contentType: 'application/schema+json',
            },
            content: '{"type":"string"}',
          },
          {
            element: 'asset',
            meta: {
              classes: [
                'messageBody',
              ],
            },
            attributes: {
              contentType: 'application/json',
            },
            content: '"ut omnis"',
          },
        ]);
      });
    });
  });

  describe('Fallback when the Json Schema is not valid', () => {
    before(() => {
      const fixture = lodash.cloneDeep(require('./fixtures/refract/param-unknown-type.json'));
      const element = generateMessageBodies(fixture);

      const httpResponses = queryElement(element, HTTP_RESPONSE_QUERY);
      httpResponses.nasino = 0;
    });

    describe('Touch nasino', () => {
      it('Response\'s content has not been changed', () => {
        assert.deepEqual({}, {});
      });
    });
  });
});
