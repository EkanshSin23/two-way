//Imports
import io from 'socket.io-client'
import mediasoupClient from 'mediasoup-client'
import { Device } from 'mediasoup-client';
import { useParams } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import './Mediasoup.css'
import LiveTabs from '../components/tabs/LiveTabs';
import { useState } from 'react';
import ChatContainer from '../components/chat/ChatContainer';



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
    let consumer
    let isProducer = false
    // console.log(videoContainer)
    let localVideo
    let streamOfUser;
    let params = {
        // mediasoup params
        encodings: [
            {
                rid: 'r0',
                maxBitrate: 100000,
                scalabilityMode: 'S1T3',
            },
            {
                rid: 'r1',
                maxBitrate: 300000,
                scalabilityMode: 'S1T3',
            },
            {
                rid: 'r2',
                maxBitrate: 900000,
                scalabilityMode: 'S1T3',
            },
        ],
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
        codecOptions: {
            videoGoogleStartBitrate: 1000
        }
    }

    let audioParams;
    let videoParams = { params };
    let consumingTransports = [];
    console.log('times')
    socket.on('connection-success', ({ socketId }) => {
        console.log('times in socket')
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

        socket.emit('joinRoom', { roomName }, (data) => {
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

            console.log('Device RTP Capabilities', device.rtpCapabilities)
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
                        if (producersExist) getProducers()
                    })
                } catch (error) {
                    errback(error)
                }
            })

            connectSendTransport()
        })
    }


    const connectSendTransport = async () => {
        // we now call produce() to instruct the producer transport
        // to send media to the Router
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
        // this action will trigger the 'connect' and 'produce' events above

        audioProducer = await producerTransport.produce(audioParams);
        videoProducer = await producerTransport.produce(videoParams);

        audioProducer.on('trackended', () => {
            console.log('audio track ended')

            // close audio track
        })

        audioProducer.on('transportclose', () => {
            console.log('audio transport ended')

            // close audio track
        })

        videoProducer.on('trackended', () => {
            console.log('video track ended')

            // close video track
        })

        videoProducer.on('transportclose', () => {
            console.log('video transport ended')

            // close video track
        })
    }


    const signalNewConsumerTransport = async (remoteProducerId) => {
        //check if we are already consuming the remoteProducerId
        if (consumingTransports.includes(remoteProducerId)) return;
        consumingTransports.push(remoteProducerId);

        await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
            // The server sends back params needed 
            // to create Send Transport on the client side
            if (params.error) {
                console.log(params.error)
                return
            }
            console.log(`PARAMS... ${params}`)

            let consumerTransport
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

                    // Tell the transport that parameters were transmitted.
                    callback()
                } catch (error) {
                    // Tell the transport that something was wrong
                    errback(error)
                }
            })

            connectRecvTransport(consumerTransport, remoteProducerId, params.id)
        })
    }


    // server informs the client of a new producer just joined
    socket.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId))

    const getProducers = () => {
        socket.emit('getProducers', producerIds => {
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
        await socket.emit('consume', {
            rtpCapabilities: device.rtpCapabilities,
            remoteProducerId,
            serverConsumerTransportId,
        }, async ({ params }) => {
            if (params.error) {
                console.log('Cannot Consume')
                return
            }

            console.log(`Consumer Params ${params}`)
            // then consume with the local consumer transport
            // which creates a consumer
            const consumer = await consumerTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters
            })

            console.log('consumer transport. consume', consumerTransport.consume)
            consumerTransports = [
                ...consumerTransports,
                {
                    consumerTransport,
                    serverConsumerTransportId: params.id,
                    producerId: remoteProducerId,
                    consumer,
                },
            ]
            console.log('Consumer Transportss', consumerTransports)
            console.log('Consumer Transports type', typeof (consumerTransports[0]?.consumer))


            // create a new div element for the new consumer media
            videoContainer = document.getElementById('videoContainer')
            const newElem = document.createElement('div')
            newElem.setAttribute('id', `td-${remoteProducerId}`)

            if (params.kind == 'audio') {
                //append to the audio container
                newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
            } else {
                //append to the video container
                newElem.setAttribute('class', 'remoteVideo')
                newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video" ></video>'
            }

            videoContainer.appendChild(newElem)

            // destructure and retrieve the video track from the producer
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
        const producerToClose = consumerTransports.find(transportData => transportData.producerId === remoteProducerId)
        producerToClose.consumerTransport.close()
        producerToClose.consumer.close()

        // remove the consumer transport from the list
        consumerTransports = consumerTransports.filter(transportData => transportData.producerId !== remoteProducerId)

        // remove the video div element
        videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`))
    })


    //UI 
    const [showChat, setShowChat] = useState(false)
    const [showParticipants, setShowParticipants] = useState(false)



    function stopAudio() {
        const audioTrack = streamOfUser.getTracks().find(track => track.kind === 'audio');
        audioTrack.enabled = false;
    }
    function playAudio() {
        const audioTrack = streamOfUser.getTracks().find(track => track.kind === 'audio');
        audioTrack.enabled = true;
    }

    function hideCam() {
        const videoTrack = streamOfUser.getTracks().find(track => track.kind === 'video');
        videoTrack.enabled = false;
    }

    function showCam() {
        const videoTrack = streamOfUser.getTracks().find(track => track.kind === 'video');
        videoTrack.enabled = true;
    }



    async function startCapture(displayMediaOptions) {
        let captureStream = null;

        try {
            captureStream =
                await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        } catch (err) {
            console.error(`Error: ${err}`);
        }
        document.getElementById('localVideo').srcObject = captureStream;
    }

    function stopCapture(evt) {
        let tracks = streamOfUser.srcObject.getTracks();

        tracks.forEach((track) => track.stop());
        // streamOfUser.srcObject = null;
        getLocalStream()
    }
    return (<div className="two_way_container" style={{
        display: showChat ? 'flex' : ''
    }}>
        <div className='video_ui_container'>

            <video id="localVideo" autoPlay className="video" muted minWidth='600px' controls style={{ width: " 90% !important" }}></video>
            <LiveTabs />
            {/* <h5>Other participants</h5> */}
            <div id="videoContainer"></div>

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
        // streamOfUser={streamOfUser}
        />
        {showChat && <div className='chat_container' >
            <ChatContainer showParticipantsDirectly={showParticipants} />
        </div>}
    </div>
    );
}

export default MediaSoup;
