const express = require('express');
const SystemController = require('../controllers/systemController');

const router = express.Router();

// 系统信息API
router.get('/status', SystemController.getSystemStatus);
router.get('/ssh', SystemController.getSSHInfo);
router.post('/command', express.json(), SystemController.executeCommand);

module.exports = router;

// 此文件是一个模块
