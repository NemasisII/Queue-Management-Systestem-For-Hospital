import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import "./../css/Q.css";
import Modal from 'react-responsive-modal';
import FormAddAppointment from "../components/formAddAppointment";
import {
  Card,
  Icon,
  Image,
  Button,
  Form,
  Segment,
  Header,
  Grid,
  Message,
  Label
} from "semantic-ui-react";
import axios from "./../lib/axios";
import { Link } from "react-router-dom";
import { type } from "os";

class Login extends Component {
  state = {
    HN: "",
    phoneNumber: "",
    recipient: '',
    textmessage: '',
    OTP: '',
    OTPfield: '',
    requestId: '',
    statusValidate: '',
    //modal
    open: false,
    openOTP: false,
    //validate
    errorHN: { status: false, message: "" },
    errorPhoneNumber: { status: false, message: "" },
    errorOTP: { status: false, message: "" }
  };

  input = {}

  showOTPModal = async (phoneNumber) => {
    const recipient = await this.cutForOTP()
    await this.setState({
      openOTP: true,
      recipient: recipient,
      // OTP: OTP,
    })
    await this.sendOTP()
    // const text = await this.sendOTP()
    // await this.setState({
    //   textmessage: text,
    // })
    // console.log(this.state.textmessage)
    // await this.sendText()
  }
  //กด sign in เพื่อเช็คHNกับเบอร์ เสร็จแล้วเข้าmodal otp  ส่งotp ใส่otp เข้าระบบได้
  submit = async () => {
    var HN = await this.state.HN;
    var phoneNumber = await this.state.phoneNumber;
    var check = false;
    var checkHNform = false;
    console.log(phoneNumber);
    console.log(HN);

    if (checkHNform === false) {
      if (this.state.HN.match(/[0-9]{4,10}[/]{1}[0-9]{2}/)) {
        this.setState({ errorHN: { status: false, message: "" } });
        checkHNform = true;
        console.log(checkHNform);

      } else if (!this.state.HN.match(/[0-9]{4,10}[/]{1}[0-9]{2}/)) {
        this.setState({
          errorHN: { status: true, message: "HN Does not match" }
        });
      }

      //Check phone number
      if (
        this.state.phoneNumber.length <= 10 &&
        this.state.phoneNumber.match(/[0-9]{10}/) &&
        checkHNform === true
      ) {
        this.setState({ errorPhoneNumber: { status: false, message: "" } });
        check = true;
        this.showOTPModal(phoneNumber)
      } else if (
        this.state.phoneNumber.length > 10 &&
        this.state.phoneNumber.match(/[0-9]{10}/)
      ) {
        this.setState({
          errorPhoneNumber: {
            status: true,
            message: "Phone number limit 10 number"
          }
        });
      } else if (
        this.state.phoneNumber.length < 10 &&
        !this.state.phoneNumber.match(/[0-9]{10}/)
      ) {
        this.setState({
          errorPhoneNumber: {
            status: true,
            message: "Phone number does not match"
          }
        });
      }

      // //Check API
      // if (check === true) {
      //   var data = await axios.post("/checkHN", {
      //     HN: this.state.HN,
      //     phoneNumber: this.state.phoneNumber
      //   });
      //   console.log(data.data);
      //   if (data.data.length === 0) {
      //     this.setState({
      //       errorHN: { status: true, message: "HN Does not match" }
      //     });
      //   } else {
      //     console.log(data.data[0]);
      //     console.log("aaaaaa:", this.props);
      //     localStorage.setItem('getUserData', JSON.stringify(data.data[0]))
      //     this.props.history.push({
      //       pathname: "/Home",
      //       state: {
      //         HN: data.data[0].HN,
      //         phoneNumber: data.data[0].phonenumber
      //       }
      //     });
      //   }
      // }
    }

  };
  setField = (field, value) => {
    this.setState({ [field]: value });
  };
  // cutPhoneNumber = () => {
  //   let phone = "";
  //   var number = this.state.phoneNumber
  //   let tmp = "+66"
  //   phone = number.substr(1, 10)
  //   let recipient = tmp + phone
  //   return recipient;
  // }
  cutForOTP = () => {
    let phone = "";
    var number = this.state.phoneNumber
    phone = "66" + number.substr(1, 10)
    return phone;
  }
  validateOTP = async (otp) => {
    console.log(otp);
    console.log("เข้าvalidateOTP");
    const check = await axios.post('/validateOTP', {
      requestId: this.state.requestId,
      code: otp
    })
    console.log(check.data.message);
    if (check.data.message.status === '0') {
      console.log("เข้าstatusValidate");

      //Check API

      var data = await axios.post("/checkHN", {
        HN: this.state.HN,
        phoneNumber: this.state.phoneNumber
      });
      console.log(data.data);
      if (data.data.length === 0) {
        this.setState({
          errorHN: { status: true, message: "HN Does not match" }
        });
      } else {
        console.log(data.data[0]);
        // let dataEmp = splice(fruits.length-1)
        console.log("aaaaaa:", this.props);
        localStorage.setItem('getUserData', JSON.stringify(data.data[0]))
        this.props.history.push({
          pathname: "/Home",
          state: {
            HN: data.data[0].HN,
            phoneNumber: data.data[0].phonenumber
          }
        });
      }

    }
  }
  sendText = async () => {
    const recipient = this.state.recipient
    const textmessage = this.state.textmessage

    const resp = await axios.post('/sendText', {
      recipient: recipient,
      textmessage: textmessage
    })
    console.log(resp)
  }
  sendOTP = async () => {
    // var text = "OTP: "
    // var OTP = this.state.OTP
    // var textOTP = text + OTP
    // console.log(OTP)
    // console.log(this.state.textmessage)
    // console.log(this.state.recipient)
    // console.log(textOTP)
    // return textOTP;
    const recipient = this.state.recipient
    console.log("ส่งOTP");
    const reqOTP = await axios.post('/requestOTP', {
      recipient: recipient
    })
    this.setState({
      requestId: reqOTP.data.requestId
    })
  }
  onChange = (event) => {
    let otp = this.state.OTPfield + event.target.value
    this.setState({ OTPfield: otp })
    if (event.target.value.length === event.target.maxLength) {
      if (event.target.id < 4) {
        this.input[event.target.id].focus()
      } else if (event.target.id == 4) {
        console.log(otp);
        this.validateOTP(otp)
      }
    }
  }

  render() {
    return (
      <div >
        <center>
          <Grid.Column style={{ maxWidth: "450px" }}>
            <Segment color="blue">
              <Form onSubmit={this.submit}>
                <Form.Input
                  fluid
                  label="HN"
                  name="HN"
                  placeholder="HN"
                  type="text"
                  required
                  value={this.state.HN}
                  onChange={(e, { value }) => this.setState({ HN: value })}
                />

                <Message negative hidden={!this.state.errorHN.status}>
                  {this.state.errorHN.message}
                </Message>

                <Form.Input
                  fluid
                  label="Phone number"
                  name="Phone number"
                  placeholder="Phone number"
                  type="number"
                  required
                  value={this.state.phoneNumber}
                  onChange={(e, { value }) =>
                    this.setState({ phoneNumber: value })
                  }
                />
                <Message negative hidden={!this.state.errorPhoneNumber.status}>
                  {this.state.errorPhoneNumber.message}
                </Message>
                <Button color="blue" type="submit">
                  Sign in
                </Button>

              </Form>
              {/* <Button style={{ marginTop: "2.5%", float: 'right' }} color="teal" size='tiny'> */}
              <Label color='teal' size='tiny' attached='bottom right' style={{ marginTop: "2.5%" }}>
                <Link to={"/Admin"}>Admin</Link>
              </Label>
              {/* </Button> */}
            </Segment>

            <Modal
              center
              styles={{ modal: { width: 300, top: '40%', borderRadius: '10px' } }}
              open={this.state.openOTP}
              onClose={() => {
                this.setField("openOTP", false)
                this.setField("OTPfield", '')
              }}>
              <Form name='OTP'>
                <Form.Group style={{ marginLeft: 30 }}>
                  <Grid.Column>
                    <Form.Field style={{ paddingRight: 15 }} >
                      <input className='OTP'
                        width={2}
                        style={{ width: 40 }}
                        maxLength={1}
                        id="1"
                        autoFocus
                        ref={input => this.input["0"] = input}
                        type="text"
                        onChange={this.onChange}
                        value={this.state.OTPfield.charAt(0)}
                      />
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column>
                    <Form.Field style={{ paddingRight: 15 }}>
                      <input className='OTP'
                        width={2}
                        style={{ width: 40 }}
                        maxLength={1}
                        id="2"
                        ref={input => this.input["1"] = input}
                        type="text"
                        onChange={this.onChange}
                        value={this.state.OTPfield.charAt(1)}
                      />
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column>
                    <Form.Field style={{ paddingRight: 15 }}>
                      <input className='OTP'
                        width={2}
                        style={{ width: 40 }}
                        maxLength={1}
                        id="3"
                        ref={input => this.input["2"] = input}
                        type="text"
                        onChange={this.onChange}
                        value={this.state.OTPfield.charAt(2)}
                      />
                    </Form.Field>
                  </Grid.Column>
                  <Grid.Column>
                    <Form.Field style={{ paddingRight: 15 }}>
                      <input className='OTP'
                        width={2}
                        style={{ width: 40 }}
                        maxLength={1}
                        id="4"
                        ref={input => this.input["3"] = input}
                        type="text"
                        onChange={this.onChange}
                        value={this.state.OTPfield.charAt(3)}
                      />
                    </Form.Field>
                  </Grid.Column>
                </Form.Group>
                {/* <Form.Input
                fluid
                name='OTP'
                placeholder="Enter OTP"
                value={this.OTPfield}
                onChange={(e, { value }) => this.setField("OTPfield", value)}
              />
              <Message negative hidden={!this.state.errorOTP.status}>
                {this.state.errorOTP.message}
              </Message> */}
                <center>
                  <Button style={{ marginTop: "2.5%" }} color="blue" type="submit" onClick={this.validateOTP} >
                    Verify OTP
                </Button>
                </center>
              </Form>
            </Modal>
          </Grid.Column>
        </center>
      </div>
    );
  }
}

export default withRouter(Login);
