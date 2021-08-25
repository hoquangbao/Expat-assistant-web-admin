import React, { useState } from "react";
import { Switch, Route, Redirect, BrowserRouter as Router } from 'react-router-dom';
import { history } from "./history";

import LoginForm from "./view/LoginForm"
import HomePage from "./view/HomePage";
import Lesson from "./view/Lesson";
import New from "./view/New";
import LessonDetail from "./view/LessonDetail";
import ChannelDetail from "./view/ChannelDetail";
import Event from "./view/Event"
import Location from "./view/Location";
import "./dist/css/app.css"

function App() {


  return (
    <div className="App" className="layout-height">
      <Router history={history}>
        <Switch>
          <Route exact path="/" component={(props) => <LoginForm  {...props} />} />
          <Route path="/home" component={(props) => <HomePage  {...props} />} />
          <Route path="/lesson" component={(props) => <Lesson  {...props} />} />
          <Route path="/new" component={(props) => <New  {...props} />} />
          <Route path="/lessondetail" component={(props) => <LessonDetail  {...props} />} />
          <Route path="/channeldetail" component={(props) => <ChannelDetail  {...props} />} />
          <Route path="/event" component={(props) => <Event  {...props} />} />
          <Route path="/location" component={(props) => <Location  {...props} />} />
          <Redirect from="*" to="/" />
        </Switch>
      </Router>
    </div>
  )

}

export default App;
