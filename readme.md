[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com)

## Description

This is a [`gulp`](http://gulpjs.com) plugin that converts HTML files, or any
other text files, into JavaScript modules, ready to be imported with your
favourite module loader.

## Installation and Usage

In a shell:

```shell
npm i --save-dev gulp-html-to-js
```

In your `gulpfile.js`:

```javascript
var htmlToJs = require('gulp-html-to-js');

// Without concatenation.
gulp.task('views:compile', function() {
  return gulp.src('src/html/**/*')
    .pipe(htmlToJs())
    .pipe(gulp.dest('dist'));
});

// With concatenation.
gulp.task('views:compile', function() {
  return gulp.src('src/html/**/*')
    .pipe(htmlToJs({concat: 'views.js'}))
    .pipe(gulp.dest('dist'));
});
```

Without the `concat` option, each module exports the template as a string:

```html
<!-- html/index.html -->
<p>Hello world!</p>
```

```javascript
'use strict';
module.exports = '<p>Hello world!</p>';
```

With `concat`, files are grouped into one module, where templates are keyed
by file paths:

```javascript
'use strict';
module.exports = Object.create(null);
module.exports['index.html'] = '<p>Hello world!</p>';
```

In your app, import the result like so:

```typescript
import views from 'views';
```
