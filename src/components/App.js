import React from 'react';
import '../styles/App.css';

import Launch from "./mainScreen/pages/Launch";
import CalibrateLaser from "./mainScreen/pages/CalibrateLaser";
import CalibrateWebcam from "./mainScreen/pages/CalibrateWebcam";
import RunShootingMode from "./mainScreen/pages/RunShootingMode";
import Welcome from "./mainScreen/pages/Welcome";
import ProjectorScreen from "./targetScreen/ProjectorScreen";

import {Container, Row, Col} from "react-bootstrap";
import {backgroundColor, color, color4} from "../config";
import SelectMode from "./mainScreen/pages/SelectMode";

import {BrowserRouter,  Route, Switch} from "react-router-dom";
import { createBrowserHistory } from "history";
import {connect} from "react-redux";
import GoogleAnalyticsUtils from "../util/GoogleAnalyticsUtils";
import {BrowserView, isMobile} from "react-device-detect";


window.routerHistory = createBrowserHistory();
GoogleAnalyticsUtils.init();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cvLoaded: true, //making this true because the onOpenCV method is flaky
            launchWindow: false,
            currentPage: "welcome",
            showVideo: false,
            shootingMode: null,
            videoReady: false
        }
        this.videoRef = React.createRef();
    }

    componentDidMount() {
        window.onOpenCV = () => {console.log("OpenCV Loaded");this.setState({ cvLoaded: true })};

        if (!isMobile) {
            const video = this.videoRef.current;
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((stream)  => {
                    video.srcObject = stream;
                    video.onplay = () => {
                        GoogleAnalyticsUtils.set({
                            videoWidth: video.videoWidth,
                            videoHeight: video.videoHeight
                        });
                        this.setState({
                            videoReady: true
                        });
                    }
                    video.play();
                })
                .catch((err) => {
                    console.log("An error occurred! " + err);
                });
        }

    }

    toggleVideo() {
        this.setState({
            showVideo: !this.state.showVideo
        })
    }

    render() {
        return (
            <BrowserRouter history={window.routerHistory}>
                <section className={"page"} style={{backgroundColor: backgroundColor, color: color}}>
                    <div className={"header"}>
                        <div style={{borderBottom: "1px solid white"}}>
                            <a href={"/"}>
                            <img src={"/logo.svg"} style={{height: "100px", marginBottom: "10px"}}/>
                            </a>
                        </div>
                    </div>
                    <Container>
                        <Switch>
                            <Route path={"/calibrateLaser"}>
                                <CalibrateLaser videoRef={this.videoRef}/>
                            </Route>
                            <Route path={"/calibrateWebcam"}>
                                <CalibrateWebcam videoRef={this.videoRef}/>
                            </Route>
                            <Route path={"/selectMode"}>
                                <SelectMode />
                            </Route>
                            <Route path={"/shootingMode"}>
                                <RunShootingMode videoRef={this.videoRef}/>
                            </Route>
                            <Route path={"/launch"}>
                                <Launch />
                            </Route>
                            <Route path={"/"}>
                                <Welcome videoReady={this.state.videoReady} cvReady={this.state.cvLoaded}/>
                            </Route>
                        </Switch>
                    </Container>
                </section>

                {this.props.launchProjector &&
                    <ProjectorScreen/>
                }
                <BrowserView>
                    <div style={{position:"absolute", bottom: 5, left: 5, border: "5px solid " + backgroundColor, minWidth: "400px"}}>
                        <div style={{color: "white", backgroundColor: color4, width: "100%"}} className={"clearfix"}>
                            <div className={"float-left"}>
                                Webcam  Feed
                            </div>
                            <div className={"float-right"}>
                                <span style={{textDecoration: "underline", cursor:"pointer"}} onClick={() => {this.toggleVideo()}}>
                                    {this.state.showVideo ? "Hide" : "Show"}
                                </span>
                            </div>
                        </div>
                        <div style={{display: this.state.showVideo ? "block" : "none"}}>
                            <video ref={this.videoRef} />
                        </div>
                    </div>
                </BrowserView>
            </BrowserRouter>
        )
    }

}

const mapStateToProps = state => ({
    launchProjector: state.projector.launch
})

export default connect(mapStateToProps)(App);
