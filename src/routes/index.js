const express = require('express');
const TimeController = require('../controllers/timeController');

const router = express.Router();

// 主页 - 时间显示页面
router.get('/', TimeController.renderTimePage);

module.exports = router;

// 此文件是一个模块
