koa-hbs-seed
============

Seed website using Koa + Handlebars + LESS + jQuery.

Features
========

- Koa generators
- No "build" (committing `node_modules` is recommended)
- No routes config (scans the file system for "pages" / dynamic urls)
- Precompiles your handlebars templates (for both nodejs and browser)
- Precompiles LESS files together into a single CSS file
- Encrypted cookie-based client-side sessions


Install
=======

Node 0.11+ is required.

One-time setup:
```
npm run setup
n latest
npm install
```

Run
===

```
npm start
```

