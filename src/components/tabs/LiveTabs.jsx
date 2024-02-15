import * as React from "react";
import "./LiveTabs.css";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { TbFileDescription } from "react-icons/tb";
import { MdOutlineSnippetFolder } from "react-icons/md";
import { FaRegStar } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { CiSquareQuestion } from "react-icons/ci";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

export default function LiveTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box className='tabs_container' sx={{ width: "100%" }}>
            <Box className='tabs_container_inner' sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                    style={{ display: "flex", justifyContent: "center", alignItems: 'center' }}
                    className="tabs_main"
                    indicatorColor="secondary"
                    textColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        icon={<TbFileDescription className="tab_icon" />}
                        label="Info"
                        {...a11yProps(0)}
                    />
                    <Tab
                        icon={<MdOutlineSnippetFolder className="tab_icon" />}
                        label="Resources"
                        {...a11yProps(1)}
                    />
                    <Tab
                        icon={<CiSquareQuestion className="tab_icon" />}
                        label="Doubts"
                        {...a11yProps(2)}
                    />

                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                Live Info
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                RESOURSES
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                RATING
            </CustomTabPanel>

        </Box>
    );
}
