import morgan from 'morgan';

export const logger = morgan(':method :url :status - :response-time ms');
