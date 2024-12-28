import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from './entites/user.entity';
import { UsersService } from './users.service';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateUserOutput)
  async createUser(
    @Args('input') createUserInput: CreateUserInput,
  ): Promise<CreateUserOutput> {
    try {
      return await this.usersService.createUser(createUserInput);
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return await this.usersService.loginUser(loginInput);
  }

  @Query(() => User)
  me(@Context() context) {
    console.log('context:', context);
    if (!context.user) {
      return;
    }
    return context.user;
  }
}
