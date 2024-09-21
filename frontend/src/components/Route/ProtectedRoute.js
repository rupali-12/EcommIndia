
import { Navigate } from "react-router-dom";
import React from "react";
import { useSelector } from "react-redux";

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
