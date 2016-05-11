# documentation-wrapper

[documentationjs](https://github.com/documentationjs/documentation "documentation") wrapper command line tool.

## Why?

-   documentationjs not allow to customize output of `build -f md` or `readme`.
-   documentation-wrapper replace documentationjs's internal markdown template with `simple-markdown-ast.js`

## Install

Install with [npm](https://www.npmjs.com/):

    npm install -g documentation-wrapper

## Usage

Same with [documentationjs](https://github.com/documentationjs/documentation "documentation")

    documentation-wrapper build -f md lib/markdown/simple-markdown-ast.js

## Example Output

### `commentsToAST(comments: Array<Object>, opts: Object, callback: Function): undefined`

Given a hierarchy-nested set of comments, generate an remark-compatible
Abstract Syntax Tree usable for generating Markdown output

**Parameters**

-   `comments`:**[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** - nested comment
-   `opts`:**[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** - currently none accepted
-   `callback`:**[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** - called with AST

**Returns**:**[undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)**

### `generate(depth: number, comment: Object): Object`

Generate an AST chunk for a comment at a given depth: this is
split from the main function to handle hierarchially nested comments

**Parameters**

-   `depth`:**[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** - nesting of the comment, starting at 1
-   `comment`:**[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** - a single comment

**Returns**:**[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** - remark-compatible AST

## Changelog

See [Releases page](https://github.com/azu/documentation-wrapper/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.
For bugs and feature requests, [please create an issue](https://github.com/azu/documentation-wrapper/issues).

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request :D

## Author

-   [github/azu](https://github.com/azu)
-   [twitter/azu_re](http://twitter.com/azu_re)

## License

MIT © azu
