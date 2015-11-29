import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import lodash from 'lodash';
import apiDescription from 'lodash-api-description';
import jsonSchemaFaker from 'json-schema-faker'

import queryElement from './queryElement'

// Initialize the API Description Lodash mixin.
apiDescription(lodash);

const minim = minimModule.namespace().use(minimParseResult);

const Asset = minim.getElementClass('asset');

const query = {
  element: 'httpRequest'
};

/**
 * Takes JSON Schema and outputs a `messageBody` Refract element
 * with a generated `content` property.
 *
 * - jsonSchema (object)
 */
function createMessageBodyAssetFromJsonSchema(jsonSchema) {
  const messageBody = jsonSchemaFaker(jsonSchema);

  const schemaAsset = new Asset(JSON.stringify(messageBody));
  schemaAsset.classes.push('messageBody');
  schemaAsset.attributes.set('contentType', 'application/json');

  return schemaAsset.toRefract();
}

function generateMessageBody(httpRequestElement) {
  const bodySchemas = lodash.messageBodySchemas(httpRequestElement);

  bodySchemas.forEach(function(bodySchema) {
    const jsonSchema = JSON.parse(bodySchema.content);

    httpRequestElement.content.push(
      createMessageBodyAssetFromJsonSchema(jsonSchema)
    );
  });
}

// Generates message bodies for HTTP Requests and
// HTTP Responses if there's a JSON Schema.
//
// Please note that it returns a new Refract element,
// it *does not mutate* the passed in element directly.
function generateMessageBodies(refractElement) {
  let element = _.cloneDeep(refractElement);

  // First, generate message bodies for each HTTP Request.
  let httpRequestElements = queryElement(element, HTTP_REQUEST_QUERY);
  httpRequestElements.forEach(generateMessageBody);

  return element;
}

export default generateMessageBodies;
