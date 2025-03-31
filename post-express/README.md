# POST EXPRESS SERVER

```
make simple express server with post requests that writes to txt file
```

## packages

    express
    path
    fs

## setup project

    npm install express path fs

## to run project

    npm run dev

## steps

    npm init -y

    npm install express path fs

    touch index.js

    update package.json `scripts` key to include dev command -> node --watch index.js

    update contents of index.js
        const express = require("express")

        const app = express()

        app.listen(<PORT>, callback)
