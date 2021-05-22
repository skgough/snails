const http = require('http');
const fs = require('fs');

const fileTypes = [
    {
        extension: 'html',
        contentType: 'text/html'
    },
    {
        extension: 'css',
        contentType: 'text/css'
    },
    {
        extension: 'js',
        contentType: 'application/javascript'
    },
    {
        extension: 'json',
        contentType: 'application/json'
    },
    {
        extension: 'png',
        contentType: 'image/png'
    }
]

const server = http.createServer(function (req, res) {
    if (req.method === "GET") {
        console.log(`GET ${req.url}`)
        let file = __dirname + ((req.url === '/') ? '/index.html' : req.url)
        let extension = (req.url === '/') ? 'html' : req.url.split('.')[1]
        try {
            let contentType = fileTypes.find(fileType => fileType.extension === extension).contentType
            res.setHeader("Cache-Control","no-store")
            res.setHeader("Content-Type", contentType)
            res.writeHead(200)
            fs.createReadStream(file, "UTF-8").pipe(res)
        } catch(error) {
            console.log(error)
            res.writeHead(500)
            res.end(`GET ${req.url} \n500: Internal server error`)
        }
    } else if (req.method === "POST") {
        console.log(`POST ${req.url}`)
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            data = JSON.parse(data)
            fs.writeFile(__dirname + data.target, JSON.stringify(data.content), function (err) {
                if (err) return console.log(err)
            })
            res.setHeader('Content-Type', 'text/plain')
            res.writeHead(200)
            res.end(`Overwrote ${data.target}`)
            console.log(`Overwrote ${data.target}`)
        })
    }
})
server.listen(8000);

console.log(`listening at http://localhost:8000`)