import { AdapterId, EdgeDBAdapter, EdgeDBAdapterParams } from "./adapter";
import { Params } from "@feathersjs/feathers";

export class EdgeDBService<
  Result = any,
  Data = Partial<Result>,
  ServiceParams extends Params<any> = EdgeDBAdapterParams,
  PatchData = Partial<Data>
> extends EdgeDBAdapter<Result, Data, ServiceParams, PatchData> {
  async find() {
    return this._find();
  }
  async create(data: any) {
    return this._create(data);
  }

  async get(id: AdapterId) {
    return this._get(id);
  }

  async patch(
    id: AdapterId,
    data: PatchData,
    params?: ServiceParams | undefined
  ): Promise<Result | Result[]> {
    return this._patch(id, data, params);
  }

  async remove(id: AdapterId, params?: ServiceParams | undefined) {
    return this._remove(id, params);
  }

  async update(
    id: AdapterId,
    data: Data,
    params?: ServiceParams | undefined
  ): Promise<Result> {
    return this._update(id, data, params);
  }
}
