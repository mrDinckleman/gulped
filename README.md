# Gulped [![devDependency Status][daviddm-image]][daviddm-url]

> Project template based on [SASS](http://sass-lang.com/) and [EJS](http://ejs.co/) bundled by [Gulp](https://gulpjs.com/)

Make HTML markup easily with this project template.

Follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

## Technologies

**Views**

* [gulp-ejs](https://www.npmjs.com/package/gulp-ejs) for creating static html-pages
* [gulp-data](https://www.npmjs.com/package/gulp-data) for filling ejs-templates with data from json-files

**Styles**

* [gulp-sass](https://www.npmjs.com/package/gulp-sass) for compiling scss files
* [gulp-postcss](https://www.npmjs.com/package/gulp-postcss) for transforming styles with plugins:
  + [postcss-import](https://www.npmjs.com/package/postcss-import) for inline third-party CSS content
  + [autoprefixer](https://www.npmjs.com/package/autoprefixer) for adding vendor prefixes
  + [cssnano](https://www.npmjs.com/package/cssnano) for minifying css
* [sanitize.css](https://www.npmjs.com/package/sanitize.css) for styles normalizations

**Scripts**

* [gulp-bro](https://www.npmjs.com/package/gulp-bro) for scripts bundling
* [@babel/core](https://www.npmjs.com/package/@babel/core), [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env), [@babel/register](https://www.npmjs.com/package/@babel/register), [babelify](https://www.npmjs.com/package/babelify) for transpiling ES6 code
* [gulp-terser](https://www.npmjs.com/package/gulp-terser) for minifying javascript

**Images**

* [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) for minifying images

**Development**

* [gulp](https://www.npmjs.com/package/gulp) for project bundling
* [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) for source map support
* [gulp-header](https://www.npmjs.com/package/gulp-header) for adding banner in styles and scripts
* [gulp-if](https://www.npmjs.com/package/gulp-if) for conditionally running of tasks
* [multipipe](https://www.npmjs.com/package/multipipe) for grouping conditional tasks
* [through2](https://www.npmjs.com/package/through2) for custom pipes
* [gulp-notify](https://www.npmjs.com/package/gulp-notify) for error notification
* [gulp-cached](https://www.npmjs.com/package/gulp-cached), [gulp-progeny](https://www.npmjs.com/package/gulp-progeny) for incremental build
* [eslint](https://www.npmjs.com/package/eslint), [eslint-config-airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base), [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import), [babel-preset-airbnb](https://www.npmjs.com/package/babel-preset-airbnb) for codestyle
* [gulp-rename](https://www.npmjs.com/package/gulp-rename) for renaming minifyed files
* [browser-sync](https://www.npmjs.com/package/browser-sync) for real-time browser testing
* [del](https://www.npmjs.com/package/del) for clearing build directory
* [gulp-zip](https://www.npmjs.com/package/gulp-zip) for production files packing
* [yargs](https://www.npmjs.com/package/yargs) for parsing command line arguments

## File structure

    .
    ├── app               # Source files
    │   ├── fonts         # Fonts
    │   ├── images        # Images
    │   ├── js            # JS files
    │   ├── scss          # SCSS files
    │   ├── static        # Static files
    │   └── views         # EJS files
    ├── public            # Compiled files
    │   └── assets
    │       ├── css       # CSS files
    │       ├── images    # Images
    │       ├── fonts     # Fonts
    │       └── js        # JS files
    └── release           # ZIP-archives with compiled files

## Usage

Install Node.js.

Install Gulp CLI:

    $ npm install gulp-cli -g

Clone repo and install dependencies:

    $ git clone https://github.com/mrDinckleman/gulped project
    $ cd project
    $ npm install

Change name, version, homepage and author information in `package.json` because they appear in banner.

Then run `npm run start` to run the project. A new browser window will open with a BrowserSync server showing the finished files.

Run `npm run build` for building version for production.

Commands `npm run styles` and `npm run scripts` build production versions for styles and script respectively.

**Views**

To add global template data, specify it in `app/views/global.json`.

To add new template like `page.ejs`, place it to the `app/views` directory. You can add associated data to `page.json`.

**Scripts**

To add vendor scripts, just import it in `app/scripts/app.js` like:

    import $ from 'jquery';

**Static**

Files, placed in `app/static` directory will be copied to the root of `public` directory. Use it for favicon, robots.txt or other similar files.

[daviddm-image]: https://david-dm.org/mrDinckleman/gulped/dev-status.svg
[daviddm-url]: https://david-dm.org/mrDinckleman/gulped?type=dev
