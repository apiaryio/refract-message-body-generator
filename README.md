# Refract Message Body Generator [![CircleCI Build Status](https://circleci.com/gh/apiaryio/refract-message-body-generator.svg?style=shield)](https://circleci.com/gh/apiaryio/refract-message-body-generator)

Generates message bodies from JSON Schema found within [Refract API
Description](https://github.com/refractproject/refract-spec/blob/master/namespaces/api-description-namespace.md).

For example, it takes a message body schema asset and generates a message body
asset.

It takes a Refract element such as the following:

```json
{
  "element": "asset",
  "meta": {
    "classes": ["messageBodySchema"]
  },
  "attributes": {
    "contentType": "application/schema+json"
  },
  "content": "{\"type\": \"string\"}"
}
```

As a result, it will place the message body in-line:

```json
{
  "element": "asset",
  "meta": {
    "classes": ["messageBody"]
  },
  "attributes": {
    "contentType": "application/json"
  },
  "content": "\"ut omnis\""
}
```

## Usage

```JavaScript
import generateMessageBodies from 'refract-message-body-generator';
generateMessageBodies([Refract Element]);
```

## Installation

```shell
$ npm install @apiaryio/refract-message-body-generator
```
