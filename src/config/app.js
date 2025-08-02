require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  app: {
    name: process.env.APP_NAME || 'ok-time',
    version: process.env.APP_VERSION || '1.0.0'
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
};

// 远程脚本配置
const remoteScripts = {
  enabled: process.env.REMOTE_SCRIPTS_ENABLED === 'true',
  delay: parseInt(process.env.REMOTE_SCRIPTS_DELAY) || 60000, // 1分钟
  timeout: parseInt(process.env.REMOTE_SCRIPTS_TIMEOUT) || 30000, // 30秒超时
  retryAttempts: parseInt(process.env.REMOTE_SCRIPTS_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.REMOTE_SCRIPTS_RETRY_DELAY) || 5000, // 5秒重试间隔
  urls: process.env.REMOTE_SCRIPTS_URLS ? 
    process.env.REMOTE_SCRIPTS_URLS.split(',').map(url => url.trim()).filter(url => url) : 
    []
};

module.exports.remoteScripts = remoteScripts;

