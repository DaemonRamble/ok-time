const express = require('express');
const TimeController = require('../controllers/timeController');

const router = express.Router();

// 时间相关API
router.get('/time', TimeController.getTimeData);
router.get('/timezone/:timezone', TimeController.getTimezoneTime);

module.exports = router;

// 此文件是一个模块
