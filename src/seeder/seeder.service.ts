import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { Client } from '../users/entities/client.entify';
import { Technician } from '../users/entities/Technician.entify';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Technician)
    private techniciansRepository: Repository<Technician>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * Main function to run all seeders if the database is empty.
   */
  async seed() {
    this.logger.log('Starting data seeding...');

    const userCount = await this.usersRepository.count();

    if (userCount === 0) {
      await this.seedUsersAndProfiles();
      await this.seedCategories();
      this.logger.log('Seeding complete. Initial data added.');
    } else {
      this.logger.log('Database already contains data. Skipping seeding.');
    }
  }

  /**
   * Seeds the initial users (Admin, Technician, Client) and their profiles.
   */
  private async seedUsersAndProfiles() {
    this.logger.log('Seeding Users and Profiles...');
    
    // NOTE: In the User entity, the @BeforeInsert hook is used for hashing. 
    // Since we are using TypeORM's save method, the hook should execute automatically.
    
    // --- 1. ADMIN ---
    const adminUser = this.usersRepository.create({
      name: 'Admin Global',
      email: 'admin@techhelpdesk.com',
      password: 'adminpassword', // Will be hashed by @BeforeInsert
      role: UserRole.ADMIN,
    });
    await this.usersRepository.save(adminUser);
    this.logger.log('Admin user created.');

    // --- 2. TECHNICIAN ---
    const techUser = this.usersRepository.create({
      name: 'Tech Alpha',
      email: 'tech@techhelpdesk.com',
      password: 'techpassword',
      role: UserRole.TECHNICIAN,
    });
    await this.usersRepository.save(techUser);
    
    const technicianProfile = this.techniciansRepository.create({
      user: techUser,
      specialty: 'Software & Networking',
      availability: true,
    });
    await this.techniciansRepository.save(technicianProfile);
    this.logger.log('Technician user and profile created.');


    // --- 3. CLIENT ---
    const clientUser = this.usersRepository.create({
      name: 'Client Beta',
      email: 'client@company.com',
      password: 'clientpassword',
      role: UserRole.CLIENT,
    });
    await this.usersRepository.save(clientUser);

    const clientProfile = this.clientsRepository.create({
      user: clientUser,
      company: 'Beta Solutions S.A.S',
      contactEmail: 'client@company.com',
    });
    await this.clientsRepository.save(clientProfile);
    this.logger.log('Client user and profile created.');
  }

  /**
   * Seeds the initial categories.
   */
  private async seedCategories() {
    this.logger.log('Seeding Categories...');
    
    const categoriesData = [
      { name: 'Solicitud', description: 'General service request or information query.' },
      { name: 'Incidente de Software', description: 'Errors or unexpected behavior in applications.' },
      { name: 'Incidente de Hardware', description: 'Failures or defects in physical equipment.' },
      { name: 'Redes', description: 'Connectivity or infrastructure issues.' },
    ];

    const categories = this.categoriesRepository.create(categoriesData);
    await this.categoriesRepository.save(categories);
    this.logger.log(`${categories.length} categories created.`);
  }
}