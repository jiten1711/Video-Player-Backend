import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from '../controllers/subscription.controller.js';

const router = Router();

router.use(verifyJWT);

router
    .route("/c/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscriber);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;