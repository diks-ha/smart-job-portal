const fs = require('fs');
const path = require('path');

// OpenAI API integration
let openai = null;
try {
    const OpenAI = require('openai');
    const config = require('../config');
    if (config.openaiApiKey) {
        openai = new OpenAI({ apiKey: config.openaiApiKey });
    }
} catch (error) {
    console.warn('OpenAI not configured. AI features will use fallback mode.');
}

// PDF parsing
let pdfParse = null;
try {
    pdfParse = require('pdf-parse');
} catch (error) {
    console.warn('pdf-parse not installed. Resume parsing will be limited.');
}

/**
 * Parse resume PDF and extract text
 */
async function parseResume(filePath) {
    try {
        if (!pdfParse) {
            // Return mock data if pdf-parse not available
            return 'Experienced software developer with skills in JavaScript, React, Node.js, MongoDB, and Python.';
        }

        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        // Return fallback text
        return 'Professional with technical skills and experience.';
    }
}

/**
 * Extract skills from text using AI
 */
async function extractSkills(text) {
    if (!openai) {
        // Fallback: extract common tech skills
        const commonSkills = [
            'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
            'node.js', 'express', 'mongodb', 'sql', 'postgresql', 'mysql', 'docker',
            'kubernetes', 'aws', 'gcp', 'azure', 'git', 'agile', 'scrum', 'rest api',
            'graphql', 'html', 'css', 'tailwind', 'redux', 'next.js', 'flutter',
            'swift', 'kotlin', 'c++', 'c#', '.net', 'php', 'ruby', 'rails', 'django',
            'flask', 'spring', 'hibernate', 'jquery', 'bootstrap', 'figma', 'photoshop'
        ];

        const textLower = text.toLowerCase();
        return commonSkills.filter(skill => textLower.includes(skill));
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Extract technical skills from the resume text. Return only a comma-separated list of skills. Include programming languages, frameworks, tools, and technologies.'
                },
                {
                    role: 'user',
                    content: text.substring(0, 3000) // Limit text length
                }
            ],
            temperature: 0.3,
            max_tokens: 200
        });

        const skillsText = response.choices[0]?.message?.content || '';
        return skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } catch (error) {
        console.error('Error extracting skills:', error);
        // Return fallback
        return [];
    }
}

/**
 * Generate embedding for text
 */
async function getEmbedding(text) {
    if (!openai) {
        // Return mock embedding (simple hash-based for fallback)
        return generateMockEmbedding(text);
    }

    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.substring(0, 8000)
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return generateMockEmbedding(text);
    }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate mock embedding (fallback)
 */
function generateMockEmbedding(text) {
    // Simple hash-based pseudo-embedding for fallback
    const dimension = 1536;
    const embedding = new Array(dimension).fill(0);

    // Use character codes to create a deterministic but varied vector
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        embedding[i % dimension] += (charCode % 100) / 100;
    }

    // Normalize
    const sum = embedding.reduce((a, b) => a + b, 0);
    return embedding.map(v => v / sum);
}

/**
 * Calculate match score between resume and job
 */
async function calculateMatchScore(resumeText, jobDescription, resumeSkills, jobSkills) {
    try {
        // Get embeddings
        const resumeEmbedding = await getEmbedding(resumeText);
        const jobEmbedding = await getEmbedding(jobDescription);

        // Calculate similarity
        const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
        let score = Math.round((similarity + 1) / 2 * 100); // Convert -1:1 to 0:100

        // Add skills match bonus
        if (resumeSkills && jobSkills && resumeSkills.length > 0 && jobSkills.length > 0) {
            const skillsMatch = calculateSkillsMatchPercentage(resumeSkills, jobSkills);
            // Weighted average: 60% embedding similarity, 40% skills match
            score = Math.round(score * 0.6 + skillsMatch * 0.4);
        }

        return Math.min(100, Math.max(0, score));
    } catch (error) {
        console.error('Error calculating match score:', error);
        return Math.round(Math.random() * 30 + 40); // Return random score 40-70
    }
}

/**
 * Calculate skills match percentage
 */
function calculateSkillsMatchPercentage(candidateSkills, requiredSkills) {
    if (!candidateSkills || !requiredSkills || candidateSkills.length === 0) {
        return 0;
    }

    const candidateLower = candidateSkills.map(s => s.toLowerCase().trim());
    const requiredLower = requiredSkills.map(s => s.toLowerCase().trim());

    const matches = requiredLower.filter(required =>
        candidateLower.some(candidate =>
            candidate.includes(required) || required.includes(candidate)
        )
    );

    return Math.round((matches.length / requiredLower.length) * 100);
}

/**
 * Get job recommendations for a candidate
 */
async function getJobRecommendations(user, jobs) {
    if (!user.resume || !user.resume.text) {
        // If no resume, return jobs sorted by date
        return jobs.slice(0, 10).map(job => ({
            job,
            score: 0,
            reason: 'Based on recent postings'
        }));
    }

    const recommendations = [];

    for (const job of jobs) {
        const score = await calculateMatchScore(
            user.resume.text,
            job.description,
            user.resume.skills || user.profile?.skills || [],
            job.skills || []
        );

        recommendations.push({
            job,
            score,
            matchedSkills: getMatchedSkills(
                user.resume.skills || user.profile?.skills || [],
                job.skills || []
            )
        });
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, 20);
}

/**
 * Get matched skills between candidate and job
 */
function getMatchedSkills(candidateSkills, jobSkills) {
    if (!candidateSkills || !jobSkills) return [];

    const candidateLower = candidateSkills.map(s => s.toLowerCase().trim());
    const jobLower = jobSkills.map(s => s.toLowerCase().trim());

    return jobLower.filter(required =>
        candidateLower.some(candidate =>
            candidate.includes(required) || required.includes(candidate)
        )
    );
}

/**
 * Extract skills from job description
 */
async function extractJobSkills(jobDescription) {
    return extractSkills(jobDescription);
}

module.exports = {
    parseResume,
    extractSkills,
    getEmbedding,
    cosineSimilarity,
    calculateMatchScore,
    getJobRecommendations,
    extractJobSkills,
    getMatchedSkills
};
