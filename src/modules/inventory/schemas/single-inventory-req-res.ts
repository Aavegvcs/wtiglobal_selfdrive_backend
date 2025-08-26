import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SingleInventoryReqResDocument = SingleInventoryReqRes & Document;

@Schema({ timestamps: true, collection: 'sd_single_inventory_req_res' })
export class SingleInventoryReqRes {
  @Prop({ required: true })
  reqBody: any;

  @Prop({ required: true })
  resBody: any;

}

export const SingleInventoryReqResSchema = SchemaFactory.createForClass(SingleInventoryReqRes);
