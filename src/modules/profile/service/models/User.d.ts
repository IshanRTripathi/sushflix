declare module 'User' {
  interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    isCreator: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
  }

  export const User: {
    new (userData: Partial<User>): User;
    findOne(query: any): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
  };
}
