/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib_access from "../lib/access.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_password from "../lib/password.js";
import type * as lib_songStatus from "../lib/songStatus.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lists from "../lists.js";
import type * as songs from "../songs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "lib/access": typeof lib_access;
  "lib/errors": typeof lib_errors;
  "lib/password": typeof lib_password;
  "lib/songStatus": typeof lib_songStatus;
  "lib/validators": typeof lib_validators;
  lists: typeof lists;
  songs: typeof songs;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
