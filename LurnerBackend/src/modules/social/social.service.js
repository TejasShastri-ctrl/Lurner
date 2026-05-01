import prisma from "../../config/prisma.js";

/**
 * Follow a user (Mutual)
 */
export const followUser = async (followerId, followingId) => {
    if (followerId === followingId) {
        throw new Error("You cannot friend yourself");
    }

    // Use a transaction to ensure both directions are created
    return prisma.$transaction([
        prisma.follows.upsert({
            where: { followerId_followingId: { followerId, followingId } },
            update: {},
            create: { followerId, followingId }
        }),
        prisma.follows.upsert({
            where: { followerId_followingId: { followerId: followingId, followingId: followerId } },
            update: {},
            create: { followerId: followingId, followingId: followerId }
        })
    ]);
};

/**
 * Unfollow a user (Mutual)
 */
export const unfollowUser = async (followerId, followingId) => {
    return prisma.$transaction([
        prisma.follows.deleteMany({
            where: {
                OR: [
                    { followerId, followingId },
                    { followerId: followingId, followingId: followerId }
                ]
            }
        })
    ]);
};

/**
 * Get users following this user
 */
export const getFollowers = async (userId) => {
    return prisma.follows.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
};

/**
 * Get users this user is following
 */
export const getFollowing = async (userId) => {
    return prisma.follows.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });
};

/**
 * Search for users by name or email
 */
export const searchUsers = async (query) => {
    return prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true
        },
        take: 10
    });
};
