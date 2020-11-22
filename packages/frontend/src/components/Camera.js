import { drawKeyPoints, drawSkeleton } from "./utils";
import React, { Component } from "react";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs-backend-webgl";

import RaindropContainer from "./RaindropContainer";
import "../assets/css/Camera.css";
import ButtonGroup from "./elements/ButtonGroup";
import Button from "react-bootstrap/Button";
import Modal from 'react-bootstrap/Modal';
import goku from "../assets/images/goku.png";
import fox from "../assets/images/mishoncomplete.png";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

class PoseNet extends Component {
  pushupPos1 = null;
  pushupPos2 = null;
  squatPos1 = null;
  squatPos2 = null;
  situpPos1 = null;
  situpPos2 = null;
  static defaultProps = {
    videoWidth: 771,
    videoHeight: 600,
    flipHorizontal: true,
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 2,
    nmsRadius: 20,
    outputStride: 16,
    imageScaleFactor: 0.5,
    skeletonColor: "#37c6ff",
    skeletonLineWidth: 6,
    loadingText: "Loading...please be patient...",
  };
  state = {
    loaded: false,
    timer: 0,
    isTimer: false,
    label: "",
    situps: 0,
    squats: 0,
    pushups: 0,
    isStock: false,
    timeTimer: 120,
    totalStocks: 3,
    isStartedGame: false,
    isCalibrated: false,
    isCalibrating: false,
    totalPoints: 0,
    strikes: 0,
    showModal: false
  };

  getCanvas = elem => {
    this.canvas = elem;
  };

  getVideo = elem => {
    this.video = elem;
  };

  async componentDidMount() {
    try {
      await this.setupCamera();
    } catch (error) {
      throw new Error(
        "This browser does not support video capture, or this device does not have a camera"
      );
    }

    try {
      this.posenet = await posenet.load({
        architecture: "ResNet50",
        outputStride: 32,
        inputResolution: { width: 250, height: 250 },
        quantBytes: 2,
        multiplier: 1,
      });
    } catch (error) {
      throw new Error("PoseNet failed to load");
    }

    this.detectPose();
    this.setState({ loaded: true });
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }
    const { videoWidth, videoHeight } = this.props;
    const video = this.video;
    video.width = videoWidth;
    video.height = videoHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: videoWidth,
        height: videoHeight,
      },
    });

    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve(video);
      };
    });
  }
  logPos() {
    console.log("aiyahh");
  }
  calculatePoints() {
    let points = 0;
    const PUSHPOINTS = 1000;
    const SITPOINTS = 800;
    const SQUATPOINTS = 900;
    points += this.state.pushups * PUSHPOINTS;
    points += this.state.situps * SITPOINTS;
    points += this.state.squats * SQUATPOINTS;
    this.setState({ totalPoints: points });
  }
  startTimer = async () => {
    this.setState({ isCalibrating: true });
    let calibrationArray = [
      "pushupPos1",
      "pushupPos2",
      "squatPos1",
      "squatPos2",
      "situpPos1",
      "situpPos2",
    ];
    let posMapping = {
      pushupPos1: "Pushup Upwards Position",
      pushupPos2: "Pushup Downwards Position",
      squatPos1: "Squat Upwards Position",
      squatPos2: "Squat Downwards Position",
      situpPos1: "Situp Upwards Position",
      situpPos2: "Situp Downwards Position",
    };

    // iterates through all the positions
    for (let posIdx = 0; posIdx < calibrationArray.length; posIdx++) {
      this.setState({
        timer: 5,
        isTimer: true,
        label: `Now go into a ${posMapping[calibrationArray[posIdx]]}`,
      });

      for (let i = 0; i >= 0; i--) {
        await this.timeout(1000);
        this.setState({ timer: i, isTimer: true });
      }

      this[calibrationArray[posIdx]] = await this.getPose();
    }
    this.setState({ timer: 0, isTimer: false, label: "", isCalibrated: true });
  };

  async getPose() {
    const {
      algorithm,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPartConfidence,
      maxPoseDetections,
      nmsRadius,
    } = this.props;

    const posenetModel = this.posenet;
    const video = this.video;

    const findPoseDetectionFrame = async () => {
      let poses = [];

      const pose = await posenetModel.estimateSinglePose(video, {
        flipHorizontal,
      });

      poses.push(pose);

      return poses;
    };
    return await findPoseDetectionFrame();
  }
  async timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }
  detectPose() {
    const { videoWidth, videoHeight } = this.props;
    const canvas = this.canvas;
    const canvasContext = canvas.getContext("2d");

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    this.poseDetectionFrame(canvasContext);
  }

  poseDetectionFrame(canvasContext) {
    const {
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPoseConfidence,
      minPartConfidence,
      maxPoseDetections,
      nmsRadius,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      showSkeleton,
      skeletonColor,
      skeletonLineWidth,
    } = this.props;

    const posenetModel = this.posenet;
    const video = this.video;

    const findPoseDetectionFrame = async () => {
      let poses = [];

      const pose = await posenetModel.estimateSinglePose(video, {
        flipHorizontal,
      });
      poses.push(pose);

      canvasContext.clearRect(0, 0, videoWidth, videoHeight);

      if (showVideo) {
        canvasContext.save();
        canvasContext.scale(-1, 1);
        canvasContext.translate(-videoWidth, 0);
        canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight);
        canvasContext.restore();
      }

      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          if (showPoints) {
            drawKeyPoints(
              keypoints,
              minPartConfidence,
              skeletonColor,
              canvasContext
            );
          }
          if (showSkeleton) {
            drawSkeleton(
              keypoints,
              minPartConfidence,
              skeletonColor,
              skeletonLineWidth,
              canvasContext
            );
          }
        }
      });
      requestAnimationFrame(findPoseDetectionFrame);
    };
    findPoseDetectionFrame();
  }

  main = async () => {
    this.setState({ isStartedGame: true });
    while (true) {
      const pose = await this.getPose();
      if (this.isWithinInterval(pose, this.pushupPos1)) {
        await this.checkPushup();
      } else if (this.isWithinInterval(pose, this.squatPos1)) {
        await this.checkSquat();
      } else if (this.isWithinInterval(pose, this.situpPos1)) {
        await this.checkSitup();
      }

      if (true) {
        this.handleShow();
        return;
      }
    }
  };

  async checkPushup() {
    console.log("1");
    while (true) {
      const pose = await this.getPose();
      if (
        this.isWithinInterval(pose, this.squatPos1) ||
        this.isWithinInterval(pose, this.situpPos1)
      ) {
        return;
      }
      if (this.isWithinInterval(pose, this.pushupPos2)) {
        break;
      }
    }
    while (true) {
      const pose = await this.getPose();
      if (
        this.isWithinInterval(pose, this.squatPos1) ||
        this.isWithinInterval(pose, this.situpPos1)
      ) {
        return;
      }
      if (this.isWithinInterval(pose, this.pushupPos1)) {
        break;
      }
    }
    this.setState({ pushups: this.state.pushups + 1 });
    this.calculatePoints();
    await this.timeout(500);
    return;
  }
  async startRealTimer() {
    while (this.state.timeTimer > 0) {
      await this.setTimeout(1000);
      this.setState({ timeTimer: this.state.timeTimer - 1 });
    }
  }
  async checkSquat() {
    console.log("2");

    while (true) {
      const pose = await this.getPose();
      if (
        this.isWithinInterval(pose, this.pushupPos1) ||
        this.isWithinInterval(pose, this.situpPos1)
      ) {
        return;
      }
      if (this.isWithinInterval(pose, this.squatPos2)) {
        break;
      }
    }
    while (true) {
      const pose = await this.getPose();
      if (
        this.isWithinInterval(pose, this.pushupPos1) ||
        this.isWithinInterval(pose, this.situpPos1)
      ) {
        return;
      }
      if (this.isWithinInterval(pose, this.squatPos1)) {
        break;
      }
    }
    this.setState({ squats: this.state.squats + 1 });
    this.calculatePoints();
    await this.timeout(500);
    return;
  }

  async checkSitup() {
    console.log("3");

    while (true) {
      const pose = await this.getPose();
      if (
        this.isWithinInterval(pose, this.squatPos1) ||
        this.isWithinInterval(pose, this.pushupPos1)
      ) {
        return;
      }
      if (this.isWithinInterval(pose, this.situpPos2)) {
        break;
      }
    }
    while (true) {
      const pose = await this.getPose();
      if (
        this.isWithinInterval(pose, this.squatPos1) ||
        this.isWithinInterval(pose, this.pushupPos1)
      ) {
        return;
      }
      if (this.isWithinInterval(pose, this.situpPos1)) {
        break;
      }
    }
    this.setState({ situps: this.state.situps + 1 });
    this.calculatePoints();
    await this.timeout(500);
    return;
  }

  isWithinInterval(pose1, pose2) {
    const TOLERANCE = 30;
    const CONFIDENCE = 0.8;
    let count = 0;
    for (let i = 0; i < pose1[0].keypoints.length; i++) {
      if (pose2[0].keypoints[i].score > CONFIDENCE) {
        if (
          Math.abs(
            pose1[0].keypoints[i].position.x - pose2[0].keypoints[i].position.x
          ) > TOLERANCE ||
          Math.abs(
            pose1[0].keypoints[i].position.y - pose2[0].keypoints[i].position.y
          ) > TOLERANCE
        ) {
          count++;
        }
      }
    }
    if (count < 4) {
      return true;
    } else {
      return false;
    }
  }

  changeGameMode = event => {
    this.setState({ isStock: !this.state.isStock })
    console.log(this.state.isStock);
  };

  setStrikes = () => {
    this.setState({
      strikes: this.state.strikes + 1
    })
  }

  renderStocks = () => {
    let stockArr = [];

    for (let i = 0; i < 3 - this.state.strikes; i++) {
      stockArr.push(<img src={fox} alt="Fox" className="fox" />);
    }

    return stockArr;
  }

  handleClose = () => {
    this.setState({
      showModal: false
    })
  }

  handleShow = () => {
    this.setState({
      showModal: true
    })
  }

  render() {
    return (
      <div className="cams">
        <div className="left-side">
          <video id="videoNoShow" playsInline ref={this.getVideo} />

          <Modal show={true} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                Close
                </Button>
              <Button variant="primary" onClick={this.handleClose}>
                Save Changes
                </Button>
            </Modal.Footer>
          </Modal>

          <canvas className="webcam" ref={this.getCanvas} />
          <br />
          <div className="row">
            <RaindropContainer
              width={this.props.videoWidth}
              height={this.props.videoHeight}
              loaded={this.state.loaded}
              main={this.main}
              pushupCount={this.state.pushups}
              situpCount={this.state.situps}
              squatCount={this.state.squats}
              startTimer={this.startTimer}
              isStock={this.state.isStock}
              strikes={this.state.strikes}
              setStrikes={this.setStrikes}
            />

            <FormControl component="fieldset">
              <RadioGroup row aria-label="isStock" style={{ marginLeft: "15px", marginTop: "12px" }} name="isStock" value={this.state.isStock} onChange={this.changeGameMode}>
                <FormControlLabel value={true} control={<Radio />} label="Stock" />
                <FormControlLabel value={false} control={<Radio />} label="Zen mode" />
              </RadioGroup>
            </FormControl>
          </div>
          {this.state.isTimer ? (
            <p className="time" style={{ color: "white" }}>
              Time: {this.state.timer}
            </p>
          ) : null}

          <h3 className="instructions">{this.state.label}</h3>
        </div>
        <div className="right-side">
          <div className="inner-right-side">
            <div>
              <h3 className="stats-title">Stats</h3>
              <p className="stat-items">Situps: {this.state.situps}</p>
              <p className="stat-items">Pushups: {this.state.pushups}</p>
              <p className="stat-items">Squats: {this.state.squats}</p>
              <p className="stat-items">Points: {this.state.totalPoints}</p>
              {this.state.isStock ? <p className="stat-items" style={{ float: "left" }}>Stocks: </p> : null}
              {this.state.isStock ? this.renderStocks() : null}
            </div>
            <img src={goku} alt="goku" className="goku" />
          </div>
        </div>
      </div>
    );
  }
}

export default PoseNet;
