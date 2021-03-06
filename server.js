//기본 모듈 로드
let http = require('http');
let Logger = require('./logger.js');
let url = require('url');
let wildcard = require('wildcard');

exports.createServer = function(port){
  var server = new Server(logger());
  if (port)
    server.run(port);
  return server;
}

class Server {
  constructor(logger){
    this._logger = logger;
    this._nodeServer;
    this._listeners = [];
    this._started = false;
  }

  run(port){
    if (!port || port < 0 || port > 65535){
      this._logger.err('allowed port area is 0 ~ 65535.');
      return false;
    }
    if (this._started){
      this._logger.err('Server already started.');
      return false;
    }

    this._started = true;

    //http 서버 시작, 리스너 연결
    this._nodeServer = http.createServer(this.onConnect.bind(this));
    this._nodeServer.listen(port);

    return true;
  }

  isRunning(){
    return this._started;
  }

  stop(callback){
    if (!this._started){
      this._logger.err('Server already stopped.');
      return;
    }

    this._started = false;

    this._logger.log('stoping server...');

    this._nodeServer.close(() => {
      this._logger.log('서버가 정지 되었습니다.');
      if (typeof(callback) == 'function')
        callback();
    });
  }

  addListener(url,func /*(ServerEvent)*/){
    return this._listeners.push({
      'url': url,
      'listener': func
    });//리스너 아이디 반환
  }

  removeListener(listenerId){
    if (!this._listeners[listenerId]){
      this._logger.err('Cant find listener with id ' + listenerId);
      return;
    }

    this._listeners[listenerId] = null;
  }

  //onConnect(요청,응답){}
  onConnect(req,res){
    var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

    var e = new ServerEvent(req,res);
    var date = new Date();
    //리스너 존재 여부
    var founded = false;

    for (var object of this._listeners){
      if (object && wildcard(object.url,e.Info.pathname)){
        if (!founded)
          founded = true;
        object.listener(e);
      }
    }
    if (!founded){
      //404 알림
      res.writeHead(404,'404 Not Found');
      res.end();
    }

    this._logger.log(ip + ' --> ' + req.url + ' loaded in ' + (new Date() - date) + 'ms');
  }

  get Logger(){
    return this._logger;
  }

  get NodeServer(){
    return this._nodeServer;
  }
}

class ServerEvent {
  constructor(req,res){
    this._req = req;
    this._res = res;
    this._info = url.parse(req.url);
    this._ended = false;
    this._cancelled = false;
  }

  get Request(){
    return this._req;
  }

  get Response(){
    return this._res;
  }

  get Info(){
    return this._info;
  }

  get Cancelled(){
    return this._cancelled;
  }

  set Cancelled(flag){
    this._cancelled = flag;
  }

  get Method(){
    return this._req.method;
  }

  get Ended(){
    return this._ended;
  }

  writeHead(status,data){
    this._res.writeHead(status,data);
  }

  write(data){
    this._res.write(data);
  }

  end(data){
    this._res.end(data);
    this._ended = true;
  }
}
