import express from 'express';
import { protectRoute } from '../middleware/protectRoute';

const router = express.Router();

router.post("/create", protectRoute, createPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("comment/:id", protectRoute, commentOnPost)
router.delete("/delete", protectRoute, deletePost)

export default router;
