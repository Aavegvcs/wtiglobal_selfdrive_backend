import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SearchRequestDocument = Search & Document;

@Schema({ timestamps: true, collection: 'sd_search_requests' })
export class Search {
    
  @Prop({required:true})
  search_id: String;

  @Prop({ type: Object, required: true })
  reqBody: Record<string, any>;


}

export const SearchRequestSchema = SchemaFactory.createForClass(Search);
