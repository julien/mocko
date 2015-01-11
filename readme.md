moco
-------

A dumb http mock utility

### Requirements

[Node.js](http://nodejs.org)

### Installation

`npm install moco`

### Usage


```
# start by passing a file path (and optional port)
node node_modules/.bin/moco **route_file.json** *port*
```

Endpoints are defined in a json file

Example

```
{
  "/api/test": {

    "headers": {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "X-Requested-With"
    },

    "statusCode": 200,

    "body": {
      "name": "Something",
      "data": [1, 2, 3, 4, 5]
    }
  }
}
```

The only required property is the `body` but you can specify `headers` and a `statusCode`


### Tests, etc...

  + Grab the dependencies

  `npm install`

  + Run the tests

  `npm test`

  + Generate coverage report

  `npm run cover`

  + Lint source code

  `npm run lint`

### License

MIT


