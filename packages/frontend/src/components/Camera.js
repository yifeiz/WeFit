import { drawKeyPoints, drawSkeleton } from "./utils";
import React, { Component } from "react";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs-backend-webgl";
import RaindropContainer from "./RaindropContainer";

class PoseNet extends Component {
  pushupPos1 = null;
  pushupPos2 = null;
  squatPos1 = null;
  squatPos2 = null;
  situpPos1 = null;
  situpPos2 = null;
  static defaultProps = {
    videoWidth: 900,
    videoHeight: 700,
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
    isStock:false,
    timeTimer:120,
    totalStocks:3,
    isStartedGame:false,
    isCalibrated:false,
    isCalibrating:false
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
    console.log("Blah");
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

  async startTimer() {
    this.setState({isCalibrating:true  });
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

      for (let i = 4; i >= 0; i--) {
        await this.timeout(1000);
        this.setState({ timer: i, isTimer: true });
        console.log(this.state);
      }

      this[calibrationArray[posIdx]] = await this.getPose();
      console.log(this[calibrationArray[posIdx]]);
    }
    this.setState({ timer: 0, isTimer: false,label: "", isCalibrated:true  });
  }

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
    this.setState({isStartedGame:true});
    while (true) {
      const pose = await this.getPose();
      console.log(pose);
      if (this.isWithinInterval(pose, this.pushupPos1)) {
        await this.checkPushup();
      } else if (this.isWithinInterval(pose, this.squatPos1)) {
        await this.checkSquat();
      } else if (this.isWithinInterval(pose, this.situpPos1)) {
        await this.checkSitup();
      }
    }
  };

  async checkPushup() {
    console.log("1");
    while (true) {
      const pose = await this.getPose();
      if(this.isWithinInterval(pose, this.squatPos1) || this.isWithinInterval(pose,this.situpPos1)){
        return;
      }
      if (this.isWithinInterval(pose, this.pushupPos2)) {
        break;
      }
    }
    while (true) {
      const pose = await this.getPose();
      if(this.isWithinInterval(pose, this.squatPos1) || this.isWithinInterval(pose,this.situpPos1)){
        return;
      }
      if (this.isWithinInterval(pose, this.pushupPos1)) {
        break;
      }
    }
    this.setState({ pushups: this.state.pushups + 1 });
    await this.timeout(500);
    return;
  }

  async checkSquat() {
    console.log("2");

    while (true) {
      const pose = await this.getPose();
      if(this.isWithinInterval(pose, this.pushupPos1) || this.isWithinInterval(pose,this.situpPos1)){
        return;
      }
      if (this.isWithinInterval(pose, this.squatPos2)) {
        break;
      }
    }
    while (true) {
      const pose = await this.getPose();
      if(this.isWithinInterval(pose, this.pushupPos1) || this.isWithinInterval(pose,this.situpPos1)){
        return;
      }
      if (this.isWithinInterval(pose, this.squatPos1)) {
        break;
      }
    }
    this.setState({ squats: this.state.squats + 1 });
    await this.timeout(500);
    return;
  }

  async checkSitup() {
    console.log("3");

    while (true) {
      const pose = await this.getPose();
      if(this.isWithinInterval(pose, this.squatPos1) || this.isWithinInterval(pose,this.pushupPos1)){
        return;
      }
      if (this.isWithinInterval(pose, this.situpPos2)) {
        break;
      }
    }
    while (true) {
      const pose = await this.getPose();
      if(this.isWithinInterval(pose, this.squatPos1) || this.isWithinInterval(pose,this.pushupPos1)){
        return;
      }
      if (this.isWithinInterval(pose, this.situpPos1)) {
        break;
      }
    }
    this.setState({ situps: this.state.situps + 1 });
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

  render() {
    return (
      <div>
        <video id="videoNoShow" playsInline ref={this.getVideo} />
        <canvas className="webcam" ref={this.getCanvas} />
        <br></br>
        {!this.state.isCalibrating && <button onClick={() => this.startTimer()}>
          Start Calibration System
        </button>}
        
        {this.state.isTimer && <p>time: {this.state.timer}</p>}
        <h3>{this.state.label}</h3>
        {this.state.isStartedGame && <p>situps: {this.state.situps}</p>}
        {this.state.isStartedGame && <p>pushups: {this.state.pushups}</p>}
        {this.state.isStartedGame && <p>squats: {this.state.squats}</p>}
        {this.state.isCalibrated &&
        <RaindropContainer
          width={this.props.videoWidth}
          height={this.props.videoHeight}
          loaded={this.state.loaded}
          main={this.main}
        />}
      </div>
    );
  }
}

export default PoseNet;
