/*
 * 大致实现方式
 * 判断路由是为静态资源
 * 如果为静态资源，使用fs读取，然后使用流的形式返回（管道的方式？zlib？）
 */
const [url, http, path, mime, fs] = [require('url'), require('http'), require('path'), require('./MIME.js'), require('fs')];

let server = (req, res) => {
    let pathname = url.parse(req.url).pathname, //获取请求路由
        realPatn = '';
    if (pathname === '/') { //如果路由为 / ,则加载index.html
        realPatn = 'index.html';
    } else {
        /*
         * 这里的两个api：
         * path.join()，简单来说就是把传入的多个path进行拼接
         * path.normalize()，简单来说就是把传入的路径规范化
         */
        realPath = path.join('./', path.normalize(pathname.replace(/\.\./g, '')));
    }
    let extname = path.extname(realPath);
    extname = extname ? extname.slice('1') : 'unknown'; //获取文件类型
    let mimeType = mime[extname] || 'text/plain'; //获取媒体类型
    fs.stat(realPath, function(err, stats) {
        if (err) {
            console.log(err);
            res.writeHead(404, {
                'content-type': 'text/plain'
            });
            res.end();
        } else { //开始读取文件
            fs.readFile(realPath, function(err, file) {
                if (err) {
                    res.writeHead(500, {
                        'content-type': 'text/plain'
                    });
                    res.end(err);
                } else {
                    res.writeHead(200, {
                        'content-type': mimeType
                    });
                    res.write(file);
                    res.end();
                }
            })
        }
    });
}

http.createServer(server).listen(8788);
