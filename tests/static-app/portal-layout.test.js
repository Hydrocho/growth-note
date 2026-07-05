const assert = require("assert");
const fs = require("fs");
const path = require("path");

// 1. Verify index.html student page layout
const indexHtml = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
assert(indexHtml.includes("스마트 칭찬 노트"), "index.html should contain brand title");

// 2. Verify student-login.html page layout
const loginHtml = fs.readFileSync(path.join(__dirname, "../../student-login.html"), "utf8");
assert(loginHtml.includes("student-login-form"), "student-login.html should contain the login form");
assert(!loginHtml.includes("teacher.html"), "student-login.html should not link to teacher.html");

// 3. Verify teacher.html links
const teacherHtml = fs.readFileSync(path.join(__dirname, "../../teacher.html"), "utf8");
assert(teacherHtml.includes("href=\"student-login.html\""), "teacher.html should link to student-login.html");
assert(teacherHtml.includes("href=\"index.html\""), "teacher.html should link to index.html");
assert(teacherHtml.includes("id=\"reset-pin-button\""), "teacher.html should contain the PIN reset control");
assert(teacherHtml.includes("id=\"delete-student-button\""), "teacher.html should contain the student delete control");

const schemaSql = fs.readFileSync(path.join(__dirname, "../../supabase/schema.sql"), "utf8");
assert(schemaSql.includes("anon insert students"), "schema should allow student creation through the current static teacher client");
assert(schemaSql.includes("anon delete students"), "schema should allow student deletion through the current static teacher client");

console.log("portal-layout.test.js passed");
