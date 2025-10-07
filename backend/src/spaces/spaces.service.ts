import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpacesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.space.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        description: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.space.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        capacity: true,
        description: true,
      },
    });
  }
}
