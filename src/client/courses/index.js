// All courses, in the order the home page lists them. Each course folder has an
// index.js that describes the course and lists its modules (mN/ folders with
// index.js, practice.js and study.js). To add a course, create its folder and
// append it here; to add a module, append it to its course's `modules`.
import networks from "./networks/index.js";
import security from "./security/index.js";

export const COURSES = [networks, security];

// Every module learns its course, its URL and the key its saved state is stored
// under. Keys are unique across courses; module ids only within a course.
for (const c of COURSES) for (const m of c.modules) {
  m.course = c;
  m.key = c.keyPrefix + m.id;
  m.path = `/${c.id}/${m.id}`;
}

export const MODULES = COURSES.flatMap(c => c.modules);
