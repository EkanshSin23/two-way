//Imports

import './FilterSection.css';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';
import { Divider } from '@mui/material';

//Imports



const batchExampleArray = [
    {
        id: '1',
        batchName: 'Sainik', lecture: [
            { lectureId: '12', lectureName: 'Room1' },
            { lectureId: '12', lectureName: 'Room2' },
            { lectureId: '12', lectureName: 'Room3' }
        ],
        rooms: [
            { roomName: 'Room1' },
            { roomName: 'Room2' },
            { roomName: 'Room3' },
        ]
    },
    {
        id: '2',
        batchName: 'Police', lecture: [
            { lectureId: '12', lectureName: 'Room4' },
            { lectureId: '12', lectureName: 'Room5' },
            { lectureId: '12', lectureName: 'Room6' }
        ],
        rooms: [
            { roomName: 'Room1' },
            { roomName: 'Room2' },
            { roomName: 'Room3' },
        ]
    }
    ,
    {
        id: '3',
        batchName: 'Teaching',
        lecture: [

        ],
        // rooms: [
        //     { roomName: 'Room1' },
        //     { roomName: 'Room2' },
        //     { roomName: 'Room3' },
        // ]
    },
]

const FilterSection = ({ setSelectedFilter, setFilterOpen }) => {
    const [open, setOpen] = useState(false)
    const [openLecture, setOpenLecture] = useState(false)
    const [openRooms, setOpenRooms] = useState(false)
    const [selectedBatch, setSelectedBatch] = useState(-1)
    const [selectedLecture, setSelectedLecture] = useState(-1)
    return (
        <div className='filter-section-container' style={{ position: 'absolute' }}>

            <ul className='filter-batch-list'>

                <li style={{ color: "black" }}>Select Batch</li>

                <li className='filter-all-option'>
                    <span onClick={() => {
                        setSelectedFilter({ batch: 'All', lecture: '' })
                        setFilterOpen(false)
                    }
                    }>All</span>
                    {/* <span onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}> {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</span> */}
                </li>

                {batchExampleArray?.map((item, index) => {

                    return <li className='filter-batch-option' key={index} onClick={() => { }}>
                        <span onClick={() => setSelectedFilter((prev) => ({ batch: item?.batchName, lecture: '' }))}>{item?.batchName}</span>
                        {item?.lecture.length > 0 && <span onClick={() => {
                            setSelectedBatch(item?.id)
                            setOpen(!open)
                            setOpenLecture(!openLecture)
                        }} style={{ cursor: 'pointer' }}> {(open && item?.id == selectedBatch) ? <ArrowDropUpIcon onClick={() => setSelectedFilter((prev) => ({ batch: item?.batchName, lecture: '' }))} /> : <ArrowDropDownIcon onClick={() => setSelectedFilter((prev) => ({ batch: item?.batchName, lecture: '' }))} />}</span>
                        }
                        <div key={index} className="filter-lecture-list-container" style={{ display: (openLecture && item?.id == selectedBatch) ? '' : 'none' }}>

                            <li style={{ color: "black" }}>Select Room</li>

                            <li className='filter-all-option'>
                                <span onClick={() => setSelectedFilter((prev) => ({ ...prev, lecture: 'All' }))}>All</span>
                                {/* <span onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}> {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</span> */}
                            </li>
                            {
                                item?.lecture?.map((lectureItem, index) => {

                                    return <ul className='filter-lecture-list'>

                                        <li className='filter-batch-option' key={index} onClick={() => setSelectedFilter((prev) => ({ ...prev, lecture: lectureItem?.lectureName }))}>
                                            {lectureItem?.lectureName}
                                            {/* {item?.rooms?.length > 0 && <span onClick={() => {
                                            setSelectedBatch(item?.id)
                                            setOpen(!open)
                                            setSelectedLecture(lectureItem?.lectureId)
                                            // setOpenRooms(!openRooms)
                                        }} style={{ cursor: 'pointer' }}> {(!open && lectureItem?.lectureId == selectedLecture) ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}</span>} */}

                                        </li>

                                    </ul>

                                })}
                        </div>



                    </li >
                })}

            </ul >
        </div >

    )
}

export default FilterSection