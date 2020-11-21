import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Webcam from './Webcam';
import reportWebVitals from './reportWebVitals';
const videoConstraints = {
  width: { min: 480 },
  height: { min: 720 },
  aspectRatio: 0.6666666667
};

ReactDOM.render(
  <Webcam 
    videoConstraints={videoConstraints} 
    width={480} 
    height={720}
   />,
  document.getElementById("webcam")
);
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
