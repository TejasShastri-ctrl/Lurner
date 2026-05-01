const BASE_URL = 'http://localhost:3000/api';

/**
 * API Helpers for Lurner.
 * Centralized logic for all backend communication.
 */

// Questions
export const fetchAllQuestions = async (token) => {
    try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`${BASE_URL}/questions`, { headers });
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("error while fetching questions:", e);
        return [];
    }
}

export const fetchQueById = async (id, token) => {
    try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`${BASE_URL}/questions/${id}`, { headers });
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Authentication
export const register = async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    return await res.json();
}

export const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
}

// Submissions (Authenticated)
export const submitSolution = async (sql, questionId, token, sessionId) => {
    const res = await fetch(`${BASE_URL}/submissions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sql, questionId, sessionId })
    });
    return await res.json();
}

export const fetchHistory = async (questionId, token) => {
    try {
        const res = await fetch(`${BASE_URL}/submissions/history/${questionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch history:", e);
        return [];
    }
}

export const executeSql = async (sql, questionId, token, sessionId) => {
    const res = await fetch(`${BASE_URL}/questions/execute`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sql, questionId, sessionId })
    });
    return await res.json();
}

export const fetchFollowing = async (userId, token) => {
    const res = await fetch(`${BASE_URL}/social/following/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
}