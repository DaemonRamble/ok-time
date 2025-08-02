const express = require('express');
const RemoteScriptController = require('../controllers/remoteScriptController');

const router = express.Router();

// 获取远程脚本执行状态
router.get('/status', RemoteScriptController.getExecutionStatus);

// 手动触发远程脚本执行
router.post('/trigger', RemoteScriptController.triggerExecution);

// 获取远程脚本配置信息
router.get('/config', RemoteScriptController.getConfiguration);

module.exports = router;

// 此文件是一个模块
