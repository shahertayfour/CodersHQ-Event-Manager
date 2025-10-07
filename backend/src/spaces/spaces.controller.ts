import { Controller, Get, Param } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Public()
  @Get()
  findAll() {
    return this.spacesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spacesService.findOne(id);
  }
}
