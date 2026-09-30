const express = require('express');


const router = express.Router();
const {getUsersForSidebar, getConversationForSideBar, getMessages,sendMessage} = require('../controllers/message.controller');

const protectRoute = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/users',protectRoute,getUsersForSidebar);
router.get('/conversations',protectRoute,getConversationForSideBar);
router.get('/:id',protectRoute,getMessages);
router.post('/send/:id',protectRoute,sendMessage);
module.exports=router;