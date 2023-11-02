import mongoose, { Document, Model, Schema } from 'mongoose';

//-----------------------------------------------Subscriber Model----------------------------------------------------------------------------------------------

interface UserDocument extends Document {
  telegramId: number;
  firstName: string;
  lastName: string;
  username: string;
  city: string;
  isSubscribed: boolean;
  isBlocked: boolean;
  date: string;
}

const userSchema: Schema<UserDocument> = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  username: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  date:{
    type: String,
    required: true,
  }
});

const User: Model<UserDocument> =
  mongoose.models.users || mongoose.model<UserDocument>('users', userSchema);

//----------------------------------------------Employee Model-----------------------------------------------------------------------------------------------

interface EmployeeDocument extends Document {
  name: string;
  email: string;
  password: string;
  date: string;
}

const employeeSchema: Schema<EmployeeDocument> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  date:{
    type: String,
    required: true,
  }
});

const Employee: Model<EmployeeDocument> =
  mongoose.models.employees ||
  mongoose.model<EmployeeDocument>('employees', employeeSchema);

//--------------------------------------------------Token Model-------------------------------------------------------------------------------------------

interface TokenDocument extends Document {
  name: string;
  token: string;
  date: string;
}

const tokenSchema: Schema<TokenDocument> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  date:{
    type: String,
    required: true,
  }
});

const Token: Model<TokenDocument> =
  mongoose.models.tokens ||
  mongoose.model<TokenDocument>('tokens', tokenSchema);


  export {User, Employee, Token}
