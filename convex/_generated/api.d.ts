/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as SmtpEmail from "../SmtpEmail.js";
import type * as actionLogs from "../actionLogs.js";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as credentialSync from "../credentialSync.js";
import type * as crons from "../crons.js";
import type * as fixSections from "../fixSections.js";
import type * as http from "../http.js";
import type * as phpVersions from "../phpVersions.js";
import type * as rocketAccounts from "../rocketAccounts.js";
import type * as securityScore from "../securityScore.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as settings from "../settings.js";
import type * as siteMuPlugins from "../siteMuPlugins.js";
import type * as sitePlugins from "../sitePlugins.js";
import type * as siteThemes from "../siteThemes.js";
import type * as sites from "../sites.js";
import type * as smtp from "../smtp.js";
import type * as ssoAuth from "../ssoAuth.js";
import type * as stagingFix from "../stagingFix.js";
import type * as stagingGuard from "../stagingGuard.js";
import type * as sync from "../sync.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";
import type * as vulnScan from "../vulnScan.js";
import type * as vulnerabilities from "../vulnerabilities.js";
import type * as wpCore from "../wpCore.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  SmtpEmail: typeof SmtpEmail;
  actionLogs: typeof actionLogs;
  auth: typeof auth;
  constants: typeof constants;
  credentialSync: typeof credentialSync;
  crons: typeof crons;
  fixSections: typeof fixSections;
  http: typeof http;
  phpVersions: typeof phpVersions;
  rocketAccounts: typeof rocketAccounts;
  securityScore: typeof securityScore;
  seedTestUser: typeof seedTestUser;
  settings: typeof settings;
  siteMuPlugins: typeof siteMuPlugins;
  sitePlugins: typeof sitePlugins;
  siteThemes: typeof siteThemes;
  sites: typeof sites;
  smtp: typeof smtp;
  ssoAuth: typeof ssoAuth;
  stagingFix: typeof stagingFix;
  stagingGuard: typeof stagingGuard;
  sync: typeof sync;
  testAuth: typeof testAuth;
  users: typeof users;
  vulnScan: typeof vulnScan;
  vulnerabilities: typeof vulnerabilities;
  wpCore: typeof wpCore;
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
