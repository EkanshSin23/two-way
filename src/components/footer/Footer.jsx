import './Footer.css'
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideocamIcon from '@mui/icons-material/Videocam';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MenuIcon from '@mui/icons-material/Menu';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { useState } from 'react';


const Footer = ({ showChat, setShowChat, setShowParticipants, showParticipants, stopCamera, playCamera, stopAudio, playAudio, startCapture }) => {


    const handleChatParticipants = () => {
        setShowChat(!showChat)
        setShowParticipants(true)
    }

    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const displayMediaOptions = {
        video: {
            displaySurface: "browser",
        },
        audio: {
            suppressLocalAudioPlayback: false,
        },
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        systemAudio: "include",
        surfaceSwitching: "include",
        monitorTypeSurfaces: "include",
    };
    return (
        <>
            <div className="footer_container">
                <div className="footer_left">
                    <div className="footer_mic" style={{
                        borderColor: 'gray'
                    }}>
                        {isMicOn ? <div style={{ borderRight: '1px solid black', padding: '10px 10px' }} onClick={() => {
                            stopAudio()
                            setIsMicOn(false)
                        }}><MicIcon sx={{ color: 'gray' }} /></div> :
                            <div style={{ borderRight: '1px solid black', padding: '10px 10px' }} onClick={() => {
                                playAudio()
                                setIsMicOn(true)
                            }}>  <MicOffIcon /></div>}
                        <div style={{ padding: '10px 10px' }}><MoreVertIcon sx={{ color: 'gray' }} /></div>

                    </div>
                    <div className="footer_video" style={{
                        borderColor: 'gray'
                    }}>
                        {isCameraOn ? <div style={{ borderRight: '1px solid black', padding: '10px 10px' }} onClick={() => {
                            stopCamera()
                            setIsCameraOn(false)
                        }}><VideocamIcon sx={{ color: 'gray' }} /></div> :
                            <div style={{ borderRight: '1px solid black', padding: '10px 10px' }} onClick={() => {
                                playCamera()
                                setIsCameraOn(true)
                            }}>  <VideocamOffIcon /></div>}
                        <div style={{ padding: '10px 10px' }}><MoreVertIcon sx={{ color: 'gray' }} /></div>

                    </div>

                </div >
                <div className="footer_middle">
                    <div className="footer_screenshare" style={{ borderColor: 'gray' }}>
                        <div style={{ borderRight: '1px solid black', padding: '10px 10px' }} onClick={() => startCapture(displayMediaOptions)}><PresentToAllIcon sx={{ color: 'gray' }} /></div>
                        <div style={{ padding: '10px 10px' }}><MoreVertIcon sx={{ color: 'gray' }} /></div>

                    </div>
                    <div className="footer_emoji" style={{ borderColor: 'gray' }}>

                        <div style={{ padding: '10px 10px' }}><EmojiEmotionsIcon sx={{ color: 'gray' }} /></div>

                    </div >
                    <div className="footer_exit" style={{
                        borderColor: 'gray'
                    }}>

                        <div style={{ padding: '10px 10px' }}><ExitToAppIcon sx={{ background: 'red', color: 'white' }} /></div>

                    </div>

                </ div>
                <div className="footer_right">

                    <div className="footer_graph" style={{
                        borderColor: 'gray'
                    }}>

                        <div style={{ padding: '10px 10px' }}><BarChartIcon sx={{ color: 'gray' }} /></div>

                    </div> <div className="footer_chat" style={{ borderColor: showChat ? '#b042f5' : 'gray' }}>

                        <div style={{ padding: '10px 10px' }} onClick={() => {
                            setShowChat(!showChat)
                            setShowParticipants(false)
                        }}><ChatBubbleOutlineIcon sx={{ color: showChat ? '#b042f5' : 'gray' }} /></div>

                    </div> <div className="footer_participants" style={{ borderColor: showParticipants ? '#b042f5' : 'gray' }}>

                        <div style={{ padding: '10px 10px' }}><PeopleAltIcon sx={{ color: showParticipants ? '#b042f5' : 'gray' }} onClick={() => {
                            handleChatParticipants()
                        }} /></div>

                    </div> <div className="footer_more" style={{
                        borderColor: 'gray'
                    }}>

                        <div style={{ padding: '10px 10px' }}><MenuIcon sx={{ color: 'gray' }} /></div>

                    </div>
                </div >
            </div >
        </>
    )
}

export default Footer