module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    mongodbUri: process.env.MONGODB_URI,
    openaiApiKey: process.env.OPENAI_API_KEY,
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};
