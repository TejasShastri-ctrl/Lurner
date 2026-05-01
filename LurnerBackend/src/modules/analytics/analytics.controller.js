import * as analyticsService from "./analytics.service.js";

/**
 * Controller for handling detailed user analytics requests.
 */

export const getUserStatsSummaryHandler = async (req, res) => {
    try {
        const stats = await analyticsService.getUserStatsSummary(req.user.id);
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getActivityHeatmapHandler = async (req, res) => {
    try {
        const heatmap = await analyticsService.getActivityHeatmap(req.user.id);
        res.json(heatmap);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getSkillMasteryBreakdownHandler = async (req, res) => {
    try {
        const breakdown = await analyticsService.getSkillMasteryBreakdown(req.user.id);
        res.json(breakdown);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getErrorDistributionHandler = async (req, res) => {
    try {
        const errors = await analyticsService.getErrorDistribution(req.user.id);
        res.json(errors);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const getPerformanceTelemetryHandler = async (req, res) => {
    try {
        const telemetry = await analyticsService.getPerformanceTelemetry(req.user.id);
        res.json(telemetry);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
