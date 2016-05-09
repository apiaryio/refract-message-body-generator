import lodash from 'lodash';
import { assert } from 'chai';

import generateMessageBodies from '../src/index';
import query from 'refract-query';
import { HTTP_REQUEST_QUERY, HTTP_RESPONSE_QUERY, ANNOTATION_QUERY } from '../src/queries';

const paramsFixture = require('./fixtures/refract/params.json');
const noResponseFixture = require('./fixtures/refract/param-no-response.json');
const messageBodyFixture = require('./fixtures/refract/params-response-message-body.json');
const unknownTypeFixture = require('./fixtures/refract/param-unknown-type.json');

describe('#generateMessageBodies', () => {
  describe('Generate a message body for a HTTP Request', () => {
    let results;

    before(() => {
      const fixture = lodash.cloneDeep(noResponseFixture);
      const element = generateMessageBodies(fixture);

      results = query(element, HTTP_REQUEST_QUERY);
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
      const fixture = lodash.cloneDeep(paramsFixture);
      const element = generateMessageBodies(fixture);

      httpRequests = query(element, HTTP_REQUEST_QUERY);
      httpResponses = query(element, HTTP_RESPONSE_QUERY);
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
      const fixture = lodash.cloneDeep(messageBodyFixture);
      const element = generateMessageBodies(fixture);

      httpResponses = query(element, HTTP_RESPONSE_QUERY);
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
    let httpRequestes;
    let annotations;

    before(() => {
      const fixture = lodash.cloneDeep(unknownTypeFixture);
      const element = generateMessageBodies(fixture);
      httpRequestes = query(element, HTTP_REQUEST_QUERY);
      annotations = query(element, ANNOTATION_QUERY);
    });

    it('Request contains an empty body', () => {
      assert.deepEqual(httpRequestes[0].content, [
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
          content: '{"type":"file"}',
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
          content: '{}',
        },
      ]);
    });

    it('Parse result object should have an annotation', () => {
      assert.equal(annotations.length, 1);
    });
  });
});
