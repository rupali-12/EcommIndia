// import { Navigate, Routes } from "react-router-dom";
// import React, { Fragment } from "react";
// import { useSelector } from "react-redux";
// import { redirect, Route } from "react-router-dom";

// // const ProtectedRoute = ({ Component, ...rest }) => {
// // const ProtectedRoute = ({ Component, ...rest }) => {
// const ProtectedRoute = ({ isAuthenticated, Component, ...rest }) => {
//   const { loading, user } = useSelector((state) => state.user);

//   return (
//     <Fragment>
//       {loading === false && (
//        <Routes>
//          <Route
//           {...rest}
//           render={(props) => {
//             if (isAuthenticated === false) {
//               // return redirect("/login");
//               return <Navigate to={"/login"} />;
//             }

//             // if (isAdmin === true && user.role !== "admin") {
//             //   return <Redirect to="/login" />;
//             // }

//             return <Component {...props} />
//           }}
//         />
//        </Routes>
//       )}
//     </Fragment>
//   );
// };

// export default ProtectedRoute;

// ***************************
import { Navigate } from "react-router-dom";
import React from "react";
import { useSelector } from "react-redux";
// import { redirect, Route } from "react-router-dom";

// const ProtectedRoute = ({ Component, ...rest }) => {
// const ProtectedRoute = ({ Component, ...rest }) => {
const ProtectedRoute = ({ isAuthenticated, isAdmin, children }) => {
  const { loading, user } = useSelector((state) => state.user);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }
  if (isAdmin === true && user.role !== "admin") {
    return <Navigate to={"/login"} />;
  }

  return children;
};

export default ProtectedRoute;
