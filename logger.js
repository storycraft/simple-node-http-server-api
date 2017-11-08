let fs = require('fs');

const LOG_FOLDER = 'logs';

const WRITER_SETTINGS = {
  flags: 'a',
  encoding: 'utf8',
  mode: 0o666
};

module.exports = function(){
  var date = new Date();
  var logName = 'server_' + date.toDateString() + ' ' + date.getTime() + '.log';
  return new Logger(logName);
}

class Logger {
  constructor(logFileName){
    this._logFileName = logFileName;
    this._logs = [];
  }

  debug(text){
    console.log('[DEBUG] ' + text);
  }

  log(text,hide){
    var date = new Date();
    if (!hide)
      console.log('[' + date.toLocaleTimeString() + '] ' + text);
    this.cacheLog({
      'time': date,
      'text': text
    });
  }

  err(exception){
    console.log('에러 ' + exception);
    this.cacheLog({
      'time': new Date(),
      'type': 'err',
      'text': exception
    });
  }

  getLogs(){
    return this._logs;
  }

  cacheLog(log){
    var text = (log.type ? log.type + ' ' : '') + '[' + log.time.toLocaleTimeString() + '] ' + log.text;
    fs.appendFile(LOG_FOLDER + '/' + this._logFileName,text + '\r\n',WRITER_SETTINGS, (err) => {
      if (err){
        console.log('로깅중 오류가 발생했습니다.');
        throw err;
      }
    });

    this._logs.push(log);
  }
}
