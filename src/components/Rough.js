import React, { Component } from 'react';
import request from 'superagent';
import lodash from 'lodash';
import { Grid, Row, Col } from 'react-flexbox-grid';
import async from 'async';

// import { List, ListItem } from 'material-ui/List';
import { List, ListItem } from '@material-ui/core/List';
// import MenuItem from 'material-ui/MenuItem';
import MenuItem from '@material-ui/core/MenuItem';
// import SelectField from 'material-ui/SelectField'
import SelectField from '@material-ui/core/Select'
// import Subheader from 'material-ui/Subheader';
import Subheader from '@material-ui/core/ListSubheader';
// import LinearProgress from 'material-ui/LinearProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
// import Dialog from 'material-ui/Dialog';
import Dialog from '@material-ui/core/Dialog';
// import FlatButton from 'material-ui/FlatButton';
import FlatButton from '@material-ui/core/Button';
// import Note from 'material-ui/svg-icons/av/note';
import Note from '@material-ui/icons/Note';

import AssignmentSubmission from '../AssignmentSubmission';
import { SessionExpiredBlock, HTTPErrorNormalizer } from '../common';
import MyAssignmentListItem from "./MyAssignmentListItem";
import { LetterAvatar } from '../common';
import Lookup from '../common/Lookup';
import MarkdownRenderer from '../common/MarkdownRenderer';
import RepoBranchView from '../common/RepoBranchView';

export default class AssignmentList extends Component {
  constructor() {
    super();

    this.state = {
      unauthorized: false,
      error: undefined,
      assignmentRepoColln: [],
      progressColln: false,
      selectedOrder: '',
      scoresProgress: false,
      assignmentStatus: [],
      fileOpenDialog: false,
      fileContent: '',
      fileContentError: undefined,
      fileName: '',
      fileProgressColln: false,
    };

    this.styles = {
      pgTitle: {
        fontSize: "18px",
        margin: "10px auto auto 5px",
        padding: "0px",
        fontWeight: "600"
      },
      IconMenu: {
        marginTop: '18px',
        textDecoration:'none'
      },
      placeHolder: {
        fontSize: "20px",
        margin: "10px auto auto 5px",
        padding: "100px",
        height: "100%",
        background: "#efefef",
        color: "#949494",
        borderRadius: "3px"
      },
      customStyle: {
        width: '80%',
        maxWidth: '100%',
      },
      dialogTitle: {
        background: "#ececec",
        fontSize: "18px",
        fontWeight: "500"
      },
    };
  }

  componentDidMount() {
    this.getAssignments();
  };

  getAssignments = () => {
    this.setState({
      progressColln: true
    })
    request
      .get('/api/v1/assignments/myprogress')
      .end((err, res) => {
        if (err) {
          let { msg, unauthorized } = HTTPErrorNormalizer.normalizeError(err, res);
          return this.setState({
            unauthorized: unauthorized,
            error: msg,
            progressColln: false
          });
        }

        if (!res.body || res.body.length <= 0) {
          return this.setState({
            progressColln: false
          });
        }

        // let sortedCollection = res.body.sort((prev, next) => (lodash.isEmpty(next.evaluations) - lodash.isEmpty(prev.evaluations)));
        this.setState({
          assignmentRepoColln: res.body,
          progressColln: false,
        },() => {
          this.getAssignmentSubmissions()
        });
      })
  }

  getAssignmentSubmissions = () => {
    this.state.assignmentRepoColln.map((assignment, index) => {
      this.getSubmissionStatus(assignment)
    })
  }

  // // Getting assignments of a loggedin user
  // getAssignmentList = (done) => {
  //   request
  //     .get('/api/v1/assignments/')
  //     .end((err, res) => {
  //       if (err) {
  //         let { msg, unauthorized } = HTTPErrorNormalizer.normalizeError(err, res);
  //         return this.setState({
  //           unauthorized: unauthorized,
  //           error: msg,
  //           progressColln: false
  //         });
  //       }

  //       if (!res.body || res.body.length <= 0) {
  //         return this.setState({
  //           progressColln: false,
  //         });
  //       }

  //       let sortedCollection = res.body.sort((prev, next) => (lodash.isEmpty(next.evaluations) - lodash.isEmpty(prev.evaluations)));
  //       this.setState({
  //         assignmentRepoColln: res.body,
  //         progressColln: false,
  //       });
  //       done(null, res.body);
  //     });
  // }

  // // getting submission status for a each user with assignment repo
  getSubmissionStatus = (assignment) => {
    let now = new Date();  //this date format give midnyt time so by giving +2 it show till midnight
    let dayTS = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2).getTime() / 1000;

    let assignmentRepoColln = this.state.assignmentRepoColln;
    let startDate = new Date(2017,0,1);
    let startDateTimeStamp = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 2).getTime() / 1000;
    request
      .get(`/api/v1/evaluations/submissions/report/${dayTS}?limit=1&order=-1&q=before&assignment=${assignment.ssh}&startDate=${START_DATE || startDateTimeStamp}`)
      .end((err, res) => {
        if (err) {
          let { msg, unauthorized } = HTTPErrorNormalizer.normalizeError(err, res);
          return this.setState({
            unauthorized: unauthorized,
            error: msg,
          });
        }

        let updateSubmission = assignmentRepoColln;
        let index = lodash.findIndex(updateSubmission, { ssh : assignment.ssh });
        updateSubmission[index] = Object.assign({}, assignment, { evaluations: res.body.evaluations, evalStatus: true});
        this.setState({
          assignmentRepoColln: updateSubmission,
        });
      });
  }

  getAssignmentRepoFile = (assignmentDetails, fileName) => {
    this.setState({
      assignmentDetails: undefined,
      fileName: fileName,
      fileContentError: undefined,
      fileProgressColln: true,
      fileOpenDialog: true
    })

    request
      .get(`/api/v1/repos/projects/${assignmentDetails.id}/repository/${fileName}?repoRef=${assignmentDetails.defaultBranch}&repoUrl=${assignmentDetails.ssh}&repoRefType=${assignmentDetails.solutionRepoRefType}`)
      .end((err, res) => {
        if (err || res.text.length < 2) {
          let { msg, unauthorized } = HTTPErrorNormalizer.normalizeError(err, res);
          return this.setState({
            unauthorized: unauthorized,
            fileContentError: msg,
            fileOpenDialog: true,
            assignmentDetails: assignmentDetails,
            fileProgressColln: false,
          });
        } else {
          this.setState({
            fileContent: res.text,
            fileOpenDialog: true,
            assignmentDetails: assignmentDetails,
            fileProgressColln: false,
          });
        }
      });
  };

  getAssignmentsNotFoundBlock = () => {
    return (
      <Grid fluid>
        <Row center="xs">
          <Col xs={12}>
            <Row middle="xs">
              <Col xs={12}>
                <div style={this.styles.placeHolder}>
                  {"You seems to have no Assignments assigned, please check with your coordinator"}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    )
  }

  handleChange = (event, index, value) => {
    let assignmentRepoColln = this.state.assignmentRepoColln;
    if (value === 'submitted') {
      let sortedCollection = assignmentRepoColln.sort((prev, next) => {
        return (lodash.isEmpty(prev.evaluations) - lodash.isEmpty(next.evaluations));
      });
      this.setState({
        assignmentRepoColln: sortedCollection,
        selectedOrder: value,
      });
    } else {
      let sortedCollection = assignmentRepoColln.sort((prev, next) => {
        return (lodash.isEmpty(next.evaluations) - lodash.isEmpty(prev.evaluations));
      });
      this.setState({
        assignmentRepoColln: sortedCollection,
        selectedOrder: value,
      });
    }
  }

  getAssignmentListView = () => {
    return this.state.assignmentRepoColln.map((assignment, index) => {
      return (<div key={index+1}>
        <MyAssignmentListItem
          index={index + 1}
          userAssignmentDetails={assignment}
          getAssignmentRepoFile={this.getAssignmentRepoFile}
        /></div>
      )
    })
  }

  showFileContentDialogBlock = () => {
    return (
      <Dialog
        title={(!this.state.assignmentDetails) ? <h4> {"Loading file content"} </h4> :
          <Row start="xs" style={{ width: '100%' }}>
            <Col style={{ "marginLeft": "10px" }}>
              <LetterAvatar data={this.state.assignmentDetails.groupname} />
            </Col>
            <Col xs={11}>
              <Col>
                <div style={{ wordBreak: 'break-word', marginBottom: '-10px' }}>
                  <span> {`${lodash.startCase(this.state.assignmentDetails.name)}`} 
                    <RepoBranchView tooltip={'Assignment repo branch name'} repoBranch={this.state.assignmentDetails.defaultBranch}/>
                  </span>
                </div>
              </Col>
              <div style={{ "color": "#A7A7A7", wordBreak: 'break-word', marginBottom: '-10px' }}><small>{`${this.state.assignmentDetails.ssh} # ${this.state.assignmentDetails.defaultBranch}`}</small></div>
            </Col>
          </Row>
        }
        titleStyle={this.styles.dialogTitle}
        actions={[<FlatButton label="Close" primary={true} onClick={this.handleProblemFileDialogClose} />]}
        modal={true}
        contentStyle={this.styles.customStyle}
        open={this.state.fileOpenDialog}
        onRequestClose={this.handleProblemFileDialogClose}
        autoScrollBodyContent={true}>
        <Grid>
          <Row>
            <Col style={{margin: "10px 10px 0px 50px"}}>
              <Note color={"#A7A7A7"} />
            </Col>
            <Col style={{marginTop: "13px"}}>
              <div>{this.state.fileName}</div>
            </Col>
          </Row>
        </Grid>
        {(this.state.fileProgressColln) ?
          <Grid fluid>
            <Row center="xs">
              <Col xs={12}>
                <div style={{ padding: '50px' }}>
                  <LinearProgress mode="indeterminate" />
                </div>
              </Col>
            </Row>
          </Grid>
          : (lodash.isEmpty(this.state.fileContent) || this.state.fileContentError) ?
            <Row center='xs'>
              <Col>
                <div style={{ color: '#A9A9A9', fontSize: '20px', marginTop: '20px' }}>{`Reference file \"${this.state.fileName}\" does not exists for selected assignment, which is not mendatory...!`}</div>
              </Col>
            </Row>
            : (this.state.fileName === Lookup.standardFileExtension.gitlabCiFile) ?
              <div style={{ marginLeft: '50px' }}>
                <div style={{ marginTop: '10px', color: '#A9A9A9' }}><span>PS: This is the sample .gitlab-ci.yml file for this assignment, Please refer this as reference to add .gitlab-ci.yml in your submission repo.</span></div>
                <div>
                  <div><MarkdownRenderer>{this.state.fileContent}</MarkdownRenderer></div>
                </div>
              </div>
              : <div style={{ margin: '10px 10px 10px 50px' }}><MarkdownRenderer>{this.state.fileContent}</MarkdownRenderer></div>
        }
      </Dialog>
    )
  };

  handleProblemFileDialogClose = () => {
    this.setState({
      fileOpenDialog: false
    });
  }

  render() {
    if (this.state.progressColln) {
      return (
        <Grid fluid>
          <Row center="xs">
            <Col xs={12}>
              <div style={{ padding: '200px' }}>
                <LinearProgress mode="indeterminate" />
              </div>
            </Col>
          </Row>
        </Grid>
      )
    };

    if (this.state.unauthorized) {
      return <SessionExpiredBlock />;
    }

    if (this.state.error) {
      return (
        <Grid fluid>
          <Row center="xs">
            <Col xs={12}>
              <Row middle="xs">
                <Col xs={12}>
                  <div style={this.styles.placeHolder}>
                    <b>Error</b>
                    <p style={this.styles.errorMsg}>{this.state.error}</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      )
    }

    return (
      <div>
      {(this.state.fileOpenDialog) ? this.showFileContentDialogBlock() : ''}
        <Grid fluid style={{ marginBottom: "30px" }}>
          <Row center="xs">
            <Col xs={12} md={12} lg={11}>

              <Row start="xs" style={{ marginBottom: '1%' }}>
                <Col>
                  <div style={this.styles.pgTitle}>
                    {"My Assignments"}
                  </div>
                </Col>
              </Row>

              <Row start="xs">
                <Col style={{ margin: "10px auto auto 5px", color: '#A9A9A9' }}>
                  <small>{"PS: These are assignments you should solve and submit for evaluations"}</small>
                </Col>
              </Row>

              <Row end="xs">
                <Col xs={10}>
                  <Subheader>
                    {(this.state.assignmentRepoColln) ? 'Total Assignment: ' + this.state.assignmentRepoColln.length : ''}
                  </Subheader>
                </Col>
              </Row>

              <Row end="xs" style={{ "marginLeft": '2%' }}>
                <Col>
                  <Subheader> {"Sort by:"} </Subheader>
                </Col>
                <Col>
                  <SelectField hintText="Please select..." value={(this.state.selectedOrder)} autoWidth={false} onChange={this.handleChange} style={{ "marginLeft": "10px", width: '150px' }}>
                    <MenuItem value={"submitted"} primaryText="Submitted" />
                    <MenuItem value={"pending"} primaryText="Pending" />
                  </SelectField>
                </Col>
              </Row>

              <Row start="xs">
                <Col xs={12} style={{ height: '40%' }}>
                  <List>
                    {(!this.state.progressColln && lodash.isEmpty(this.state.assignmentRepoColln)) ? this.getAssignmentsNotFoundBlock() : this.getAssignmentListView()}
                  </List>
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}