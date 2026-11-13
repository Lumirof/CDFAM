class AppError extends Error {
    constructor(message, statusCode = 400, detalhes = null) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4')
            ? 'fail'
            : 'error';

        this.detalhes = detalhes;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;