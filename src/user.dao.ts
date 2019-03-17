import mongoose = require('mongoose');

export interface User {
  username: string;
  spotifyRefreshToken: string;
}

type UserType = User & mongoose.Document;

const UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  spotifyRefreshToken: String
});

/*
, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
 */

const User = mongoose.model<UserType>('User', UserSchema);

export class UserDao {
  static async getUser(username: string): Promise<User> {
    return await User.findOne({username}).exec();
  }

  static async addUser(username: string, spotifyRefreshToken: string): Promise<User> {
    return await User.updateOne({username}, {username, spotifyRefreshToken}, {upsert: true});
  }

  static deleteUser(username: string): Promise<any> {
    return User.deleteOne({username}).exec();
  }
}
