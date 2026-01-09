import mongoose from 'mongoose';
import { DB_Name } from '../constants.js';

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);   
    console.log('Connected to MongoDB Atlas:', connectionInstance.connection.host);
  } catch (error) {
    console.log('ERROR:', error);
    throw error;
  } 
};