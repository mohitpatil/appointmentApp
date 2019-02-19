import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import AppointmentApp from './components/AppointmentApp';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

class App extends Component {
  render() {
    return (
      <div>
      <MuiThemeProvider>
      <AppointmentApp />
      </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
