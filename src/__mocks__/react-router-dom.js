import React from "react";

export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ element }) => element;
export const Link = ({ children }) => <a>{children}</a>;

export const useNavigate = jest.fn(() => jest.fn());
export const useParams = jest.fn(() => ({}));
export const useLocation = jest.fn(() => ({
  pathname: "/test-path",
  search: "",
  hash: "",
  state: null,
  key: "mock-key",
}));
