//Imports
import io from 'socket.io-client'
import mediasoupClient from 'mediasoup-client'
import { Device } from 'mediasoup-client';
import { useParams } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import './Mediasoup.css'
import LiveTabs from '../components/tabs/LiveTabs';
import { useEffect, useState } from 'react';
import ChatContainer from '../components/chat/ChatContainer';
import poster from './poster.jpg'



// const roomName = 'test';

// const socket = io("/mediasoup")
// const socket = io.connect('https://s34b5jj9-3003.inc1.devtunnels.ms/mediasoup', { transports: ['websocket'] });
// const socket = io.connect('https://two-way.sdcampus.com/mediasoup', { transports: ['websocket'] });
const socket = io.connect('http://localhost:3003/mediasoup', { transports: ['websocket'] });

console.log('socket', socket)


function MediaSoup() {
    const roomName = useParams()
    let videoContainer
    let device
    let rtpCapabilities
    let producerTransport
    let consumerTransports = []
    let audioProducer
    let videoProducer
    let screenShare

    let consumer
    let isProducer = false
    // console.log(videoContainer)
    let localVideo
    let streamOfUser;
    // let params = {
    //     // mediasoup params
    //     encodings: [
    //         {
    //             rid: 'r0',
    //             maxBitrate: 100000,
    //             scalabilityMode: 'S1T3',
    //         },
    //         {
    //             rid: 'r1',
    //             maxBitrate: 300000,
    //             scalabilityMode: 'S1T3',
    //         },
    //         {
    //             rid: 'r2',
    //             maxBitrate: 900000,
    //             scalabilityMode: 'S1T3',
    //         },
    //     ],
    //     // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
    //     codecOptions: {
    //         videoGoogleStartBitrate: 1000
    //     }
    // }
    let params = {
        kind: "video",
        rtpParameters:
        {
            mid: "1",
            codecs:
                [
                    {
                        mimeType: "video/VP8",
                        payloadType: 101,
                        clockRate: 90000,
                        rtcpFeedback:
                            [
                                { type: "nack" },
                                { type: "nack", parameter: "pli" },
                                { type: "ccm", parameter: "fir" },
                                { type: "goog-remb" }
                            ]
                    },
                    {
                        mimeType: "video/rtx",
                        payloadType: 102,
                        clockRate: 90000,
                        parameters: { apt: 101 }
                    }
                ],
            headerExtensions:
                [
                    {
                        id: 2,
                        uri: "urn:ietf:params:rtp-hdrext:sdes:mid"
                    },
                    {
                        id: 3,
                        uri: "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id"
                    },
                    {
                        id: 5,
                        uri: "urn:3gpp:video-orientation"
                    },
                    {
                        id: 6,
                        uri: "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time"
                    }
                ],
            encodings:
                [
                    { rid: "r0", active: true, maxBitrate: 100000 },
                    { rid: "r1", active: true, maxBitrate: 300000 },
                    { rid: "r2", active: true, maxBitrate: 900000 }
                ],
            rtcp:
            {
                cname: "Zjhd656aqfoo"
            }
        }
    }
    let audioParams;
    let videoParams = { params };
    let screenShareParams = { params };
    let consumingTransports = [];
    console.log('times')
    socket.on('connection-success', ({ socketId }) => {

        getLocalStream()
    })



    const streamSuccess = (stream) => {
        // console.log('stream success')
        streamOfUser = stream
        localVideo = document.getElementById('localVideo').srcObject = stream
        // console.log(localVideo)
        localVideo.srcObject = stream

        audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
        videoParams = { track: stream.getVideoTracks()[0], ...videoParams };

        joinRoom()
    }

    const joinRoom = () => {

        socket.emit('joinRoom', { ...roomName, name: 'Rohan', isAdmin: true }, (data) => {
            console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`)
            // we assign to local variable and will be used when
            // loading the client Device (see createDevice above)
            rtpCapabilities = data.rtpCapabilities
            console.log(rtpCapabilities)
            // once we have rtpCapabilities from the Router, create Device
            createDevice()
        })
    }

    const createDevice = async () => {
        try {



            device = new Device();

            // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
            // Loads the device with RTP capabilities of the Router (server side)
            await device.load({
                // see getRtpCapabilities() below
                routerRtpCapabilities: rtpCapabilities
            })


            // once the device loads, create transport
            createSendTransport()

        } catch (error) {
            console.log(error)
            if (error.name === 'UnsupportedError')
                console.warn('browser not supported')
        }
    }


    const getLocalStream = () => {
        // console.log('coming here')
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: {
                    min: 640,
                    max: 1920,
                },
                height: {
                    min: 400,
                    max: 1080,
                }
            }
        })
            .then(streamSuccess)
            .catch(error => {
                console.log('stream error   ')
                console.log(error.message)
            })
    }
    // const localVideo = useRef();


    const createSendTransport = () => {

        // see server's socket.on('createWebRtcTransport', sender?, ...)
        // this is a call from Producer, so sender = true
        socket.emit('createWebRtcTransport', { consumer: false }, async ({ params }) => {
            // The server sends back params needed 
            // to create Send Transport on the client side
            if (params.error) {
                console.log(params.error)
                return
            }

            console.log(params)

            // creates a new WebRTC Transport to send media
            // based on the server's producer transport params
            // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions

            producerTransport = device.createSendTransport(params)
            console.log('producer transport', producerTransport)
            // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
            // this event is raised when a first call to transport.produce() is made
            // see connectSendTransport() below
            producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    console.log('Producer before')
                    console.log(params.dtlsParameters)
                    console.log(dtlsParameters)
                    console.log('Producer Transport')
                    console.log(producerTransport)

                    socket.emit('transport-connect', {
                        dtlsParameters
                    })


                    // Tell the transport that parameters were transmitted.
                    callback()

                } catch (error) {
                    errback(error)
                }
            })

            producerTransport.on('produce', async (parameters, callback, errback) => {
                console.log(parameters)

                try {
                    // tell the server to create a Producer
                    // with the following parameters and produce
                    // and expect back a server side producer id
                    // see server's socket.on('transport-produce', ...)
                    await socket.emit('transport-produce', {
                        kind: parameters.kind,
                        rtpParameters: parameters.rtpParameters,
                        appData: parameters.appData,
                    }, ({ id, producersExist }) => {
                        // Tell the transport that parameters were transmitted and provide it with the
                        // server side producer's id.
                        callback({ id })

                        // if producers exist, then join room
                        console.log('pproducer,exist', producersExist)
                        if (producersExist) {
                            setOnlyProducer(false)
                            getProducers()
                        } else {
                            setOnlyProducer(true)
                        }
                    })
                } catch (error) {
                    errback(error)
                }
            })

            connectSendTransport()
        })
    }

    const [videoProducerId, setVideoProducerId] = useState('')
    const [audioProducerId, setAudioProducerId] = useState('')

    const connectSendTransport = async () => {
        // we now call produce() to instruct the producer transport
        // to send media to the Router
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
        // this action will trigger the 'connect' and 'produce' events above

        audioProducer = await producerTransport.produce(audioParams);
        // console.log('Video Params', videoParams)
        videoProducer = await producerTransport.produce(videoParams);
        setVideoProducerId(videoProducer.id)
        setAudioProducerId(audioProducer.id)
        // console.log('Produced VideoPro', videoProducer)
        audioProducer.on('trackended', () => {
            console.log('audio track ended')

            // close audio track
        })

        audioProducer.on('transportclose', () => {
            console.log('audio transport ended')

            // close audio track
        })


        videoProducer.observer.on("pause", () => {
            console.log('front end paused')

        })
        videoProducer.on('trackended', () => {
            console.log('video track ended')

            // close video track
        })

        videoProducer.on('transportclose', () => {
            console.log('video transport ended')

            // close video track
        })
        videoProducer.on('paused', () => {
            console.log('PAUSEDDD')
        })
    }



    const signalNewConsumerTransport = async (remoteProducerId) => {
        //check if we are already consuming the remoteProducerId
        if (consumingTransports.includes(remoteProducerId)) return;
        consumingTransports.push(remoteProducerId);

        await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
            // The server sends back params needed 
            // to create Send Transport on the client side
            // console.log('DEVICE', device.sctpCapabilities)
            if (params.error) {
                console.log(params.error)
                return
            }
            console.log(`PARAMS... ${params}`)

            let consumerTransport
            if (device) {
                try {
                    consumerTransport = device.createRecvTransport(params)
                } catch (error) {
                    // exceptions: 
                    // {InvalidStateError} if not loaded
                    // {TypeError} if wrong arguments.
                    console.log(error)
                    return
                }

                consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                    try {
                        // Signal local DTLS parameters to the server side transport
                        // see server's socket.on('transport-recv-connect', ...)
                        await socket.emit('transport-recv-connect', {
                            dtlsParameters,
                            serverConsumerTransportId: params.id,
                        })
                        setOnlyProducer(false)
                        // Tell the transport that parameters were transmitted.
                        callback()
                    } catch (error) {
                        setOnlyProducer(true)
                        // Tell the transport that something was wrong
                        errback(error)
                    }
                })

                connectRecvTransport(consumerTransport, remoteProducerId, params.id)
            } else {
                console.log('device not ready')
            }
        }

        )
    }


    // server informs the client of a new producer just joined
    socket.on('new-producer', ({ producerId }) => {
        // console.log('Not COMING')
        signalNewConsumerTransport(producerId)
    })

    const getProducers = () => {
        socket.emit('getProducers', { data: '' }, producerIds => {
            console.log('producerIds', producerIds)
            // for each of the producer create a consumer
            // producerIds.forEach(id => signalNewConsumerTransport(id))
            producerIds.forEach(signalNewConsumerTransport)
        })
    }

    const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
        // for consumer, we need to tell the server first
        // to create a consumer based on the rtpCapabilities and consume
        // if the router can consume, it will send back a set of params as below
        console.log('Remote Producer Id', remoteProducerId)
        // const data = { producerId: remoteProducerId }
        // console.log('line327', data)
        await socket.emit('consume', {
            rtpCapabilities: device.rtpCapabilities,
            remoteProducerId,
            // remoteProducerId: {
            //     ...data
            // },
            serverConsumerTransportId,
        }, async ({ params }) => {
            if (params.error) {
                console.log('Cannot Consume')
                return
            }

            console.log('consumer params', params)
            // then consume with the local consumer transport
            // which creates a consumer
            const consumer = await consumerTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters
            })
            consumer.on('producerpause', () => {
                console.log('front end paused')
            })
            consumer.observer.on("pause", () => {
                console.log('front end paused')

            })

            consumerTransports = [
                ...consumerTransports,
                {
                    consumerTransport,
                    serverConsumerTransportId: params.id,
                    producerId: remoteProducerId,
                    consumer,
                },
            ]


            console.log('remodte producer id', remoteProducerId)
            // create a new div element for the new consumer media
            videoContainer = document.getElementById('videoContainer')
            const newElem = document.createElement('div')
            newElem.style.position = 'relative'
            const host = document.createElement('h5')

            newElem.setAttribute('id', `td-${remoteProducerId}`)

            if (params.kind == 'audio') {
                //append to the audio container
                newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
            } else {
                //append to the video container
                newElem.setAttribute('class', 'remoteVideo')
                if (params.isAdmin) {
                    newElem.innerHTML = '<video id = "' + remoteProducerId + '" autoplay class="video" ></video>'
                    host.innerText = 'Host'
                    host.style.position = 'absolute'
                    host.style.color = '#ffffff8f'
                    host.style.top = '0px'
                    host.style.right = '30px'
                    host.style.background = '#80808073'
                    host.style.padding = '2px 5px'
                    host.style.borderRadius = '5px'

                    newElem.appendChild(host)
                }
                else {
                    newElem.innerHTML = '<video id = "' + remoteProducerId + '" autoplay class="video" ></video>'
                }
            }

            videoContainer.appendChild(newElem)
            // videoContainer.appendChild(host)


            // destructure and retrieve the video track from the producer
            console.log('Producer consuner', consumer)
            const { track } = consumer

            console.log('producer Track', track)
            document.getElementById(remoteProducerId).srcObject = new MediaStream([track])

            // the server consumer started with media paused
            // so we need to inform the server to resume
            socket.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
        })
    }

    socket.on('producer-closed', ({ remoteProducerId }) => {
        // server notification is received when a producer is closed
        // we need to close the client-side consumer and associated transport
        console.log('consumer Transports', consumerTransports)
        console.log('consumer Transports remoteProducerId', remoteProducerId)
        if (consumerTransports.length !== 0) {
            const producerToClose = consumerTransports.find(transportData => transportData.producerId === remoteProducerId)
            producerToClose.consumerTransport.close()
            producerToClose.consumer.close()
            setOnlyProducer(false)

            // remove the consumer transport from the list
            consumerTransports = consumerTransports.filter(transportData => transportData.producerId !== remoteProducerId)

            // remove the video div element
            videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`))
        } else {
            setOnlyProducer(true)
            console.log('no consmers to close')
        }
    })




    //UI 
    const [showChat, setShowChat] = useState(false)
    const [showParticipants, setShowParticipants] = useState(false)
    const [msgList, setMsgList] = useState([])
    const [participantsListOfUser, setParticipantsListOfUser] = useState([])
    const [onlyProducer, setOnlyProducer] = useState(true)



    useEffect(() => {
        socket.emit('chat-room', ('room'))
        socket.on('recieve-message', (data) => {
            setMsgList((prev) => [...prev, data])
        })
        socket.on('users-status', (data) => {
            console.log('User Status', data)
            changeUserStatus(data)
        })
        // socket.on('test', () => { console.log('Tessssting') })
    }, [])
    socket.on('participants', (data) => {


        console.log('line484', data)


        setParticipantsListOfUser(data)



    })


    const changeUserStatus = (data) => {
        const videoContainer = document.getElementById('videoContainer')
        console.log('data in user status', data)


        if (!data.videoStatus && (data.videoProducerId !== videoProducerId)) {
            const helper = document.getElementById(`td-${data.videoProducerId}`)
            console.log('helper', helper)
            if (helper) {
                helper.style.display = 'none'

                const newElem = document.createElement('div')
                // newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
                newElem.setAttribute('id', `td-${data.videoProducerId}-td`)
                newElem.style.width = '500px'
                newElem.style.height = '60vh'
                newElem.style.display = 'flex'
                newElem.style.background = 'black'
                newElem.style.justifyContent = 'center'
                newElem.style.alignItems = 'center'
                newElem.style.color = 'white'

                newElem.style.borderRadius = '10px'
                newElem.innerText = 'User'

                videoContainer.appendChild(newElem)
            } else { }
        }
        if (data.videoStatus && (data.videoProducerId !== videoProducerId)) {
            const helper = document.getElementById(`td-${data.videoProducerId}-td`)
            console.log('helper', helper)
            if (helper) {
                helper.style.display = 'none'
                document.getElementById(`td-${data.videoProducerId}`).style.display = ''

            } else { }
        }
    }
    let mySocketId = socket.id
    const sendMessage = (info) => {
        socket.emit('send-message', { ...info, id: socket.id })
    }

    function stopAudio() {
        socket.emit('producer-paused', ({ audioProducerId: audioProducerId, audioStatus: false }))
        const audioTrack = document.getElementById('localVideo').srcObject.getTracks().find(track => track.kind === 'audio');
        audioTrack.enabled = false;
    }
    function playAudio() {
        socket.emit('producer-paused', ({ audioProducerId: audioProducerId, audioStatus: true }))
        const audioTrack = document.getElementById('localVideo').srcObject.getTracks().find(track => track.kind === 'audio');
        audioTrack.enabled = true;
    }

    function hideCam() {
        console.log('videoProducer id', videoProducerId)
        const videoTrack = document.getElementById('localVideo').srcObject.getTracks().find(track => track.kind === 'video');
        videoTrack.enabled = false;

        socket.emit('producer-paused', ({ videoProducerId: videoProducerId, videoStatus: false }))
        document.getElementById('localVideo').style.display = 'none'
        const localVideoContainer = document.getElementById('localVideoContainer')
        const newElem = document.createElement('div')
        // newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
        newElem.setAttribute('id', 'localVideoThumbnail')
        newElem.style.width = '500px'
        newElem.style.height = '60vh'
        newElem.style.display = 'flex'
        newElem.style.background = 'black'
        newElem.style.justifyContent = 'center'
        newElem.style.alignItems = 'center'
        newElem.style.color = 'white'
        newElem.style.borderRadius = '10px'
        newElem.innerText = 'User'

        localVideoContainer.appendChild(newElem)
        // socket.emit('producer-pause')
        // producerTransport.paus
        // socket.emit('transport-pause')
    }

    function showCam() {
        const videoTrack = document.getElementById('localVideo').srcObject.getTracks().find(track => track.kind === 'video');
        videoTrack.enabled = true;

        socket.emit('producer-paused', ({ videoProducerId: videoProducerId, videoStatus: true }))
        const localVideoContainer = document.getElementById('localVideoContainer')
        localVideoContainer
            .removeChild(document.getElementById('localVideoThumbnail'))

        document.getElementById('localVideo').style.display = ''
        // videoProducer.resume()
        console.log('VIDEO PRODUCER RESUME', videoProducer)
        socket.emit('producer-resume')
    }
    const [isScreenShared, setIsScreenShared] = useState(false)

    const connectSendScreenTransport = async () => {

        console.log('Screen share producer', producerTransport)
        screenShare = await producerTransport.produce(screenShareParams);


        screenShare.on('trackended', () => {
            console.log('screenShare track ended')

            // close screenShare track
        })

        screenShare.on('transportclose', () => {
            console.log('screenShare transport ended')

            // close video track
        })
    }


    async function startCapture(displayMediaOptions) {
        // hideCam()
        // const videoTrack = document.getElementById('localVideo').getTracks().find(track => track.kind === 'video');
        // videoTrack.enabled = false;
        let captureStream = null;

        try {
            captureStream =
                await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        } catch (err) {
            console.error(`Error: ${err}`);
        }

        if (captureStream) {
            setIsScreenShared(true)
            document.getElementById('screenSharing').srcObject = captureStream;
            screenShareParams = { track: captureStream.getVideoTracks()[0], ...screenShareParams };
            connectSendScreenTransport()
        }
        else {
            setIsScreenShared(false)
            console.log("Not Shared")
        }

    }

    function stopCapture(evt) {
        // console.log('helllo stopping')
        if (isScreenShared) {
            let tracks = document.getElementById('screenSharing').srcObject.getTracks();

            tracks.forEach((track) => track.stop());
            setIsScreenShared(false)
        }
        // document.getElementById('screenSharing').srcObject = streamOfUser;
        // streamOfUser.srcObject = null;
        // getLocalStream()
    }
    useEffect(() => {
        socket.on('permission', (data) => {
            console.log('Data', data)
        })
    })
    return (<div className="two_way_container" style={{
        display: showChat ? 'flex' : ''
    }}>
        <div className='video_ui_container'>
            {/* <div className="users_feed"> */}

            <div id="videoContainer">
                <video id='screenSharing' autoPlay muted style={{ width: '950px', display: isScreenShared ? "" : 'none', marginLeft: '0px', height: '500px', background: 'red' }} ></video>

                <div id="localVideoContainer" style={{ width: onlyProducer ? '100%' : '' }}>   <video id="localVideo" autoPlay className="video" muted style={{ minWidth: isScreenShared ? '200px' : "90%", maxWidth: isScreenShared ? '200px' : "90%", height: isScreenShared && '200px', position: isScreenShared ? 'absolute' : '', right: '50px', bottom: '25%' }}></video>
                </div>

            </div>

            {/* </div> */}
            <LiveTabs />
            {/* <h5>Other participants</h5> */}
            {/* <button onClick={createDevice}>Create Device</button> */}
        </div>
        <Footer
            setShowChat={setShowChat}
            showChat={showChat}
            setShowParticipants={setShowParticipants}
            showParticipants={showParticipants}
            stopCamera={hideCam}
            playCamera={showCam}
            stopAudio={stopAudio}
            playAudio={playAudio}
            startCapture={startCapture}
            stopCapture={stopCapture}
            isScreenShared={isScreenShared}

        // streamOfUser={streamOfUser}
        />
        {
            showChat && <div className='chat_container' >
                <ChatContainer
                    showParticipantsDirectly={showParticipants}
                    sendMessage={sendMessage}
                    msgList={msgList}
                    mySocketId={mySocketId}
                    participantsList={participantsListOfUser}
                    socket={socket}
                />
            </div>
        }
    </div >
    );
}

export default MediaSoup;
