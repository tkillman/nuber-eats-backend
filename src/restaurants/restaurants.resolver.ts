import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ResutaurantsResolver {
  @Query(() => Boolean)
  isPizzaGood(): boolean {
    return true;
  }
}
