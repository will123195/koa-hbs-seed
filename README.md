koa-hbs-seed
============

Seed website using koa + handlebars + jquery.

Features
========

- No "build" (commit node_modules is recommended)
- No route config (scans the file system for "pages" / dynamic urls)
- Precompiles your handlebars templates (for both nodejs and browser)
- Precompiles LESS files into a single CSS file
- Encrypted client-side sessions


Install
=======

Node 0.11+ is required.

One-time setup:
```
npm run setup
n latest
npm install
```

Then:
```
npm start
```

