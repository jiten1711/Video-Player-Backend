import {Router} from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from '../controllers/playlist.controller';

const router = Router();

router.route('/create-playlist').post(verifyJWT, createPlaylist);
router.route('/get-user-playlists/:userId').get(verifyJWT, getUserPlaylists);
router.route('/get-playlist-by-id/:playlistId').get(verifyJWT, getPlaylistById);
router.route('/add-video-to-playlist/:playlistId/:videoId').put(verifyJWT, addVideoToPlaylist);
router.route('/remove-video-from-playlist/:playlistId/:videoId').put(verifyJWT, removeVideoFromPlaylist);
router.route('/delete-playlist/:playlistId').delete(verifyJWT, deletePlaylist);
router.route('/update-playlist/:playlistId').put(verifyJWT, updatePlaylist);