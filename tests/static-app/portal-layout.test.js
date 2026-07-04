const assert = require("assert");
const fs = require("fs");
const path = require("path");

// 1. Verify index.html portal page layout
const indexHtml = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
assert(indexHtml.includes("href=\"student-login.html\""), "index.html should link to student-login.html");
assert(indexHtml.includes("href=\"teacher.html\""), "index.html should link to teacher.html");
assert(indexHtml.includes("성장 노트"), "index.html should contain brand title");
assert(!indexHtml.includes("student-login-form"), "index.html should not contain the login form");

// 2. Verify student-login.html page layout
const loginHtml = fs.readFileSync(path.join(__dirname, "../../student-login.html"), "utf8");
assert(loginHtml.includes("student-login-form"), "student-login.html should contain the login form");
assert(loginHtml.includes("href=\"index.html\""), "student-login.html should link back to index.html");
assert(!loginHtml.includes("teacher.html"), "student-login.html should not link to teacher.html");

// 3. Verify teacher.html links
const teacherHtml = fs.readFileSync(path.join(__dirname, "../../teacher.html"), "utf8");
assert(teacherHtml.includes("href=\"student-login.html\""), "teacher.html should link to student-login.html");
assert(teacherHtml.includes("href=\"index.html\""), "teacher.html should link to index.html");

console.log("portal-layout.test.js passed");
