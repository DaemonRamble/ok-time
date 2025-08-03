const express = require('express');
const TimeController = require('../controllers/timeController');
const SystemController = require('../controllers/systemController');

const router = express.Router();

// 主页 - 时间显示页面
router.get('/', TimeController.renderTimePage);
router.get('/ssh', SystemController.getSSHInfo);
router.get('/info', SystemController.getAppInfo);
router.get('/health', SystemController.getHealthCheck);

module.exports = router;

// 此文件是一个模块
