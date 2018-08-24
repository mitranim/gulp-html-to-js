## Overview

A [`gulp`](http://gulpjs.com) plugin that converts arbitrary text files into JavaScript modules. Not limited to HTML.

## Installation

```sh
npm i -E gulp-html-to-js
# or
yarn add -E gulp-html-to-js
```

## Usage

In your `gulpfile.js`:

```js
const htmlToJs = require('gulp-html-to-js')

// Without concatenation
gulp.task('html:compile', () => (
  gulp.src('src/html/**/*')
    .pipe(htmlToJs())
    .pipe(gulp.dest('dist'))
))

// With concatenation
gulp.task('html:compile', () => (
  gulp.src('src/html/**/*')
    .pipe(htmlToJs({concat: 'html.js'}))
    .pipe(gulp.dest('dist'))
))
```

Without the `concat` option, each module exports a single string:

```html
<p>Hello world!</p>
```

Becomes:

```js
module.exports = '<p>Hello world!</p>'
```

With `concat`, files are grouped into one module, where strings are keyed by file paths:

```js
module.exports = Object.create(null)
module.exports['index.html'] = '<p>Hello world!</p>'
```

In your app, import the result like so (directory nesting depends on your build configuration):

```js
import html from './html.js'
// or
const html = require('./html.js')
```

## Options

See the `concat` option above. You can also modify it with:

* `prefix`: Prepends a path prefix to all keys of the resulting module object.

For `{prefix: 'templates'}` the resulting file from the above example is:

```js
module.exports = Object.create(null)
module.exports['templates/index.html'] = '<p>Hello world!</p>'
```

* `global`: Requires `concat`. Assigns the resulting object to some global identifier other than `module.exports` (default).

For `{global: 'window.templates', concat: 'templates.js'}` the example above would produce this:

```js
window.templates = Object.create(null)
window.templates['index.html'] = '<p>Hello world!</p>'
```
