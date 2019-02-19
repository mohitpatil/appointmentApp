import React, {Component} from 'react';
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import moment from "moment";
import DatePicker from "material-ui/DatePicker";
import Dialog from "material-ui/Dialog";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import TextField from "material-ui/TextField";
import SnackBar from "material-ui/Snackbar";
import Card from "material-ui/Card";
import {
  Step,
  Stepper,
  StepLabel,
  StepContent
} from "material-ui/Stepper";
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";
import axios from "axios";

const API_BASE = "http://localhost:3300/";

class AppointmentApp extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            schedule: [],
            confirmationModelOpen: false,
            appointmentDateSelected : false,
            appointmentMeridiem: 0,
            validEmail: true,
            validPhone: true,
            finished: false,
            smallScreen: window.innerWidth < 768,
            stepIndex: 0
        };
    }
    
    componentWillMount() {
        axios.get(API_BASE + 'api/retrieveSlots').then(response => {
            console.log('response from db', response.data);
            this.handleDBResponse(response.data);
        });
    }

    handleSetAppointmentDate(date) {
        this.setState({ appointmentDate: date, confirmationTextVisible: true });
    }

    handleSetAppointmentSlot(slot) {
        this.setState({ appointmentSlot: slot });
    }

    handleSetAppointmentMeridiem(meridiem) {
        this.setState({ appointmentMeridiem: meridiem });
    }

    handleSubmit() {
        this.setState({ confirmationModelOpen: false });
        const newAppointment = {
            name : this.state.firstName + " " + this.state.lastName,
            email : this.state.email,
            phone : this.state.phone,
            slot_date: moment(this.setState.appointmentDate).format("YYYY-DD-MM"),
            slot_time : this.state.appointmentSlot
        };

        axios
        .post(API_BASE + "api/appointmentCreate", newAppointment)
        .then(response => this.setState ({
            confirmationSnackbarMessage: "Appointment Succesfully added!",
            confirmationSnackbarOpen : true,
            processed: true
        })
        )
        .catch(err => this.setState ({
            confirmationSnackbarMessage: "Appointment Failed to save",
            confirmationSnackbarOpen: true,
            processed: false
        }));
    }

    handleNext = () => {
        const {stepIndex} = this.state;
        this.setState ({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 2
        });
    };

    handlePrev = () => {
        const {stepIndex} = this.state;
        if(stepIndex > 0) {
            this.setState({ stepIndex: stepIndex - 1 });
        }
    };

    validateEmail (email) {
        const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return regex.test(email)
            ? this.setState({ email:email, validEmail: true })
            : this.setState({ validEmail: false })
    }
    

    validatePhone (phoneNumber) {
        const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return regex.test(phoneNumber)
        ? this.setState({ phoneNumber: phoneNumber, validPhone: true })
        : this.setState({ validPhone: false })
    }

    checkDisabledDate (day) {
        const dateString = moment(day).format("YYYY-DD-MM");
        return (
            this.state.schedule[dateString] === true ||
            moment(day).startOf("day").diff(moment().startOf("day")) < 0
        );
    }

    handleDBResponse (response) {
        const appointments = response;
        const today = moment().startOf("day");
        const initialSchedule = {};
        initialSchedule[today.format("YYYY-DD-MM")] = true;

        const schedule = !appointments.length
        ? initialSchedule
        : appointments.reduce ((currentSchedule, appointment) => {
            const { slot_date, slot_time } = appointment;
            const dateString = moment(slot_date, "YYYY-DD-MM").format("YYYY-DD-MM");
            ! currentSchedule[slot_date]? (currentSchedule[dateString] = Array(8).fill(false)) : null;
            Array.isArray(currentSchedule[dateString])
            ? (currentSchedule[dateString][slot_time] = true)
            : null;
            return currentSchedule;
        }, initialSchedule);

        for(let day in schedule) {
            let slots = schedule[day];
            slots.length
            ? slots.every(slot => slot === true) ? (schedule[day] = true) : null
            : null;
        }

        this.setState({
            schedule: schedule
        });
    }

    renderAppointmentConfirmation() {
        const spanStyle = {color: "#00C853"};
        return (
            <section>
            <p>Name:{" "}
            <span style={spanStyle}>
                {this.state.firstName} {this.state.lastName}
            </span>
            </p>
            
            <p>
            Number: <span style= {spanStyle}>{this.state.phoneNumber}</span>
            </p>

            <p>
            Email: <span stype={spanStyle}>{this.state.email}</span>
            </p>

            <p>
            Appointment: {" "}
            <span style={spanStyle}>
            {moment(this.state.appointmentDate)
                .format("dddd[,] MMM Do[,] YYYY")}
            </span> {" "}
            at {" "}
            <span style={spanStyle}>
            {moment()
                .hour(9)
                .minute(0)
                .add(this.state.appointmentSlot, "hours")
                .format("h:mm a")}
            </span>
            </p>
            </section>
        );
    }

    renderAppointmentTimes() {
        if (!this.state.isLoading) {
          const slots = [...Array(8).keys()];
          return slots.map(slot => {
            const appointmentDateString = moment(this.state.appointmentDate).format(
              "YYYY-DD-MM"
            );
            const time1 = moment()
              .hour(9)
              .minute(0)
              .add(slot, "hours");
            const time2 = moment()
              .hour(9)
              .minute(0)
              .add(slot + 1, "hours");
            const scheduleDisabled = this.state.schedule[appointmentDateString]
              ? this.state.schedule[
                  moment(this.state.appointmentDate).format("YYYY-DD-MM")
                ][slot]
              : false;
            const meridiemDisabled = this.state.appointmentMeridiem
              ? time1.format("a") === "am"
              : time1.format("a") === "pm";
            return (
              <RadioButton
                label={time1.format("h:mm a") + " - " + time2.format("h:mm a")}
                key={slot}
                value={slot}
                style={{
                  marginBottom: 15,
                  display: meridiemDisabled ? "none" : "inherit"
                }}
                disabled={scheduleDisabled || meridiemDisabled}
              />
            );
          });
        } else {
          return null;
        }
    }

    renderStepActions(step) {
        const { stepIndex } = this.state;
    
        return (
          <div style={{ margin: "12px 0" }}>
            <RaisedButton
              label={stepIndex === 2 ? "Finish" : "Next"}
              disableTouchRipple={true}
              disableFocusRipple={true}
              primary={true}
              onClick={this.handleNext}
              backgroundColor="#00C853 !important"
              style={{ marginRight: 12, backgroundColor: "#00C853" }}
            />
            {step > 0 && (
              <FlatButton
                label="Back"
                disabled={stepIndex === 0}
                disableTouchRipple={true}
                disableFocusRipple={true}
                onClick={this.handlePrev}
              />
            )}
          </div>
        );
    }

    render() {
        const {
            finished,
            isLoading,
            smallScreen,
            stepIndex,
            confirmationModelOpen,
            confirmationSnackbarOpen,
            ...data
        } = this.state;

        const contactFormFilled =
        data.firstName &&
        data.lastName &&
        data.phone &&
        data.email &&
        data.validEmail &&
        data.validPhone;

        const DatePicker = () => (
            <div>
                <DatePicker hintText = "Select Date"
                mode = {smallScreen ? "portrait" : "landscape"} 
                onChange = {(n, date) => this.handleSetAppointmentDate(date)}
                shouldDisableDate = {day => this.checkDisableDate (day)}
                />
            </div>
        );

        const modelActions = [
            <FlatButton
            label = "Cancel"
            primary = { false }
            onClick = {() => this.setState ({confirmationModelOpen: false})} />,

            <FlatButton 
            label = "Confirm"
            primary = { true } 
            style = {{backgroundColor: "#00C853 !important"}}
            onClick = {() => this.handleSubmit ()} />
        ];

        return (
            <div>
            <AppBar title="Appointment Scheduler"
            iconClassNameRight = "muidocs-icon-navigation-exapnd-more" />
                <section style={{maxWidth: !smallScreen ? "80%" : "100%", margin: "auto", marginTop: !smallScreen ? 20 : 0}}>
                    <Card style={{padding:"12px 12px 25px 12px", height: smallScreen ? "100vh" : null }}>
                        <Stepper activeStep = {stepIndex} orientation = "vertical" linear = { false }>
                            <step><StepLabel> Choose an Available day for your appointment. </StepLabel>
                            <StepLabel> {DatePicker()} {this.renderStepActions(0)}
                            </StepLabel>
                            </step>
                            <step disabled={!data.appointmentDate}>
                            <StepLabel>
                                Choose Available time for your appointment.
                            </StepLabel>
                            <StepContent>
                                <SelectField floatingLabelText = "AM/PM" value = "data.appointmentMeridiem(payload)"
                                onChange = {(evt, key, payload) => this.handleSetAppointmentMeridiem(payload)}
                                selectionRenderer = {value => (value ? "PM" : "AM")}>
                                <MenuItem value = {0} primaryText = "AM" />
                                <MenuItem value = {1} primaryText = "PM" />
                                </SelectField>

                                <RadioButtonGroup style= {{marginTop: 15, marginLeft: 15}}
                                name="appointmentTimes"
                                defaultSelected = {data.appointmentSlot}
                                onChange = {(evt, val) => this.handleSetAppointmentSlot(val)}> 
                                {this.renderAppointmentTimes()}
                                </RadioButtonGroup> 
                                {this.renderStepActions(1)}

                            </StepContent>
                            </step>

                            <step>
                                <StepLabel>
                                    Share your Contact information with us and we'll send you confirmation.
                                </StepLabel>
                                <stepContent>
                                    <p>
                                        <section>
                                            <TextField style={{ display:"block"}} name="first_name" hintText="First Name"
                                            floatingLabelText="First Name"
                                            onChange={(evt, newValue) => this.setState({firstname: newValue})} />

                                            <TextField style={{ display:"block"}} name="last_name" hintText="Last Name"
                                            floatingLabelText ="Last Name"
                                            onChange={(evt, newValue) => this.setState({ lastName: newValue })} />

                                            <TextField style={{ display:"block"}} name="email" hintText="youremail@mail.com"
                                            floatingLabelText = "Email Address"
                                            errorText = { data.validEmail ? null : "Enter a valid Email address." }
                                            onChange={(evt, newValue) => this.validateEmail(newValue)} />

                                            <TextField style={{ display:"block"}} name="phone" hintText="+2345678945"
                                            floatingLabelText = "Phone Number"
                                            errorText = { data.validPhone ? null : "Enter a valid Phone Number." }
                                            onChange={(evt, newValue) => this.validatePhone(newValue)} />

                                            <RaisedButton style={{ display: "block", backgroundColor: "#00C853" }}
                                            label = {contactFormFilled ? "Schedule" : "Please Fill out your Information to Schedule" }
                                            labelPosition="before" primary={true} fullWidth={true}
                                            onClick={() => this.setState({confirmationModelOpen: !this.setState.confirmationModelOpen})}
                                            disabled= { !contactFormFilled || data.processed }
                                            style = {{ marginTop: 20, maxWidth: 100 }} />

                                        </section>
                                </p>
                                {this.renderStepActions(2)}
                                </stepContent>

                            </step>
                        </Stepper>
                    </Card>

                    <Dialog model={true}
                    open={confirmationModelOpen}
                    actions={modelActions}
                    title="Confirm your Appointment">
                    {this.renderAppointmentConfirmation()}
                    </Dialog>

                    <SnackBar open={confirmationSnackbarOpen || isLoading }
                    message = { isLoading ? "Loading... " : data.confirmationSnackbarMessage || "" }
                    autoHideDuration = {10000}
                    onRequestClose={() => this.setState({confirmationModelOpen : false})}   />

                </section>
            </div>
        );
    }
}



export default AppointmentApp;