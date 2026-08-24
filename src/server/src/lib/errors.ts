export class AppError extends Error {
    constructor(
        public status: number,
        message: string,
        public code: string = 'APP_ERROR',
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(404, message, 'NOT_FOUND');
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message, 'VALIDATION_ERROR');
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(400, message, 'BAD_REQUEST');
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ExternalServiceError extends AppError {
    constructor(message: string) {
        super(502, message, 'EXTERNAL_SERVICE');
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
