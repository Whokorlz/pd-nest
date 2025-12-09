import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { Client } from '../users/entities/client.entify';
import { Category } from '../categories/entities/category.entity';
import { Technician } from '../users/entities/Technician.entify';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

// --- Mock Repositories ---
// Mock function to simulate TypeORM repositories
const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
});

// Mock data
const MOCK_CLIENT_ID = 10;
const MOCK_CLIENT_USER_ID = 1;
const MOCK_CATEGORY_ID = 100;
const MOCK_TECHNICIAN_ID = 20;

const mockClient = { 
    id: MOCK_CLIENT_ID, 
    contactEmail: 'client@test.com', 
    user: { id: MOCK_CLIENT_USER_ID }
} as Client;

const mockCategory = { 
    id: MOCK_CATEGORY_ID, 
    name: 'Software'
} as Category;

const mockTicketOpen: Ticket = {
    id: 1,
    title: 'Test Ticket',
    description: 'Initial description',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    createdAt: new Date(),
    updatedAt: new Date(),
    client: { id: MOCK_CLIENT_ID } as Client,
    category: { id: 1, name: 'Test Category' } as Category,
    technician: { 
        id: 1, 
        specialty: 'Test Specialty',
        availability: true,
        user: { id: 1 } as any // Add any required user properties
    } as Technician,
};
const mockTicketInProgress = {
    ...mockTicketOpen,
    status: TicketStatus.IN_PROGRESS,
} as Ticket;


describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository;
  let clientRepository;
  let categoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        // Provide mock functions for all repositories used in the service
        { provide: getRepositoryToken(Ticket), useFactory: mockRepository },
        { provide: getRepositoryToken(Client), useFactory: mockRepository },
        { provide: getRepositoryToken(Category), useFactory: mockRepository },
        { provide: getRepositoryToken(Technician), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepository = module.get(getRepositoryToken(Ticket));
    clientRepository = module.get(getRepositoryToken(Client));
    categoryRepository = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================
  // 1. Test for Ticket Creation (Requisito Obligatorio)
  // ==========================================================
  describe('create', () => {
    const createDto = { 
        title: 'New Bug Report', 
        description: 'App crashes on load.', 
        categoryId: MOCK_CATEGORY_ID 
    };

    it('should successfully create a new ticket', async () => {
      // Setup mocks for successful creation
      clientRepository.findOne.mockResolvedValue(mockClient);
      categoryRepository.findOne.mockResolvedValue(mockCategory);
      ticketRepository.create.mockReturnValue(mockTicketOpen);
      ticketRepository.save.mockResolvedValue(mockTicketOpen);

      const result = await service.create(createDto, MOCK_CLIENT_USER_ID);
      
      // Assertions
      expect(result).toEqual(mockTicketOpen);
      expect(clientRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: MOCK_CLIENT_USER_ID } } });
      expect(ticketRepository.save).toHaveBeenCalled();
      expect(ticketRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: MOCK_CLIENT_ID, // Checks if the Client ID was automatically linked
          status: TicketStatus.OPEN,
        }),
      );
    });

    it('should throw ForbiddenException if user is not a Client', async () => {
      // Setup mock to simulate user with no Client profile
      clientRepository.findOne.mockResolvedValue(null); 

      await expect(service.create(createDto, MOCK_CLIENT_USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      // Setup mocks: Client found, but Category not found
      clientRepository.findOne.mockResolvedValue(mockClient);
      categoryRepository.findOne.mockResolvedValue(null); 

      await expect(service.create(createDto, MOCK_CLIENT_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });


  // ==========================================================
  // 2. Test for Status Change (Requisito Obligatorio)
  // ==========================================================
  describe('updateStatus', () => {
    it('should successfully change status from OPEN to IN_PROGRESS', async () => {
      // Setup mocks: Find open ticket, simulate successful save
      ticketRepository.findOne.mockResolvedValue(mockTicketOpen);
      ticketRepository.save.mockImplementation((ticket) => ({ 
        ...ticket, 
        status: TicketStatus.IN_PROGRESS 
      }));

      const updateDto = { status: TicketStatus.IN_PROGRESS };
      const result = await service.updateStatus(1, updateDto);

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
      expect(ticketRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TicketStatus.IN_PROGRESS })
      );
    });

    it('should throw BadRequestException for invalid status change (e.g., OPEN to RESOLVED)', async () => {
      // Setup mocks: Find open ticket
      ticketRepository.findOne.mockResolvedValue(mockTicketOpen);

      const updateDto = { status: TicketStatus.RESOLVED }; // Invalid transition: OPEN -> RESOLVED
      
      await expect(service.updateStatus(1, updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      // Setup mocks: Ticket not found
      ticketRepository.findOne.mockResolvedValue(null);

      const updateDto = { status: TicketStatus.IN_PROGRESS };
      
      await expect(service.updateStatus(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
