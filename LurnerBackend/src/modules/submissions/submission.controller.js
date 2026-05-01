import * as submissionService from "./submission.service.js";
import * as questionService from "../questions/question.service.js";
import { executeSql } from "../../services/execution/SqlEngine.js";
import prisma from "../../config/prisma.js";


export const submitHandler = async (req, res) => {
    const { sql, questionId, sessionId } = req.body;
    const userId = req.user.id;
    
    try {
        const question = await questionService.getQuestionById(questionId);
        if (!question) return res.status(404).json({ error: "Question not found" });

        let results;
        let executionTimeMs;
        let isCorrect = false;
        let status = "FAIL";
        let errorMessage = null;

        try {
            const execution = await executeSql(question.initSql, sql);
            results = execution.data;
            executionTimeMs = execution.executionTimeMs;
            isCorrect = JSON.stringify(results) === JSON.stringify(question.expectedOutput);
            status = isCorrect ? "SUCCESS" : "FAIL";
        } catch (e) {
            status = "ERROR";
            errorMessage = e.error || e.message;
            executionTimeMs = e.executionTimeMs || 0;
            results = null;
        }

        // 1. Save detailed submission (Formal Attempt)
        const submission = await submissionService.createSubmission({
            userId,
            questionId: question.id,
            code: sql,
            status,
            executionTimeMs: executionTimeMs || 0,
            errorMessage: errorMessage || null,
            output: results || null,
            sessionId: sessionId || null
        });

        // 2. Update/Upsert UserProgress
        await prisma.userQuestionProgress.upsert({
            where: {
                userId_questionId: {
                    userId,
                    questionId: question.id
                }
            },
            update: {
                isCompleted: status === "SUCCESS" ? true : undefined,
                attempts: { increment: 1 },
                lastAttempt: new Date(),
                bestCode: status === "SUCCESS" ? sql : undefined
            },
            create: {
                userId,
                questionId: question.id,
                isCompleted: status === "SUCCESS",
                attempts: 1,
                bestCode: status === "SUCCESS" ? sql : null
            }
        });

        res.json({
            status: submission.status,
            isCorrect,
            results,
            expectedOutput: question.expectedOutput,
            executionTimeMs
        });
    } catch (e) {
        console.error("❌ SQL Submission Error:", e);
        res.status(500).json({ error: e.message });
    }
};

export const getHistory = async (req, res) => {
    const { questionId } = req.params;
    const userId = req.user.id;
    try {
        const history = await submissionService.getUserSubmissionsForQuestion(userId, questionId);
        res.json(history);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
