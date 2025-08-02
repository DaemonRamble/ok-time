/**
 * HTTP 访问日志中间件
 * 遵循 Apache Combined Log Format
 */
function httpLogger(req, res, next) {
  const startTime = Date.now();
  
  // 捕获原始的 res.end 方法
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const userAgent = req.get('User-Agent') || '-';
    
    // 输出访问日志
    console.log(`${timestamp} ${ip} ${method} ${url} ${statusCode} ${duration}ms "${userAgent}"`);
    
    // 调用原始的 end 方法
    originalEnd.apply(res, args);
  };
  
  next();
}

module.exports = httpLogger;

// 此文件是一个模块
