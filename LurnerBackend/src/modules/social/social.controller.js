import * as socialService from "./social.service.js";

export const followHandler = async (req, res) => {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.id);

    try {
        const follow = await socialService.followUser(followerId, followingId);
        res.status(201).json({ message: "Followed successfully", follow });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const unfollowHandler = async (req, res) => {
    const followerId = req.user.id;
    const followingId = parseInt(req.params.id);

    try {
        await socialService.unfollowUser(followerId, followingId);
        res.json({ message: "Unfollowed successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getFollowersHandler = async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const followers = await socialService.getFollowers(userId);
        res.json(followers.map(f => f.follower));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFollowingHandler = async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const following = await socialService.getFollowing(userId);
        res.json(following.map(f => f.following));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchUsersHandler = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Search query 'q' is required" });
    }

    try {
        const users = await socialService.searchUsers(q);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
