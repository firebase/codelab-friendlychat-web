import React from "react";
import { Router } from "react-router";
import { createBrowserHistory as createHistory } from "history";
import PropTypes from "prop-types";
import { createLocation } from "history";
import warning from "tiny-warning";

export const resolveToLocation = (to, currentLocation) =>
  typeof to === "function" ? to(currentLocation) : to;

export const normalizeToLocation = (to, currentLocation) => {
  return typeof to === "string"
    ? createLocation(to, null, null, currentLocation)
    : to;
};

// custom history to use html5 history
class BrowserRouter extends React.Component {
  history = createHistory(this.props);
  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}

BrowserRouter.prototype.componentDidMount = function() {
  warning(
    !this.props.history,
    "<BrowserRouter> ignores the history prop. To use a custom history, "
    + "use `import { Router }` instead of `import { BrowserRouter as Router }`."
  );
};

export default BrowserRouter;
