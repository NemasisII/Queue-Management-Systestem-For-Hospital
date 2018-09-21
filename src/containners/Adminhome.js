import React, { Component } from "react";
import DropdownQueue from "./../components/Dropdown";
import ListQueue from "./../components/listQueue";
import "./../css/Q.css";
import Headerbar from "./../components/headerbar";
import axios from "./../lib/axios";

import {
  Segment, Icon, Header, List, Message, Dropdown, Menu,
  Table, Radio, Button, TextArea, Label,
} from "semantic-ui-react";
// import Modal from "react-modal";
import Modal from 'react-responsive-modal';


import { extendMoment } from 'moment-range';
import * as Moment from "moment";

const moment = extendMoment(Moment);


class Adminhome extends Component {
  state = {
    showModal: false,
    modalIsOpen: false,
    modalOpen: false,

    errorHN: "",
    errorGetName: "",
    errorAdd: "",
    Date: new Date(),
    currentQueue: {},
    currentDate: {
      day: "",
      month: "",
      year: ""
    },
    statusId: 1,
    doctorList: [],
    queues: [],
    labQueues: [], // show lab queue at department
    listLabQueue: [], // show queue at lab room
    allPatient: [],
    roomId: 0,
    departmentId: 0,
    doctorId: 0,
    nurseId: 0,
    userType: 0, //บอกตำแหน่ง nurse department or lab
    // forwardId: 0,
    // forwardLabId: 0,
    forwardDepartmentId: 0,
    // typeForward: "",
    message: "",
    // amountDepartment: 1,

    HN: "",
    namePatient: "",
    lastNamePatient: "",

    allDepartment: [{ key: "", text: "", value: "" }],
    roomAndDoctors: [{ key: "", text: "", value: "" }],
    //Dropdown.js
    departments: [{ key: "", text: "", value: "" }],
    doctors: [{ key: "", text: "", value: "" }],
    type: "",


    // reState: '',
    forwardDepartments: [],
    forwardType: "",
    forwardDepartmentId: "",
    forwardDoctorId: "",
    forwardComeback: null,
    forwardRoomAndDoctors: [],
    forwardMessage: ""


  };

  componentWillMount = async () => {
    const { empId, departmentId, type } = JSON.parse(localStorage.getItem('userData'))

    this.setState({
      nurseId: empId,
      departmentId,
      userType: type
    });



    var dataPatient = await axios.get(`/getPatient`);
    // Modal.setAppElement("body");

    const allDepartment = await axios.get(`/getDepartment`);
    const allDepartmentOption = allDepartment.data.map(department => ({
      key: department.departmentId,
      text: department.department,
      value: department.departmentId
    }));

    const allLab = await axios.get(`/getLab`);
    const allLabOption = allLab.data.map(Lab => ({
      key: Lab.departmentId,
      text: Lab.department,
      value: Lab.departmentId
    }));

    const departments = await axios.get(
      `/getDepartment/${this.state.departmentId}`
    );
    const departmentsOption = departments.data.map(department => ({
      key: department.departmentId,
      text: department.department,
      value: department.departmentId
    }));


    const date = this.pharseDate();
    const doctors = await axios.post(`/getListDoctor`, {
      day: date.day,
      month: date.month,
      year: date.year,
      departmentId: this.state.departmentId
    });

    const doctorsOption = this.dropdownDoctors(doctors);

    var datas = await axios.get(`/getQueue/${doctors.data[0].roomId}`);
    var datasLab = await axios.get(`/getLabQueue/${doctors.data[0].roomId}`);
    var dataLabQueue = await axios.get(`/getListLabQueue`);


    const currentQinThisRoom = await axios.get(`/currentQwithDoctor/${doctorsOption[0].value}`);

    this.setState({
      currentQueue: currentQinThisRoom.data.length === 0 ? {} : currentQinThisRoom.data[0],
      doctorList: doctors.data,
      departments: departmentsOption,
      allDepartment: allDepartmentOption,
      allLab: allLabOption,
      doctors: doctorsOption,
      allPatient: dataPatient.data,
      queues: datas.data,
      listLabQueue: dataLabQueue.data,
      labQueues: datasLab.data,
      roomId: doctors.data[0].roomId,
      doctorId: doctorsOption[0].value,
      currentDate: {
        day: date.day,
        month: date.month,
        year: date.year
      }
    });
  };
  //สิ้นสุด Willmount

  setField = (field, value) => {
    this.setState({ [field]: value });
  };

  chooseDoctor = async value => {
    const findRoom = this.state.doctorList
      .filter(doctor => doctor.doctorId === value)
      .map(doctor => doctor.roomId);

    const currentQinThisRoom = await axios.get(`/currentQwithDoctor/${value}`);
    this.setState({
      doctorId: value,
      roomId: findRoom[0],
      currentQueue:
        currentQinThisRoom.data.length === 0 ? {} : currentQinThisRoom.data[0]
    });
    this.getLabQueue(findRoom[0]);
    this.getQueue();
  };

  dropdownDoctors = doctors => {
    const roomAndDoctorOption = doctors.data.map(roomDoctor => ({
      key: roomDoctor.doctorId,
      text:
        roomDoctor.firstname +
        " " +
        roomDoctor.lastname +
        " (ห้อง " +
        roomDoctor.roomId +
        " ) ",
      value: roomDoctor.doctorId
    }));
    return roomAndDoctorOption;
  };

  dropdownRooms = doctors => {
    const dropdownAndRooms = doctors.data.map(roomDoctor => ({
      key: roomDoctor.doctorId,
      text:
        roomDoctor.firstname +
        " " +
        roomDoctor.lastname +
        " (ห้อง " +
        roomDoctor.roomId +
        " ) ",
      value: roomDoctor.doctorId + "/" + roomDoctor.roomId
    }));
    return dropdownAndRooms;
  };

  checkDoctorWithRoom = async value => {
    const roomAndDoctors = await axios.post(`/getRoomAndDoctor`, {
      day: this.state.currentDate.day,
      month: this.state.currentDate.month,
      year: this.state.currentDate.year,
      forwardDepartmentId: value
    });

    let doctorsOption = this.dropdownRooms(roomAndDoctors);
    this.setState({
      roomAndDoctors: doctorsOption,
      forwardDepartmentId: value
    });
  };

  doctorInDepartment = async value => {
    const roomAndDoctors = await axios.post(`/getRoomAndDoctor`, {
      day: this.state.currentDate.day,
      month: this.state.currentDate.month,
      year: this.state.currentDate.year,
      forwardDepartmentId: value
    });

    return this.dropdownRooms(roomAndDoctors);

  };

  pharseDate = () => {
    var month = new Array(
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec"
    );
    var day = new Array(7);
    day[0] = "sun";
    day[1] = "mon";
    day[2] = "tue";
    day[3] = "wed";
    day[4] = "thu";
    day[5] = "fri";
    day[6] = "sat";

    var curr_date = this.state.Date.getDay();
    var curr_month = this.state.Date.getMonth();
    var curr_year = this.state.Date.getFullYear();

    return {
      day: day[curr_date],
      month: month[curr_month],
      year: curr_year,
    }
  }

  //Add เข้าคิว
  addQueue = async e => {
    const min = this.state.queues.filter(queue => {
      queue.HN === this.state.HN;
    });

    if (min.length === 0) {
      const date = this.pharseDate();
      var checkHNDepartments = await axios.get(
        `/checkHNatDepartment/${this.state.departmentId}`
      );
      const checks = checkHNDepartments.data.filter(
        check => check.HN === this.state.HN
      );

      if (checks.length === 0) {
        var time = moment().toString();
        await axios.post("/addPatientQ", {
          roomId: this.state.roomId,
          // date: this.state.Date,
          day: date.day,
          month: date.month,
          year: date.year,
          timeFormat: time,
          statusId: this.state.statusId,
          HN: this.state.HN,
          doctorId: this.state.doctorId,
          // forward: this.state.forward,
          nurseId: this.state.nurseId,
          departmentId: this.state.departmentId
        });
        this.setState({
          modalIsOpen: false,
          errorAdd: { status: false, message: "" }
        });
      } else {
        this.setState({
          errorAdd: { status: true, message: "Cannot Add HN To Queue" }
        });
      }
      this.getQueue();
      console.log("add เข้า db");
    } else {
      console.log("ซ้ำ");
    }
  };

  showPatient = () => {
    let tmp = "";
    if (this.state.userType === 1) {
      const data = this.state.queues;
      console.log(data)
      if (data.length !== 0) {
        tmp = data
          .filter(queue => queue.roomId === this.state.roomId)
          .map(queue => (
            <List
              divided
              horizontal
              style={{
                backgroundColor: "white",
                width: "100%",
                borderBottom: "1px solid #E0E0E0",
                padding: "5px"
              }}>
              <List.Item style={{ paddingRight: "7%" }}>
                <List.Header
                  style={{
                    fontSize: "36px",
                    color: "teal",
                    paddingLeft: "40%"
                  }}
                >
                  {queue.queueId}
                </List.Header>
              </List.Item>
              <List.Item>
                <List.Header style={{ fontSize: "16px", marginTop: "3%" }}>
                  Name : {queue.firstName} {queue.lastName}
                </List.Header>
                <List.Content style={{ fontSize: "16px", marginTop: "3%" }}>
                  HN: {queue.HN}
                </List.Content>
                <List.Content floated="left">
                  <Icon name="time" size="large" style={{ marginTop: "3%" }} />
                  {queue.avgtime.toFixed(0)} Min
                </List.Content>

                <Label color='teal'
                  onClick={() => this.setField("modalOpen", true)}>
                  <Icon className="exclamation circle" />
                  Message
                 </Label>
                <Modal
                  center
                  styles={{ modal: { width: 500, top: "30%", height: '30%' } }}
                  open={this.state.modalOpen}
                  onClose={() => this.setField("modalOpen", false)}
                >
                  {queue.Forward}
                </Modal>
              </List.Item>
            </List>
          ));
      } else {
        tmp = <Icon loading className='hourglass end' size='huge' color='teal'
          style={{ marginLeft: '30%', width: '40%', marginRight: '30%', marginTop: '15%' }}
        />
      }
    }
    else if (this.state.userType === 2) {
      const data = this.state.queues;
      if (data.length !== 0) {
        tmp = data.map(queue => (
          <List
            divided
            horizontal
            style={{
              backgroundColor: "white",
              width: "100%",
              borderBottom: "1px solid #E0E0E0",
              padding: "5px"
            }}
          >
            <List.Item>
              <List.Header
                style={{ fontSize: "36px", color: "teal", paddingLeft: "3%" }}
              >
                {queue.queueId}
              </List.Header>
            </List.Item>
            <List.Item>
              <List.Header style={{ fontSize: "16px", marginTop: "2%" }}>
                Name : {queue.firstName} {queue.lastName}
              </List.Header>
              <List.Content style={{ fontSize: "16px", marginTop: "3%" }}>
                HN: {queue.HN}
              </List.Content>
              <List.Content floated="left">
                <Icon name="time" size="medium" style={{ marginTop: "3%" }} />
                {queue.avgtime.toFixed(0)} Min
              </List.Content>
              <List.Content
                floated="right"
                onClick={() => this.setField("modalOpen", true)}
              >
                <Icon
                  name="exclamation circle"
                  size="medium"
                  color="red"
                  style={{ marginTop: "3%" }}
                />
                Message
              </List.Content>
              <Modal
                open={this.state.modalOpen}
                onClose={() => this.setField("modalOpen", false)}
                center
                styles={{ modal: { width: 500, top: "30%" } }}
              >
                {queue.Forward}
              </Modal>
            </List.Item>
          </List>
        ));
      } else {
        tmp = <Icon loading className='stopwatch' size='huge' color='teal'
          style={{ marginLeft: '30%', width: '40%', marginRight: '30%', marginTop: '20%' }}
        />
      }

    }

    return tmp;
  };

  validateHN = async () => {
    if (this.state.HN.match(/[0-9]{4,10}[/]{1}[0-9]{2}/)) {
      this.getName(this.state.HN);
    } else if (!this.state.HN.match(/[0-9]{4,10}[/]{1}[0-9]{2}/)) {
      this.setState({
        errorHN: { status: true, message: "HN Does not match" }
      });
    }
  };

  getName = HN => {
    const patient = this.state.allPatient.filter(data => data.HN === HN)[0];
    if (patient) {
      this.setState({
        namePatient: patient.firstName + " ",
        lastNamePatient: patient.lastName,
        errorHN: { status: false, message: "" },
        errorGetName: { status: false, message: "" }
      });
    } else {
      this.setState({
        namePatient: "",
        lastNamePatient: "",
        errorGetName: { status: true, message: "" }
      });
    }
  };

  //เอาคิวออกมาก
  getQueue = async () => {
    const datas = await axios.get(`/getQueue/${this.state.roomId}`);
    this.setState({
      queues: datas.data,
    });
  };
  //getLab queue
  getLabQueue = async roomId => {
    const datas = await axios.get(`/getLabQueue/${roomId}`);
    this.setState({
      labQueues: datas.data
    });
  };
  //-----------

  callPatient = async () => {

    var tmp = null; //คิวแรก [0] ของห้องนั้นๆ (this.state.roomId)
    if (this.state.userType === 1) {
      for (let i = 0; i < this.state.queues.length; i++) {
        if (this.state.queues[i].roomId === this.state.roomId) {
          // เอาคิวของห้องที่อยู่ตอนนี้มาเก็บใน tmp (เอาค่าเดียว)
          tmp = this.state.queues[i];
          break;
        }
      }
    } else if (this.state.userType === 2) {
      tmp = this.state.listLabQueue[0];
    }

    var check = false;

    if (this.state.currentQueue.firstName === undefined) {
      //ไม่มีคิวปัจจุบัน
      console.log("ไม่มีคิวปัจจุบัน");
      if (tmp === null) {
        //ในห้องนี้ไม่มีคิว
        console.log("cannot");
      } else {
        //ในห้องนี้มีคิว >> update status q[0] = 3
        await axios.post("/updateQueue", {
          date: this.state.Date,
          HN: tmp.HN,
          statusId: 3
        });
        this.setState({
          currentQueue: tmp
        })
        check = true;
        // console.log("ห้อง" + this.state.roomId + " /" + tmp.HN);
      }
    } else {
      // มีคิวปัจจุบัน
      console.log("มีคิวปัจจุบัน");
      if (tmp === null || tmp === undefined) {
        //ในห้องนี้ไม่มีคิว >> update status currentQ = 4
        console.log("ไม่มีคิว");
        await axios.post("/updateQueue", {
          date: this.state.Date,
          HN: this.state.currentQueue.HN,
          statusId: 4
        });
        this.setState({
          currentQueue: {}
        })
      } else {
        //ในห้องนี้มีคิว >> update status q[0] = 3 , update status currentQ = 4 
        await axios.post("/updateQueue", {
          date: this.state.Date,
          HN: tmp.HN,
          statusId: 3
        });
        await axios.post("/updateQueue", {
          date: this.state.Date,
          HN: this.state.currentQueue.HN,
          statusId: 4
        });
        this.setState({
          currentQueue: tmp
        })



        // check = true;
        // console.log("มีคิว");
        // data = {
        //   HN: tmp.HN,
        //   previousHN: this.state.currentQueue.HN,
        //   Date: this.state.Date
        // };

      }
    }


    this.updateAvgTime();
    // await axios.post("/updateQueue", data);

    console.log("สรุปมีคิวปัจจุบันไหม ", tmp);
    // this.setState({
    //   currentQueue: check === true ? tmp : {}
    // });
    this.getQueue();
    this.getListLabQueue();
  };
  updateAvgTime = async () => {
    await axios.get(`/updateAllPerDay`);
  }

  getListLabQueue = async () => {
    const datas = await axios.get(`/getListLabQueue`);
    this.setState({
      listLabQueue: datas.data
    });
  };
  getPatientName = () => {
    let data = this.state.currentQueue;
    console.log(data)
    if (this.state.userType === 1) {
      return (
        <Segment id="boxshow">
          <Header as="h2" textAlign="center">
            <Icon name="user circle" />
            {data.firstName} {data.lastName}
          </Header>
          <Header as="h3" textAlign="center">
            <Icon name="numbered list" />
            HN :{data.HN}
          </Header>
          <Header as="h3" textAlign="center">
            <Icon name="arrow right" />
            Room : {data.roomId}
          </Header>
          <Header as="h3" textAlign="center">
            <Icon name="first aid" />
            Department : {data.department}
          </Header>
        </Segment>
      );
    } else if (this.state.userType === 2) {
      return (
        <Segment id="boxshow">
          <Header as="h2" textAlign="center">
            <Icon name="user circle" />
            {data.firstName} {data.lastName}
          </Header>
          <Header as="h3" textAlign="center">
            <Icon name="numbered list" />
            HN :{data.HN}
          </Header>
          <Header as="h3" textAlign="center">
            <Icon name="first aid" />
            Room/Department : {data.roomId} / {data.department}
          </Header>
          <Header as="h3" textAlign="center">
            <Icon name="edit outline" />
            Message : {data.Forward}
          </Header>
        </Segment>
      )
    }
    // else if (this.state.currentQueue.firstname === undefined){
    //   return <p>min</p>
    // }

  };

  forward = async () => {
    // insert Q ของ forward ทั้งหมด ([0] status =1 , [ที่เหลือ] status = 5)
    const date = this.pharseDate();
    if (this.state.forwardDepartments.length > 0) {
      this.state.forwardDepartments.map(async (forward, i) => {
        let doctorAndRoom = forward.doctorId.split("/");
        let tmp = {
          roomId: doctorAndRoom[1],
          // date: this.state.Date,
          day: date.day,
          month: date.month,
          year: date.year,
          // timeFormat: time,
          statusId: i === 0 ? 1 : 5,
          HN: this.state.currentQueue.HN,
          doctorId: doctorAndRoom[0],
          forward: forward.message,
          nurseId: this.state.nurseId,
          departmentId: forward.departmentId
        }
        console.log("forward", forward, tmp)
        await axios.post("/addPatientQ", tmp);
      })
    }
    // update status currentQ = 4
    await axios.post("/updateQueue", {
      date: this.state.Date,
      HN: this.state.currentQueue.HN,
      statusId: 4
    });
    this.setState({
      currentQueue: {},
      showModal: false,
      HN: "",
      forward: ""
    })



    // let forwardData = this.state.forwardDepartments.map((dep, i) => {
    //   let tmp = dep.doctorId.split("/");
    //   console.log(this.state.forwardDepartments)
    //   var data = {};
    //   if (this.state.currentQueue.firstName === undefined) {
    //     console.log("ไม่มีคิว");
    //     data = {
    //       HN: "",
    //       roomId: 0,
    //       forward: "",
    //       doctorId: "",
    //       typeForward: "",
    //       roomBack: 0,
    //       date : this.state.Date,
    //       statusId : 
    //     };
    //   } else {
    //     console.log("มีคิว");
    //       data = {
    //         HN: this.state.currentQueue.HN,
    //         roomId: tmp[1],
    //         forward: dep.message,
    //         doctorId: tmp[0],
    //         typeForward: dep.type,
    //         roomBack: this.state.forwardComeback ? this.state.roomId : 0,
    //         date : this.state.Date

    //       }
    //   }

    // // statusId: req.body.statusId,
    // // nurseId: req.body.nurseId

    //   console.log(data);
    //   axios.post("/updateForwardQueue", data);
    // })

    // this.setState({
    //   currentQueue: {},
    //   showModal: false,
    //   HN: "",
    //   forward: ""
    // });
    // this.getLabQueue(this.state.roomId);
  };



  // goBack = async () => {
  //   console.log("back");
  //   this.setState({
  //     currentQueue: {},
  //     HN: "",
  //     firstname: "",
  //     forward: ""
  //   });
  //   await axios.post("/updateCurrentLabQueue", {
  //     HN: this.state.currentQueue.HN
  //   });
  //   this.getLabQueue(this.state.roomId);
  // };

  //show patient at lab queues
  showPatientLabQueue = () => {
    const data = this.state.labQueues;
    // console.log(data)
    let tmp = "";
    if (this.state.userType === 1) {
      tmp = data
        .filter(queue => queue.roomId === this.state.roomId)
        .map(queue => (
          <List divided horizontal
            style={{
              backgroundColor: "white",
              width: "100%",
              borderBottom: "1px solid #E0E0E0",
              padding: "5px"
            }}>
            <List.Item>
              <List.Header
                style={{ fontSize: "36px", color: "teal", paddingLeft: "3%" }}>
                {queue.queueId}
              </List.Header>
            </List.Item>
            <List.Item>
              <List.Header style={{ fontSize: "16px", marginTop: "2%" }}>
                Name : {queue.firstName} {queue.lastName}
              </List.Header>
              <List.Content style={{ fontSize: "16px", marginTop: "3%" }}>
                HN: {queue.HN}

                <List.Content floated="right">
                  <Icon
                    name="circle "
                    color="orange"
                    style={{ marginTop: "5%" }}
                  />
                </List.Content>
              </List.Content>
            </List.Item>
          </List>

        ));
    }
    return tmp;
  };

  addMoreForward = async () => {

    let tmp = {
      type: this.state.forwardType, departmentId: this.state.forwardDepartmentId,
      doctorId: this.state.forwardDoctorId, message: this.state.forwardMessage
    }

    await this.setState({
      forwardDepartments: [...this.state.forwardDepartments, tmp],
      forwardType: "",
      forwardDepartmentId: "",
      forwardDoctorId: " ",
      forwardMessage: "",
      // forwardComeback: null,
      forwardRoomAndDoctors: []
    })
    console.log(this.state.forwardDepartments)
  }

  setValueInArray = (index, attr, value) => {
    let arr = this.state.forwardDepartments
    arr[index][attr] = value;
    this.setState({ forwardDepartments: arr })
  }

  //------------------------------------------------------
  showDropdownDepartment = () => {
    let tmp = <div>
      <Menu compact style={{ width: "100%", maxWidth: "100%", minWidth: '100%' }}>
        <Dropdown.Menu>

          <Dropdown
            style={{ maxWidth: '50%', minWidth: '50%' }}
            simple
            item
            placeholder="Department/Lab"
            options={labOrDepartment}
            onChange={async (e, { value }) => {
              this.setState({ forwardType: value })
            }}
          />
          <Dropdown
            disabled={
              this.state.forwardType === "Department" || this.state.forwardType === "Lab" ? false : true
            }
            style={{ maxWidth: '40%', minWidth: '40%' }}
            simple
            item
            placeholder="Department or Lab"
            options={this.state.forwardType === "Department" ? this.state.allDepartment : this.state.allLab}
            onChange={async (e, { value }) => {
              this.setState({
                forwardDepartmentId: value,
                forwardRoomAndDoctors: await this.doctorInDepartment(value)
              })
            }}

          />
          <br />
          <Dropdown
            style={{ maxWidth: '60%', minWidth: '60%' }}
            disabled={this.state.forwardRoomAndDoctors.length === 0}
            simple
            item
            placeholder="Room and Doctor"
            options={this.state.forwardRoomAndDoctors}
            onChange={async (e, { value }) => {
              this.setState({
                forwardDoctorId: value,
              })
              // this.addMoreForward(value)
            }}
          />
        </Dropdown.Menu >
        <Menu.Menu position='right'>
          <Menu.Item>
            <Button color="teal"
              onClick={() => { this.addMoreForward(); }}>
              Confirm
              </Button>
          </Menu.Item>
        </Menu.Menu>
      </Menu >
      <br />
      <TextArea
        style={{
          height: '100px', width: "60%", padding: "10px",
          marginRight: "20%", marginLeft: '20%', marginTop: "5%",
          borderRadius: "5px", border: "1px solid #dededf", marginBottom: '2%'
        }}
        placeholder="Tell us more"
        onChange={async (e, { value }) => {
          this.setField("forwardMessage", value);
        }}
      />
      <br />
      <center>
        <Label color='teal' style={{ marginRight: '2%' }}>ต้องการให้คนไข้กลับมาที่ห้องเดิมหรือเสร็จสิ้น</Label>
        <Radio
          style={{ paddingRight: '40px' }}
          label='Come back'
          name='checkComeOrNot'
          value={true}
          checked={this.state.forwardComeback === true}
          onChange={async (e, { value }) => {
            this.setState({
              forwardComeback: value,
            })
          }}
        >
        </Radio>
        <Radio
          label='Finished'
          name='checkComeOrNot'
          value={false}
          checked={this.state.forwardComeback === false}
          onChange={async (e, { value }) => {
            this.setState({ forwardComeback: value, })
          }}
        >
        </Radio>
      </center>
    </div >
    return tmp
  }

  //-----------------------------------------
  showListDepartment = () => {

    let tmp = this.state.forwardDepartments.map((dep, i) => {
      // var check = false

      return <Table.Row>
        <Table.Cell>{dep.type}</Table.Cell>
        <Table.Cell>{dep.departmentId}</Table.Cell>
        <Table.Cell >{dep.doctorId}</Table.Cell>
        <Table.Cell>{dep.message}</Table.Cell>
        <Table.Cell>
          <Icon name="pencil" />
          <Icon name="trash" />
        </Table.Cell>
      </Table.Row>


    })

    return tmp
  }

  render() {

    return (
      <div>
        <Headerbar />
        <DropdownQueue
          //state
          doctorId={this.state.doctorId}
          departmentId={this.state.departmentId}
          departments={this.state.departments}
          doctors={this.state.doctors}
          errorAdd={this.state.errorAdd}
          type={this.state.type}
          //Method
          chooseDoctor={this.chooseDoctor}
        // handleAdditio={this.handleAddition}
        />
        <br />
        <ListQueue
          //state
          HN={this.state.HN}
          modalIsOpen={this.state.modalIsOpen}
          errorHN={this.state.errorHN}
          errorGetName={this.state.errorGetName}
          errorAdd={this.state.errorAdd}
          namePatient={this.state.namePatient}
          lastNamePatient={this.state.lastNamePatient}
          showModal={this.state.showModal}
          departmentId={this.state.departmentId}
          departments={this.state.departments}
          doctors={this.state.doctors}
          allDepartment={this.state.allDepartment}
          // forwardId={this.state.forwardId}
          allLab={this.state.allLab}
          typeForward={this.state.typeForward}
          // forwardLabId={this.state.forwardLabId}
          // forwardDepartmentId={this.state.forwardDepartmentId}
          roomAndDoctors={this.state.roomAndDoctors}
          doctorRooms={this.state.doctorRooms}
          // message={this.state.message}
          userType={this.state.userType}
          // addForward={this.state.addForward}
          // amountDepartment={this.state.amountDepartment}
          // forwardDepartments={this.state.forwardDepartments}
          //Method

          forward={this.forward}
          validateHN={this.validateHN}
          setField={this.setField}
          addQueue={this.addQueue}
          showPatient={this.showPatient}
          getPatientName={this.getPatientName}
          callPatient={this.callPatient}
          checkDoctorWithRoom={this.checkDoctorWithRoom}
          showPatientLabQueue={this.showPatientLabQueue}
          // goBack={this.goBack}
          addMoreForward={this.addMoreForward}
          showListDepartment={this.showListDepartment}
          showDropdownDepartment={this.showDropdownDepartment}
        // setValueInArray={this.setValueInArray}
        />
        <br />
        <br />
      </div>
    );
  }
}
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    height: "30%"
  }
};
const labOrDepartment = [
  {
    key: 1,
    text: "Lab",
    value: "Lab"
  },
  {
    key: 2,
    text: "Department",
    value: "Department"
  },

];
export default Adminhome;
