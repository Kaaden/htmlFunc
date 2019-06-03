var express = require('express'), app = express(),
  bodyParser = require('body-parser'), manger = require('./manage'),
  urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(bodyParser.json());
//设置允许跨域 以及样式加载ContentType属性指定响应的 HTTP内容类型
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  next();
});

app.post('/test', urlencodedParser, manger.test);
app.post("/tbSkulst", urlencodedParser, manger.tbSkulst);
app.post('/login', urlencodedParser, manger.login);
app.post('/build', urlencodedParser, manger.build);
app.post('/buildRecord', urlencodedParser, manger.buildRecord);
app.post('/buildDel', urlencodedParser, manger.buildDel);
app.post('/buildUpdate', urlencodedParser, manger.buildUpdate);
app.post('/register', urlencodedParser, manger.register);
app.post('/loginLst', urlencodedParser, manger.loginLst);
app.post('/updateMoney', urlencodedParser, manger.updateMoney);
app.post('/loginCheck', urlencodedParser, manger.loginCheck);
app.post('/wangwangLst', urlencodedParser, manger.wangwangLst);
app.get('/addwang', urlencodedParser, manger.addWang);
app.post('/searchRecord', urlencodedParser, manger.searchRecord);
app.post('/fifterRecord', urlencodedParser, manger.fifterRecord);
app.post('/searchOwn', urlencodedParser, manger.searchOwn);
app.post('/updateTime', urlencodedParser, manger.updateTime);
app.post('/searchAccount', urlencodedParser, manger.searchAccount);
app.post('/updateFunc', urlencodedParser, manger.updateFunc);
app.post('/updatePassword', urlencodedParser, manger.updatePassword);
app.post('/accountDel', urlencodedParser, manger.accountDel);
var server = app.listen(9090, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('success', host, port);
});
