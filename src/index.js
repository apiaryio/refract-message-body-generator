import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import lodash from 'lodash';
import apiDescription from 'lodash-api-description';
import jsonSchemaFaker from 'json-schema-faker';

import queryElement from './queryElement';
import { HTTP_REQUEST_QUERY, HTTP_RESPONSE_QUERY } from './queries';

// Initialize the API Description Lodash mixin.
apiDescription(lodash);

const minim = minimModule.namespace().use(minimParseResult);

const Asset = minim.getElementClass('asset');
const Annotation = minim.getElementClass('annotation');

let annotations = [];

/**
 * Takes JSON Schema and outputs a `messageBody` Refract element
 * with a generated `content` property.
 *
 * - jsonSchema (object)
 */
function createMessageBodyAssetFromJsonSchema(jsonSchema) {
  let messageBody = {};

  try {
    messageBody = jsonSchemaFaker(jsonSchema);
  } catch (e) {
    const annotation = new Annotation(e.message);
    annotation.code = 3; // Data is being lost in the conversion.
    annotation.classes.push('warning');
    annotations.push(annotation.toRefract());
  }

  const schemaAsset = new Asset(JSON.stringify(messageBody));
  schemaAsset.classes.push('messageBody');
  schemaAsset.attributes.set('contentType', 'application/json');

  return schemaAsset.toRefract();
}

function generateMessageBody(httpMessageElement) {
  const messageBodies = lodash.messageBodies(httpMessageElement);

  // If a HTTP Message contains a message body, do not
  // generate another one.
  if (messageBodies.length > 0) {
    return;
  }

  const bodySchemas = lodash.messageBodySchemas(httpMessageElement);

  bodySchemas.forEach((bodySchema) => {
    const jsonSchema = JSON.parse(bodySchema.content);

    httpMessageElement.content.push(
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
  const element = lodash.cloneDeep(refractElement);

  // First, generate message bodies for each HTTP Request.
  const httpRequestElements = queryElement(element, HTTP_REQUEST_QUERY);
  httpRequestElements.forEach(generateMessageBody);

  // Second, generate message bodies for each HTTP Response.
  const httpResponseElements = queryElement(element, HTTP_RESPONSE_QUERY);
  httpResponseElements.forEach(generateMessageBody);

  element.content.push(...annotations);
  return element;
}

export default generateMessageBodies;
