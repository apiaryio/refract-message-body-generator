import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import lodash from 'lodash';
import apiDescription from 'lodash-api-description';
import jsonSchemaFaker from 'json-schema-faker';

import query from 'refract-query';
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

  const bodyAsset = new Asset(JSON.stringify(messageBody, null, 2));
  bodyAsset.classes.push('messageBody');
  bodyAsset.attributes.set('contentType', 'application/json');

  let refractAnnotation = {};
  if (annotation !== undefined) {
    refractAnnotation = annotation.toRefract();
  }

  return {
    bodyAsset: bodyAsset.toRefract(),
    annotation: refractAnnotation,
  };
}

function generateMessageBody(httpMessageElement) {
  const bodySchemas = lodash.messageBodySchemas(httpMessageElement);

  return bodySchemas.map((bodySchema) => {
    const jsonSchema = JSON.parse(bodySchema.content);

    const bodyAsset = createMessageBodyAssetFromJsonSchema(jsonSchema);

    if (bodyAsset.annotation !== undefined &&
        bodyAsset.attributes !== undefined &&
        bodyAsset.attributes.sourceMap !== undefined) {
      bodyAsset.annotation.attributes.sourceMap = lodash.cloneDeep(bodyAsset.attributes.sourceMap);
    }

    return bodyAsset;
  });
}

// Takes a message element in input, injects a generated message body
// if (missing) and returns generated annotations for it.
function injectMessageBody(httpMessageElement) {
  const messageBodies = lodash.messageBodies(httpMessageElement);

  // If a HTTP Message contains a message body, do not
  // generate another one.
  if (messageBodies.length > 0) {
    return [];
  }

  const generatedMessageBodies = generateMessageBody(httpMessageElement);

  httpMessageElement.content.push(...generatedMessageBodies.map(
    messageBody => messageBody.bodyAsset)
  );
  return generatedMessageBodies.map(messageBody => messageBody.annotation || {});
}

// Generates message bodies for HTTP Requests and
// HTTP Responses if there's a JSON Schema.
//
// Please note that it returns a new Refract element,
// it *does not mutate* the passed in element directly.
function generateMessageBodies(refractElement) {
  const element = lodash.cloneDeep(refractElement);

  // First, generate message bodies for each HTTP Request.
  const httpRequestElements = query(element, HTTP_REQUEST_QUERY);
  const requestAnnotations = lodash.flatten(httpRequestElements.map(injectMessageBody));

  // Second, generate message bodies for each HTTP Response.
  const httpResponseElements = query(element, HTTP_RESPONSE_QUERY);
  const responseAnnotations = lodash.flatten(httpResponseElements.map(injectMessageBody));

  // Last step, let's push all the annotations
  element.content.push(...requestAnnotations, ...responseAnnotations);
  return element;
}

export default generateMessageBodies;
