import express from "express";
import * as socialController from "./social.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

/**
 * Social Routes
 */

// Search for users to follow
router.get("/search", authMiddleware, socialController.searchUsersHandler);

// Follow a user
router.post("/follow/:id", authMiddleware, socialController.followHandler);

// Unfollow a user
router.delete("/unfollow/:id", authMiddleware, socialController.unfollowHandler);

// Get followers of a specific user
router.get("/followers/:id", authMiddleware, socialController.getFollowersHandler);

// Get who a specific user is following
router.get("/following/:id", authMiddleware, socialController.getFollowingHandler);

export default router;
