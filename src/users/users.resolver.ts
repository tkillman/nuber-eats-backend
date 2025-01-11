import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from './entites/user.entity';
import { UsersService } from './users.service';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-pofile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verifyEmail.dto';
import { Role } from 'src/auth/role.decorator';

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

  // @Query(() => User)
  // @UseGuards(AuthGuard)
  // me(@Context() context) {
  //   console.log('context:', context);
  //   if (!context.user) {
  //     return;
  //   }
  //   return context.user;
  // }

  @Query(() => User)
  //@UseGuards(AuthGuard)
  @Role(['Any'])
  me(@AuthUser() user: User) {
    console.log('🚀 ~ UsersResolver ~ me ~ user:', user);
    return user;
  }

  @Query(() => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return await this.usersService.findById(userProfileInput.userId);
  }

  @Mutation(() => EditProfileOutput)
  @UseGuards(AuthGuard)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(authUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      console.log('🚀 ~ UsersResolver ~ error:', error);

      return {
        ok: false,
        error: error,
      };
    }
  }

  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    const result = await this.usersService.verifyEmail(verifyEmailInput.code);
    return {
      ok: result,
    };
  }
}
