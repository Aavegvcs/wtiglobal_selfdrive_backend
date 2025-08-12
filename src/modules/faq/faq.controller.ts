import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { FaqType } from 'src/common/enums/faq-type.enum';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post("createOrUpdateFaq")
  createOrUpdateFaq(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.createOrUpdateFaq(createFaqDto);
  }

  @Get("getAllFaq")
  getAllFaq() {
    return this.faqService.getAllFaq();
  }

  @Get("getCategoryWiseFaq/:type/:countryCode")
  getCategoryWiseFaq(@Param('type') type: FaqType, countryCode: string) {
    return this.faqService.getCategoryWiseFaq(type, countryCode);
  }

  @Delete('deleteFaq/:id')
  deleteFaq(@Param('id') id: string) {
    return this.faqService.deleteFaq(id);
  }
}
