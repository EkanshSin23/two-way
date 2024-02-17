import { useState } from "react";
import './ChatContainer.css'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Stack, Typography } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideocamIcon from '@mui/icons-material/Videocam';


const ChatContainer = ({ showParticipantsDirectly, sendMessage, msgList, mySocketId }) => {


    const [showParticipants, setShowParticipants] = useState(showParticipantsDirectly)
    const [msg, setMsg] = useState('')
    const handleSendMessage = (e) => {

        const { value } = e.target;
        setMsg(value)

    }
    const handleSend = () => {
        if (msg !== '') {
            sendMessage({ name: `Rohan-${msg} `, msg: msg })
            setMsg('')
        }
        else {
            alert('Type Something...')
        }
    }


    return (
        <div className="chat_parent_container">
            <div className="chat_top">

                <div className="chat_section" onClick={() => {
                    setShowParticipants(false)
                }}>
                    <div style={{ background: showParticipants ? '#b042f5' : "white", color: showParticipants ? 'white' : "black" }}>Chat</div>
                </div>
                <div className="participant_section" onClick={() => {
                    setShowParticipants(true)
                }}>
                    <div style={{ background: showParticipants ? 'white' : "#b042f5", color: showParticipants ? 'black' : "white" }}>Participant</div>
                </div>
            </div>
            {showParticipants ? <div className="participants_container" >
                <div className="particpants_container_participants" >


                    <div className="participant_search_box" style={{
                        borderRadius: '10px',
                        width: '270px'



                    }}>

                        <div>  <SearchIcon /></div>
                        <input className="participant_search" type="text" placeholder="Find What You're Looking For..." style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            outline: 'none',
                            width: '100%'

                        }} />

                    </div>


                </div>
                <div className="participant_list" style={{ marginTop: '50px', width: '295px', }}>
                    <div className="particular_participant" style={{ borderRadius: '10px' }}>
                        <div className="particular_participant_left">
                            <Avatar sx={{ borderRadius: '10px', height: 30 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: '400', fontSize: '15px', textAlign: 'start' }}>Rohan</Typography>
                                <Typography sx={{ fontSize: '10px' }}>Developer</Typography>

                            </div>
                        </div>
                        <div className="particular_participant_right">
                            <MicIcon />
                            <VideocamIcon />
                        </div>

                    </div>
                    <div className="particular_participant" style={{ borderRadius: '10px' }}>
                        <div className="particular_participant_left">
                            <Avatar sx={{ borderRadius: '10px', height: 30 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: '400', fontSize: '15px', textAlign: 'start' }}>Rohan</Typography>
                                <Typography sx={{ fontSize: '10px' }}>Developer</Typography>

                            </div>
                        </div>
                        <div className="particular_participant_right">
                            <MicIcon />
                            <VideocamIcon />
                        </div>

                    </div>
                    <div className="particular_participant" style={{ borderRadius: '10px' }}>
                        <div className="particular_participant_left">
                            <Avatar sx={{ borderRadius: '10px', height: 30 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: '400', fontSize: '15px', textAlign: 'start' }}>Rohan</Typography>
                                <Typography sx={{ fontSize: '10px' }}>Developer</Typography>

                            </div>
                        </div>
                        <div className="particular_participant_right">
                            <MicIcon />
                            <VideocamIcon />
                        </div>

                    </div>
                    <div className="particular_participant" style={{ borderRadius: '10px' }}>
                        <div className="particular_participant_left">
                            <Avatar sx={{ borderRadius: '10px', height: 30 }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontWeight: '400', fontSize: '15px', textAlign: 'start' }}>Rohan</Typography>
                                <Typography sx={{ fontSize: '10px' }}>Developer</Typography>

                            </div>
                        </div>
                        <div className="particular_participant_right">
                            <MicIcon />
                            <VideocamIcon />
                        </div>

                    </div>

                </div>
            </div> :
                <div className="chat_container_chats" >
                    <Stack sx={{ overflowY: 'scroll', minHeight: '60vh', maxHeight: '60vh' }}>
                        {msgList?.length > 0 ? msgList?.map((item, index) => {
                            return <Stack>
                                {item?.id == mySocketId ? <Typography key={index} ><span style={{ color: 'green' }}>{item?.id}</span>
                                    :{item?.msg}</Typography> : <Typography>{item?.id}:{item?.msg}</Typography>}
                            </Stack>
                            // <Typography></Typography>
                        }) : 'Enter Something...'}
                    </Stack>
                    < div className="input_box" style={{
                        borderRadius: '10px',
                        position: 'absolute'
                        ,
                        top: '63vh'
                    }}>
                        <input type="text" value={msg} placeholder="Send a message..." onChange={handleSendMessage} onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                handleSend()
                            }
                        }} />
                        <div className="input_box_icons">
                            <div>  <EmojiEmotionsIcon /></div>
                            <div onClick={handleSend}>     <SendIcon /></div>
                        </div>
                    </div>
                </div>

            }


        </div >

    )
}

export default ChatContainer