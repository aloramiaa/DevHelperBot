import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDatabase = async () => {
  try {
    if (!config.mongoURI) {
      console.warn('MongoDB URI not provided. Database features will be disabled.');
      return false;
    }

    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');
    return true;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    return false;
  }
}; 