import mongoose from 'mongoose';
import bycript from 'bcryptjs';

type TToken = {
    token: string
}

interface IUser {
    name: string,
    email: string,
    password: string,
    tokens: TToken[]
}

interface UserModel extends mongoose.Model<IUser> {
  findUserByCredentials: (email: string, password: string) => Promise<mongoose.HydratedDocument<IUser>>
}

const userSchema = new mongoose.Schema<IUser, UserModel>({
    name: {
        type: String,
        minlength: [2, 'Поле "name" должно содержать минимум 2 символа'],
        maxlength: [30, 'Поле "name" должно содержать максимум 30 символов'],
        required: false,
        default: 'Ё-мое'
    },
    email: {
        type: String,
        required: [true, 'Поле "email" обязательное'],
        unique: true
    },
    password: {
        type: String,
        select: false,
        required: [true, 'Поле "password" должно быть заполнено'],
        minlength: [6, 'Поле "password" должно содержать не менее 6 символов'],
    },
    tokens: [{
        token: { type: String, required: true, select: false }
    }]
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильная почта или пароль'));
      }

      return bycript.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильная почта или пароль'));
          }

          return user; // теперь user доступен
        });
    });
});

export default mongoose.model<IUser, UserModel>('user', userSchema); 