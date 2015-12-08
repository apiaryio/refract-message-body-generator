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

/**
 * Takes JSON Schema and outputs a `messageBody` Refract element
 * with a generated `content` property.
 *
 * - jsonSchema (object)
 */
function createMessageBodyAssetFromJsonSchema(jsonSchema) {
  let messageBody = {};
  let annotation = undefined;

  try {
    messageBody = jsonSchemaFaker(jsonSchema);
  } catch (e) {
    annotation = new Annotation(e.message);
    annotation.code = 3; // Data is being lost in the conversion.
    annotation.classes.push('warning');
  }

  const schemaAsset = new Asset(JSON.stringify(messageBody));
  schemaAsset.classes.push('messageBody');
  schemaAsset.attributes.set('contentType', 'application/json');

  let annotationRefract = {};
  if (annotation !== undefined) {
    annotationRefract = annotation.toRefract();
  }

  return {
    schemaAsset: schemaAsset.toRefract(),
    annotation: annotationRefract,
  };
}

function generateMessageBody(httpMessageElement) {
  const messageBodies = lodash.messageBodies(httpMessageElement);

  // If a HTTP Message contains a message body, do not
  // generate another one.
  if (messageBodies.length > 0) {
    return {};
  }

  const bodySchemas = lodash.messageBodySchemas(httpMessageElement);

  return bodySchemas.map((bodySchema) => {
    const jsonSchema = JSON.parse(bodySchema.content);

    const bodyAsset = createMessageBodyAssetFromJsonSchema(jsonSchema);

    httpMessageElement.content.push(
      bodyAsset.schemaAsset
    );

    return bodyAsset.annotation;
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
  const requestAnnotations = lodash.flatten(httpRequestElements.map(generateMessageBody));

  // Second, generate message bodies for each HTTP Response.
  const httpResponseElements = queryElement(element, HTTP_RESPONSE_QUERY);
  const responseAnnotations = lodash.flatten(httpResponseElements.map(generateMessageBody));

  element.content.push(...requestAnnotations, ...responseAnnotations);
  return element;
}

export default generateMessageBodies;
