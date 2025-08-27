import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SingleInventoryReqResDocument = SingleInventoryReqRes & Document;

@Schema({ timestamps: true, collection: 'sd_single_inventory_req_res' })
export class SingleInventoryReqRes {
  @Prop({ type: Object, required: true })
  reqBody: Record<string, any>;

  @Prop({ type: Object, required: true })
  resBody: Record<string, any>;

}

export const SingleInventoryReqResSchema = SchemaFactory.createForClass(SingleInventoryReqRes);
