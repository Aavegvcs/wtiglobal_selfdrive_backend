import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Faq, FaqDocument } from './schemas/faq.schema';
import { Model } from 'mongoose';
import { standardResponse } from 'src/common/helpers/response.helper';
import { FaqType } from 'src/common/enums/faq-type.enum';

@Injectable()
export class FaqService {
  constructor(@InjectModel(Faq.name) 
    private faqModel: Model<FaqDocument>
  ) {}

  async createOrUpdateFaq(dto: Partial<CreateFaqDto>) {
    try {
      if (dto.id) {
        // UPDATE if ID is provided
        const faq = await this.faqModel.findByIdAndUpdate(dto.id, dto, { new: true }).select("-createdAt -updatedAt").exec();
        if (!faq) {
          return standardResponse(false, 'FAQ not found for update', 404, null, null, '/faq/createOrUpdateFaq');
        }
        return standardResponse(true, 'FAQ updated successfully', 200, faq, null, '/faq/createOrUpdateFaq');
      } else {
        // CREATE if no ID
        const created = new this.faqModel(dto);
        await created.save();
        return standardResponse(true, 'FAQ created successfully', 201, created, null, '/faq/createOrUpdateFaq');
      }
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/faq/createOrUpdateFaq');
    }
  }

  async getAllFaq() {
    try {
      const faqs = await this.faqModel.find().exec();
      return standardResponse(true, 'FAQ list fetched successfully', 200, faqs, null, '/faq/getAllFaq');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/faq/getAllFaq');
    }
  }

  async getCategoryWiseFaq(type: FaqType, countryCode: string) {
    try {
      const categoryWiseFaqs = await this.faqModel.find({ countryCode: countryCode, type: type }).select("-createdAt -updatedAt").exec();
      const generalFaqs = await this.faqModel.find({ countryCode: countryCode, type: FaqType.GENERAL }).select("-createdAt -updatedAt").exec();

      const result = {
        generalFaqs: generalFaqs,
        categoryWiseFaqs: categoryWiseFaqs
      }
      return standardResponse(true, 'FAQ list fetched successfully', 200, result, null, '/faq/getCategoryWiseFaq');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/faq/getCategoryWiseFaq');
    }
  }

  async deleteFaq(id: string) {
    try {
      const result = await this.faqModel.findByIdAndDelete(id).exec();
      if (!result) {
        return standardResponse(false, 'FAQ not found', 404, null, null, '/faq/deleteFaq');
      }
      return standardResponse(true, 'FAQ removed successfully', 200, result, null, '/faq/deleteFaq');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/faq/deleteFaq');
    }
  }
}
