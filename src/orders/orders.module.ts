import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersResolver } from './orders.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
