import { BadRequest, MethodNotAllowed, NotFound } from "@feathersjs/errors";
import * as edgedb from "edgedb";

const client = edgedb.createClient();
import { _ } from "@feathersjs/commons";
import {
  AdapterBase,
  select,
  AdapterParams,
  AdapterServiceOptions,
  PaginationOptions,
  AdapterQuery,
  getLimit,
} from "@feathersjs/adapter-commons";
import { Id, Paginated } from "@feathersjs/feathers";
import { isLink } from "./test";

export interface EdgeDBAdapterOptions extends AdapterServiceOptions {
  client: edgedb.Client;
  Model: string;
}

export interface EdgeDBAdapterParams<Q = AdapterQuery>
  extends AdapterParams<Q, Partial<EdgeDBAdapterOptions>> {
  id?: string;
}

export type AdapterId = Id;

export type NullableId = Id | null;

export class EdgeDBAdapter<
  Result,
  Data = Partial<Result>,
  ServiceParams extends EdgeDBAdapterParams<any> = EdgeDBAdapterParams,
  PatchData = Partial<Data>
> extends AdapterBase<
  Result,
  Data,
  PatchData,
  ServiceParams,
  EdgeDBAdapterOptions,
  AdapterId
> {
  constructor(options: EdgeDBAdapterOptions) {
    if (!options) {
      throw new Error("EdgeDB options have to be provided");
    }

    super({ ...options });
  }
  getOptions(params: ServiceParams): EdgeDBAdapterOptions {
    return this.options;
  }

  buildObject(data: Data | PatchData) {
    let stringifiedObj = "";
    for (let field in data as Record<string, any>) {
      const link = isLink(field, (data as Record<string, any>)[field]);
      if (link) {
        console.log(link);
        stringifiedObj += `${field} := (${link}), \n`;
      } else {
        stringifiedObj += `${field} := '${
          (data as Record<string, any>)[field]
        }', \n`;
      }
    }
    return stringifiedObj;
  }

  async insertObject(data: Data, modal: string, client: edgedb.Client) {
    try {
      const stringifiedObj = this.buildObject(data);
      const insertionQuery = `
      Insert ${modal} {
        ${stringifiedObj}
      }
      `;
      console.log(insertionQuery)
      const response = (await client.query(insertionQuery)) as Result;
      return response;
    } catch (error) {
      console.log("Error happend while inserting object", error);
      return error;
    }
  }

  async patchObject(
    id: AdapterId | null,
    data: PatchData,
    modal: string,
    client: edgedb.Client
  ) {
    try {
      if (!id) return id;

      const updateStringifiedObj = this.buildObject(data);
      const result = (await client.querySingle(`
      update ${modal}
      filter .id = <uuid>'${id}'
      set { 
          ${updateStringifiedObj}
      };`)) as Result;
      return result;
    } catch (error) {
      console.log("Error while patching item", error);
      return error;
    }
  }

  async deleteObject(
    id: AdapterId | null,
    modal: string,
    client: edgedb.Client
  ) {
    try {
      if (!id) return id;
      const response = await client.query(`
      delete ${modal}
      filter .id = <uuid>'${id}';
      `);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getObject(id: AdapterId | null, modal: string, client: edgedb.Client) {
    const data = (await client.querySingle(`
      Select ${modal} {**}
      filter ${modal}.id =  <uuid>'${id}'
      `)) as Result;
    return data;
  }

  async _find(
    _params?:
      | (ServiceParams & { paginate?: PaginationOptions | undefined })
      | undefined
  ): Promise<Paginated<Result>>;
  async _find(
    _params?: (ServiceParams & { paginate: false }) | undefined
  ): Promise<Result[]>;
  async _find(
    params?: ServiceParams | undefined
  ): Promise<Paginated<Result> | Result[]>;
  async _find(
    params?: ServiceParams
  ): Promise<Paginated<Result> | Result[] | Result> {
    try {
      let options = this.getOptions(params as ServiceParams);
      const modal = options.Model as string;
      const client = options.client as edgedb.Client;
      const data = (await client.query(`
      Select ${modal} {**}
      `)) as Result[];
      return data;
    } catch (error) {
      console.log("error", error);
      throw new Error("Error happened while getting data");
    }
  }

  async _get(id: Id, params?: ServiceParams | undefined): Promise<Result> {
    try {
      const options = this.getOptions(params as ServiceParams);
      const modal = options.Model as string;
      const client = options.client as edgedb.Client;
      const data = (await client.querySingle(`
      Select ${modal} {**}
      filter ${modal}.id =  <uuid>'${id}'
      `)) as Result;
      return data;
    } catch (error) {
      console.log(`error happened while getting item`, error);
      throw new Error("error happened while getting item");
    }
  }

  async _findOrGet(id: NullableId, params?: ServiceParams) {
    if (id !== null) {
      return this._get(id, params);
    }
    let options = this.getOptions(params as ServiceParams);
    const modal = options.Model as string;
    const client = options.client as edgedb.Client;
    const data = (await client.query(`
    Select ${modal} {**}
    `)) as Result[];
    return data;
  }

  _create(data: Data, params?: ServiceParams | undefined): Promise<Result>;
  _create(data: Data[], params?: ServiceParams | undefined): Promise<Result[]>;
  async _create(
    data: Data | Data[],
    params?: ServiceParams | undefined
  ): Promise<Result | Result[]> {
    try {
      const options = this.getOptions(params as ServiceParams);
      const modal = options.Model as string;
      const client = options.client as edgedb.Client;
      if (Array.isArray(data)) {
        const newData = data as Data[];
        const response = newData.map(async (d) => {
          return await this.insertObject(d, modal, client);
        });
      } else {
        const newData = data as Data;
        const response = await this.insertObject(newData, modal, client);
      }
      return this._findOrGet(null, params);
    } catch (error) {
      console.log("Error while creating user ", error);
      throw new Error("Error while creating");
    }
  }

  async _update(
    id: Id,
    data: Data,
    params?: ServiceParams | undefined
  ): Promise<Result> {
    try {
      if (id === null || Array.isArray(data)) {
        throw new BadRequest(
          "You can not replace multiple instances. Did you mean 'patch'?"
        );
      }
      const options = this.getOptions(params as ServiceParams);
      const modal = options.Model as string;
      const client = options.client as edgedb.Client;
      let oldObject = await this.getObject(id, modal, client);
      let newData = data as { [key: string]: any };

      let newObject: { [key: string]: any } = {};
      for (let key in oldObject) {
        if (key === "id") continue;
        newObject[key] = newData[key] === undefined ? null : newData[key];
      }
      const stringifiedObj = this.buildObject(newObject as Data);
      await client.querySingle(`
      Update ${modal}
      filter .id = <uuid>'${id}'
      set {
        ${stringifiedObj}
      };`);
      return this._get(id, params);
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong");
    }
  }

  _patch(
    id: null,
    data: PatchData,
    params?: ServiceParams | undefined
  ): Promise<Result[]>;
  _patch(
    id: Id,
    data: PatchData,
    params?: ServiceParams | undefined
  ): Promise<Result>;
  async _patch(
    id: Id | null,
    data: PatchData,
    params?: ServiceParams | undefined
  ): Promise<Result | Result[]> {
    try {
      const options = this.getOptions(params as ServiceParams);
      const modal = options.Model as string;
      const client = options.client as edgedb.Client;
      await this.patchObject(id, data, modal, client);
      return this._findOrGet(id, params);
    } catch (error) {
      console.log(error);
      throw new Error("Error while patching");
    }
  }

  _remove(id: null, params?: ServiceParams | undefined): Promise<Result[]>;
  _remove(id: Id, params?: ServiceParams | undefined): Promise<Result>;
  async _remove(
    id: Id | null,
    params?: ServiceParams | undefined
  ): Promise<Result | Result[]> {
    try {
      const options = this.getOptions(params as ServiceParams);
      const modal = options.Model as string;
      const client = options.client as edgedb.Client;
      await this.deleteObject(id, modal, client);
      return this._findOrGet(id, params);
    } catch (error) {
      console.log(error);
      throw new Error("Error while deleting the object");
    }
  }
}
