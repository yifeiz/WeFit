import { drawKeyPoints, drawSkeleton } from "./utils";
import React, { Component } from "react";
import * as posenet from "@tensorflow-models/posenet";
import "@tensorflow/tfjs-backend-webgl";

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
    algorithm: "single-pose",
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 2,
    nmsRadius: 20,
    outputStride: 16,
    imageScaleFactor: 0.5,
    skeletonColor: "#ffadea",
    skeletonLineWidth: 6,
    loadingText: "Loading...please be patient...",
  };

  constructor(props) {
    super(props, PoseNet.defaultProps);
    this.state = {
      timer: 0,
      isTimer: false,
      label: "",
      situps:0,
      squats:0,
      pushups:0,
    };
  }

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
        multiplier: 1
      });
    } catch (error) {
      throw new Error("PoseNet failed to load");
    } finally {
      setTimeout(() => {
        this.setState({ loading: false });
      }, 200);
    }

    this.detectPose();
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
    console.log('aiyahh');
  }

  async startTimer() {
    let calibrationArray = ["pushupPos1", "pushupPos2", "squatPos1", "squatPos2", "situpPos1", "situpPos2"]
    let posMapping = {
      "pushupPos1": "Pushup Upwards Position",
      "pushupPos2": "Pushup Downwards Position",
      "squatPos1": "Squat Upwards Position",
      "squatPos2": "Squat Downwards Position",
      "situpPos1": "Situp Upwards Position",
      "situpPos2": "Situp Downwards Position"
    }

    // iterates through all the positions
    for (let posIdx = 0; posIdx < calibrationArray.length; posIdx++) {
      this.setState({ timer: 5, isTimer: true, label: `Now go into a ${posMapping[calibrationArray[posIdx]]}` });

      for (let i = 4; i >= 0; i--) {
        await this.timeout(1000);
        this.setState({ timer: i, isTimer: true });
        console.log(this.state)
      }

      this.setState({ timer: 0, isTimer: false });
      //call capture function
      // this.pushupPos1 = this.detectPose();

      this[calibrationArray[posIdx]] = await this.getPose();
      console.log(this[calibrationArray[posIdx]]);
    }

    // remove the label
    this.setState({ label: "" });

    await this.main();
  }
  

  async getPose(){
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

      switch (algorithm) {
        case "multi-pose": {
          poses = await posenetModel.estimateMultiplePoses(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride,
            maxPoseDetections,
            minPartConfidence,
            nmsRadius
          );
          break;
        }
        case "single-pose":
        default: {
          const pose = await posenetModel.estimateSinglePose(video, {
            flipHorizontal
          });

          poses.push(pose);
          break;
        }
      }

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
      algorithm,
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

      switch (algorithm) {
        case "multi-pose": {
          poses = await posenetModel.estimateMultiplePoses(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride,
            maxPoseDetections,
            minPartConfidence,
            nmsRadius
          );
          break;
        }
        case "single-pose":
        default: {
          const pose = await posenetModel.estimateSinglePose(video, {
            flipHorizontal
          });

          poses.push(pose);
          break;
        }
      }

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


  async main(){
    while(true){
      const pose = await this.getPose()
      if(this.isWithinInterval(pose,this.pushupPos1)){
          this.checkPushup();
      }
      else if(this.isWithinInterval(pose,this.squatPos1)){
          this.checkSquat();
      }
      else if(this.isWithinInterval(pose,this.situpPos1)){
        this.checkSitup();
      }
    }
  }

  async checkPushup(){
    while(true){
      const pose = await this.getPose()
      if(this.isWithinInterval(pose,this.pushupPos2)){
        break;
      }
    }
    while(true){
      const pose = await this.getPose()
        if(this.isWithinInterval(pose,this.pushupPos1)){
            break;
        }
    }
    this.setState({pushups:this.state.pushups+1});
  }

  async checkSquat(){
    while(true){
      const pose = await this.getPose()
      if(this.isWithinInterval(pose,this.squatPos1)){
        break;
      }
    }
    while(true){
      const pose = await this.getPose()
        if(this.isWithinInterval(pose,this.squatPos2)){
            break;
        }
    }
    this.setState({squats:this.state.squats+1});
  }

  async checkSitup(){
    while(true){
      const pose = await this.getPose()
      if(this.isWithinInterval(pose,this.situpPos1)){
        break;
      }
    }
    while(true){
      const pose = await this.getPose()
        if(this.isWithinInterval(pose,this.situpPos2)){
            break;
        }
    }
    this.setState({situps:this.state.situps+1});
  }

  isWithinInterval(pose1, pose2){
    const TOLERANCE = 50;
    const CONFIDENCE = 0.7;
    for(let i = 0; i < pose1[0].keypoints.length;i++){
      if(pose1[0].keypoints[i].score > CONFIDENCE && pose2[0].keypoints[i].score > CONFIDENCE){
        if(Math.abs(pose1[0].keypoints[i].position.x - pose2[0].keypoints[i].position.x) > TOLERANCE && Math.abs(pose1[0].keypoints[i].position.y - pose2[0].keypoints[i].position.y) > TOLERANCE){
          return false;
        }
      }
    }
    return true;
  }


  render() {
    return (
      <div>
        <div>
          <video id="videoNoShow" playsInline ref={this.getVideo} />
          <canvas className="webcam" ref={this.getCanvas} /><br></br>
          <button onClick={() => this.startTimer()}>
            Start Calibration System
          </button>
          {this.state.isTimer && <p>time: {this.state.timer}</p>}
          <h3>{this.state.label}</h3>
          <p>situps: {this.state.situps}</p>
          <p>pushups: {this.state.pushups}</p>
          <p>squats: {this.state.squats}</p>
        </div>
      </div>
    );
  }
}


export default PoseNet;
