import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import configuration from './config/configuration';
import { SeederModule } from './seeder/seeder.module'; 
import { SeederService } from './seeder/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CategoriesModule,
    AuthModule,
    TicketsModule,
    SeederModule
  ],
  controllers: [AppController],
  providers: [AppService],
})


export class AppModule implements OnModuleInit{
  constructor(private readonly seederService: SeederService) {} // Inyectamos el servicio

    async onModuleInit() {
        // Ejecutamos la función seed al iniciar la aplicación
        await this.seederService.seed();
    }
}
