import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { TextField, Button, Badge } from "@mui/material";
import styles from "../styles/VideoComponent.module.css";
import { IconButton } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import {useNavigate} from "react-router-dom";
import server from "../enviroment";

const server_url = server;
const connections = {};

const peerConfigConnetions = {
  iceServers: [{ url: "stun:stun.l.google.com.19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState(true);
  let [screen, setScreen] = useState(true);
  let [showModel, setModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [askForUsername, setAskForUSername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);

  const videoRef = useRef([]);

  useEffect(() => {
    console.log("HELLO");
    getPermissions();
  }, []);


  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketIdRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          }
        })
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      console.log("SET STATE HAS", video, audio);
    }
  }, [video, audio]);

  let gotMessageFromServer = (fromID, message) => {
    const signal = JSON.parse(message);

    if (fromID !== socketRef.current) {
      if (signal.sdp) {
        connections[fromID]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromID]
                .createAnswer()
                .then((description) => {
                  connections[fromID]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromID,
                        JSON.stringify({
                          sdp: connections[fromID].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromID]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {sender: sender, data: data}
    ])

    if(socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnetions
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            console.log("New stream assed for socket ", socketListId);
            console.log("stream", event.stream);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                palysinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {
              console.log(e);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getDisplayMediaSucess = (stream) => {
      try {
          window.localStream.getTracks().forEach(track => track.stop());
      } catch(e) {
          console.log(e);
      }

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for(let id in connections) {
          if(id === socketRef.current) {
              continue;
          }

          connections[id].addStream(window.localStream)

          connections[id].createOffer().then((description) => {
              console.log(description);
              connections[id].setLocalDescription(description)
                  .then(() => {
                      socketRef.current.emit('signal', id, JSON.stringify({'sdp': connections[id].localDescription}))
                  })
                  .catch(e => console.log(e))
          })
      }

      stream.getTracks().forEach(track => track.onended = () => {
          setScreen(false);
          
          try{
              let tracks = localVideoRef.current.srcObject.getTracks()
              tracks.forEach(track => track.stop())
          } catch (e) {
              console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
      })
  }

  let routeTo = useNavigate();

  let connect = () => {
    setAskForUSername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMedia = () => {
      if(screen) {
          if(navigator.mediaDevices.getDisplayMedia) {
              navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                .then(getDisplayMediaSucess)
                .then((stream) => {})
                .catch((e) => console.log(e))
          }
      }
  }

  useEffect(() => {
    if(screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit('chat-message', message, username);
    setMessage("");
  }

  let handleEndCall = () => {
    try {

      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())

    } catch(e) {
      console.log(e);
    }

    routeTo("/home")
  }


  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into lobby</h2>
          <TextField
            id="outlined-basic"
            label="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted />
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          
          {showModel ? <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
              <h1>chat</h1>

              <div className={styles.chattingDisplay}>

                  { messages.length > 0 ? messages.map((item, index) => {
                    return (
                      <div style={{marginBottom:"20px"}} key={index}>
                          <p style={{fontWeight:"bold"}}>{item.sender}</p>
                          <p>{item.data}</p>
                      </div>
                    )
                  }) : <p>No messages yet</p>}
              </div>

              <div className={styles.chattingArea}> 
                  <TextField value={message} onChange={e => setMessage(e.target.value)} id="outlined-basic" label="Chat" />
                  <Button variant="contained" onClick={sendMessage}>Send</Button>
              </div>
              
            </div>
            
          </div> : <></> }
          

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton onClick={() => setModel(!showModel)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>

          <div  className={styles.conferenceView}>
          {videos.map((video) => (
            <div key={video.socketId}>
              <video
                data-socket={video.socketId}
                ref={(ref) => {
                  if (ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
                playsInline
              ></video>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
