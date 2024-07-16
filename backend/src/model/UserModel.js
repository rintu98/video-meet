import mongoose, { Schema } from "mongoose";

const userScheme = new Schema({
        email: { 
          type: String, 
          required: [true , "Email is required"],
          unique: true
        },
        username: { 
          type: String, 
          required: [true, "Userrname is required"],
        },
        password: { 
          type: String, 
          required: [true , "Password is required"]
        },
        token: { 
          type: String 
        }
    }
)

const User = mongoose.model("User", userScheme);

export { User };