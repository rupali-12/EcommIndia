import React, { Fragment, useState, useEffect } from "react";
import "./ResetPassword.css";
import Loader from "../layout/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { clearErrors, resetPassword } from "../../actions/userActions";
import { useParams } from "react-router-dom";
import { useAlert } from "react-alert";

import { UPDATE_PASSWORD_RESET } from "../../constants/userConstants";
import MetaData from "../layout/MetaData";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const navigate = useNavigate();
  const { error, success, loading } = useSelector(
    (state) => state.forgotPassword
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { token } = useParams();
  const ResetPasswordSubmit = (e) => {
    e.preventDefault();

    const myForm = new FormData();

    myForm.set("Password", password);
    myForm.set("confirmPassword", confirmPassword);

    dispatch(resetPassword(token, myForm));
  };

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }

    if (success) {
      alert.success("Password Updated Successfully");

      navigate("/login");

      dispatch({
        type: UPDATE_PASSWORD_RESET,
      });
    }
  }, [dispatch, error, alert, navigate, success]);

  return (
    <Fragment>
      {" "}
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          {" "}
          <MetaData title="reset Password" />{" "}
          <div className="resetPasswordContainer">
            {" "}
            <div className="resetPasswordBox">
              {" "}
              <h2 className="resetPasswordHeading">Reset Password</h2>{" "}
              <form
                className="resetPasswordForm"
                onSubmit={ResetPasswordSubmit}
              >
                <div className="loginPassword">
                  {" "}
                  <LockOpenIcon />{" "}
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />{" "}
                </div>{" "}
                <div className="loginPassword">
                  {" "}
                  <LockIcon />
                  <input
                    type="password"
                    sss
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />{" "}
                </div>{" "}
                <input
                  type="submit"
                  value="Update"
                  className="resetPasswordBtn"
                />{" "}
              </form>{" "}
            </div>{" "}
          </div>{" "}
        </Fragment>
      )}
    </Fragment>
  );
};

export default ResetPassword;
