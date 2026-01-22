const express = require('express');
const router = express.Router();
const {
    createTeam,
    joinTeam,
    getMyTeams,
    getTeamMessages,
    uploadVoiceMessage,
    getTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config for voice messages
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'voice-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.use(protect);

router.post('/', createTeam);
router.post('/join', joinTeam);
router.get('/', getMyTeams);
router.get('/:id', getTeam);
router.get('/:id/messages', getTeamMessages);
router.post('/:id/voice', upload.single('audio'), uploadVoiceMessage);

module.exports = router;
