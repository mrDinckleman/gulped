# Gulped

> Project template based on [SASS](http://sass-lang.com/) and [EJS](http://ejs.co/) builded with [Gulp](https://gulpjs.com/)

Make HTML markup easily with this project template.

## Technologies

**Views**

* [gulp-ejs](https://github.com/rogeriopvl/gulp-ejs) for creating static html-pages
* [gulp-data](https://github.com/colynb/gulp-data) for filling ejs-templates with data from json-files
* [gulp-htmlcomb](https://github.com/fengyuanchen/gulp-htmlcomb) for sorting html-attributes in accordance with [Code Guide](http://codeguide.co/#html-attribute-order) from [@mdo](https://github.com/mdo)

**Styles**

* [gulp-sass](https://github.com/dlmanning/gulp-sass) for styles
* [gulp-postcss](https://github.com/postcss/gulp-postcss) for transforming styles with plugins:
  + [postcss-import](https://github.com/postcss/postcss-import) for inline third-party CSS content
  + [autoprefixer](https://github.com/postcss/autoprefixer) for adding vendor prefixes
  + [cssnano](https://github.com/ben-eb/cssnano) for minifying css
* [sanitize.css](https://github.com/jonathantneal/sanitize.css) for styles normalizations
  + Notice: have been also considered [jonathantneal/normalize.css](https://github.com/jonathantneal/normalize.css) and [necolas/normalize.css](https://github.com/necolas/normalize.css)
* [gulp-csscomb](https://github.com/koistya/gulp-csscomb) for sorting css-properties in accordance with [Code Guide](http://codeguide.co/#css-declaration-order) from [@mdo](https://github.com/mdo)

**Scripts**

* [gulp-concat](https://github.com/gulp-community/gulp-concat) for scripts concatenation
* [gulp-uglify](https://github.com/terinjokes/gulp-uglify) for minifying javascript

**Images**

* [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin) for minifying images

**Development**

* [gulp](https://github.com/gulpjs/gulp) for project building
* [gulp-sourcemaps](https://github.com/gulp-sourcemaps/gulp-sourcemaps) for source map support
* [gulp-header](https://github.com/tracker1/gulp-header) for adding banner in styles and scripts
* [gulp-if](https://github.com/robrich/gulp-if) for conditionally running a tasks
* [multipipe](https://github.com/juliangruber/multipipe) for grouping conditional tasks
* [gulp-rename](https://github.com/hparra/gulp-rename) for renaming minifyed files
* [browser-sync](https://github.com/BrowserSync/browser-sync) for real-time browser testing
* [del](https://github.com/sindresorhus/del) for clearing build directory
* [gulp-zip](https://github.com/sindresorhus/gulp-zip) for production files packing

## File structure

    .
    ├── app               # Source files
    │   ├── fonts         # Fonts
    │   ├── images        # Images
    │   ├── scripts       # JS files
    │   ├── static        # Static files
    │   ├── styles        # SCSS files
    │   └── views         # EJS files
    ├── public            # Compiled files
    │   └── assets
    │       ├── css       # CSS files
    │       ├── images    # Images
    │       ├── fonts     # Fonts
    │       └── js        # JS files
    └── release           # ZIP-archives with compiled files
 
## Usage

Install node.js.
* Notice: not tested with versions other than node.js 9.4.0 (64-bit) and npm 5.6.0.

Install Gulp CLI:

    $ npm install gulp-cli -g

Clone repo and install dependencies:

    $ git clone https://github.com/mrDinckleman/gulped project
    $ cd project
    $ npm install

Change name, version, homepage and author information in `package.json` because they appear in banner.

Then run `npm run start` to run the project. A new browser window will open with a BrowserSync server showing the finished files.

Run `npm run build` for building version for production.
* Notice: for using this project template not on OS Windows, change `build` script in `package.json` to:

      ...
      "build": "NODE_ENV=production gulp build",
      ...

**Views**

To add global template data, specify it in `app/views/global.json`.

To add new template like `page.ejs`, place it to the `app/views` directory. You can add associated data to `page.json`.

**Scripts**

To add vendor scripts, specify them in `app/scripts/imports.json` with paths relative to this directory, like:

    {
      "src": [
        "../../node_modules/vendor-plugin/index.js"
      ]
    }

**Static**

Files, placed in `app/static` directory will be copied to the root of `public` directory. Use it for favicon, robots.txt or other similar files.
