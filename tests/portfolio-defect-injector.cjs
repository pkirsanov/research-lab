"use strict";
/*
 * Feature 008 Scope 28 / SCN-008-054 — audited-defect representation preload.
 *
 * This preload represents ONE audited Feature 008 defect inside a DISPOSABLE
 * IN-MEMORY COPY of a shipped module, so a protective test can be challenged by
 * the reduced implementation it exists to reject. The shipped file is never
 * written: the substitution happens between "bytes read from disk" and "source
 * handed to the engine", and the working tree is byte-identical before and
 * after the run.
 *
 * TWO HOOKS, because Feature 008 loads its modules two different ways and a
 * single hook would silently cover only half the surface:
 *   - `Module.prototype._compile` covers `createRequire(...)("../rlportfolio.js")`,
 *     which is how the Node carriers load the portfolio modules.
 *   - `fs.readFileSync` covers `tests/provider-credentials.support.mjs`, which
 *     reads `rldata.js` as text and evaluates it through `Function(...)`. That
 *     path never reaches the CJS compiler.
 *
 * FAIL LOUD, NEVER SILENTLY. A representation that does not apply would make
 * the mutant run identical to the shipped run, and the case would then "prove"
 * discrimination that never happened. So:
 *   - the anchor must occur EXACTLY once (0 or 2+ throws), and
 *   - every application appends to the marker file named by RL_DEFECT_MARKER,
 *     which the harness requires to be non-empty before it will read anything
 *     into a pass/fail claim.
 *
 * Environment (all required):
 *   RL_DEFECT_MODULE      repo-relative path of the shipped module to copy
 *   RL_DEFECT_FIND_B64    base64 of the exact source the defect replaces
 *   RL_DEFECT_REPLACE_B64 base64 of the reduced source that replaces it
 *   RL_DEFECT_MARKER      absolute path of the applied-representation marker
 */
const fs = require("node:fs");
const path = require("node:path");
const { Module } = require("node:module");

const ROOT = path.resolve(__dirname, "..");

function required(name) {
  const value = process.env[name];
  if (typeof value !== "string" || value === "") {
    throw new Error(`portfolio-defect-injector: ${name} is required`);
  }
  return value;
}

const MODULE_REL = required("RL_DEFECT_MODULE");
const TARGET = path.resolve(ROOT, MODULE_REL);
const FIND = Buffer.from(required("RL_DEFECT_FIND_B64"), "base64").toString("utf8");
const REPLACE = Buffer.from(required("RL_DEFECT_REPLACE_B64"), "base64").toString("utf8");
const MARKER = required("RL_DEFECT_MARKER");

function represent(source, via) {
  const occurrences = source.split(FIND).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `portfolio-defect-injector: anchor must occur exactly once in ${MODULE_REL} ` +
      `(found ${occurrences}) — a defect that cannot be represented is not a proof`
    );
  }
  const mutated = source.replace(FIND, REPLACE);
  if (mutated === source) {
    throw new Error(`portfolio-defect-injector: representing the defect in ${MODULE_REL} changed nothing`);
  }
  fs.appendFileSync(MARKER, `applied module=${MODULE_REL} via=${via} bytes=${mutated.length}\n`);
  return mutated;
}

const originalCompile = Module.prototype._compile;
Module.prototype._compile = function (content, filename) {
  if (path.resolve(filename) === TARGET) content = represent(content, "require");
  return originalCompile.call(this, content, filename);
};

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function (file, options) {
  const result = originalReadFileSync.call(fs, file, options);
  if (typeof result !== "string") return result;
  let resolved;
  try { resolved = path.resolve(String(file)); } catch { return result; }
  if (resolved !== TARGET) return result;
  return represent(result, "readFileSync");
};
