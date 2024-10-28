const x = require("hyperaxe");
const logout = require("./common/logout");
const { script } = require("./common/baseComponents");

const page = (opts, ...children) =>
  x("html")(head(opts), body(opts, ...children));

const head = (opts) => {
  const { meta, link } = x;
  const { title, cspNonce } = opts;
  const css = (href) => link({ rel: "stylesheet", href });
  return x("head")(
    x("title")(title),
    meta({ charset: "UTF-8" }),
    css("/css/bootstrap.css"),
    css("/css/main.css"),
    css("/fontawesome/web-fonts-with-css/css/fontawesome-all.min.css"),
    script(cspNonce, "", {
      src: "https://code.jquery.com/jquery-3.3.1.slim.min.js",
      integrity:
        "sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo",
      crossorigin: "anonymous",
    }),
    script(cspNonce, "", {
      src: "https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js",
      integrity:
        "sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1",
      crossorigin: "anonymous",
    }),
    script(cspNonce, "", {
      src: "https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js",
      integrity:
        "sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM",
      crossorigin: "anonymous",
    })
  );
};

const body = (opts, ...children) =>
  x("body")(
    x(".container-fluid.h-100")(
      x(".row.h-100")(
        x(".col-lg-2.sidebar.text-center")(
          // opts.isStudent ? logout(opts) : [sidebar(opts), searchStudent(opts)]
          opts.isStudent ? logout(opts) : [sidebar(opts)]
        ),
        x(".col-lg-10.text-center")({ align: "center" }, ...children)
      )
    )
  );

const navLink = (href, label, klass) => {
  const suffix = klass ? `.${klass}` : "";
  const tagStr = `a.btn.btn-primary.btn-block${suffix}`;
  return x("p")(x(tagStr)({ href }, label));
};

const navLinkRed = (href, label, klass) => {
  const suffix = klass ? `.${klass}` : "";
  const tagStr = `a.btn.btn-danger.btn-block${suffix}`;
  return x("p")(x(tagStr)({ href }, label));
};

const sidebar = ({ user, isAuthenticated, admin }) => {
  const authLink = isAuthenticated
    ? navLinkRed("/logout", "Logout")
    : navLink("/login", "Login");
  const adminLinks = [
    navLink("/report", "Reports", "report-button"),
    /* navLink('/course',   'Course',   'course-button'), */
    navLink("/faculty", "Faculty", "faculty-button"),
    /* navLink('/job',      'Job',      'job-button'), */
    navLink("/semester", "Semester", "semester-button"),
  ];
  return [
    x("p")("Welcome ", user),
    authLink,
    admin ? adminLinks : null,
    navLink("/student", "Student", "student-button"),
  ];
};

// const searchStudent = ({ admin, status }) => {
//   if (!admin) return null;
//   const row = x(".form-group.row");
//   const label = (id, text) =>
//     x("label.col-md-4 autoHyphen")({ lang: "en", for: id }, text);
//   const divCol8 = x(".col-md-8");
//   const { p, form, option, div } = x;
//   return [
//     p("Search students"),
//     x(".search-bar")(
//       form(
//         { action: "/student", method: "get" },
//         row(
//           label("searchLastName", "Last Name:"),
//           divCol8(
//             x("input.form-control.search-last-name")({
//               type: "text",
//               id: "searchLastName",
//               name: "lastName",
//             })
//           )
//         ),
//         row(
//           label("searchPid", "PID:"),
//           divCol8(
//             x("input.form-control.search-pid")({
//               type: "number",
//               pattern: ".{9,9}",
//               id: "searchPid",
//               name: "pid",
//             })
//           )
//         ),
//         row(
//           label("searchStatus", "Status:"),
//           divCol8(
//             x("select.form-control.search-status")(
//               { name: "status" },
//               option({ value: "" }),
//               status.map((value) => option({ value }, value))
//             )
//           )
//         ),
//         row(
//           divCol8(
//             x("button.btn.btn-primary.search-student-submit")(
//               { type: "submit" },
//               "Search"
//             )
//           )
//         )
//       )
//     ),
//     div(
//       navLink("/student/create", "Create student", "create-student-button"),
//       navLink(
//         "/student/upload/false",
//         "Upload students",
//         "upload-student-button"
//       ),
//       navLink(
//         "/student/download",
//         "Download students",
//         "download-student-button"
//       ),
//       navLink(
//         "/student/uploadCourses/false",
//         "Upload courses",
//         "upload-courses-button"
//       )
//     ),
//   ];
// };

module.exports = page;
