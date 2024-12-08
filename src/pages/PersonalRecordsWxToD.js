import { makeStyles } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { Fragment, useMemo, useState } from 'react';
import Barra from '../componentes/barras';
import WeightValue from '../componentes/weight-value';
import { Button } from '@material-ui/core';
import { NothingHere } from '../componentes/nothing-here-alert';
import { DistanceValue, SpeedValue } from "../componentes/distance-value";
import { TimeValue } from "../componentes/time-value";
import { ErowWxDoT } from "../componentes/journal/erow-render-WxDoT";


/**
 * @type {Array<{ prop:string, title:string, desc:string, renderValue:(erow:import("../data/generated---db-types-and-hooks").Set, ymd:string)=>React.ReactNode }>}
 */
const aspects = [
    {
        prop:"minDistancePR",
        title:"Shortest Distance",
        desc:"If the goal was to do the shortest distance...",
        renderValue: (erow, ymd)=>(<DistanceValue value={erow.d} unit={erow.dunit} />)
    },
    {
        prop:"maxDistancePR",
        title:"Longest Distance",
        desc:"If the goal was to do the longest distance...",
        renderValue: (erow, ymd)=>(<DistanceValue value={erow.d} unit={erow.dunit} />)
    },
    {
        prop:"maxTimePR",
        title:"Longest Time",
        desc:"If the goal was to endure the longest time...",
        renderValue: (erow, ymd)=>(<TimeValue milliseconds={erow.t}/>)
    },
    {
        prop:"minTimePR",
        title:"Shortest Time",
        desc:"If the goal was to perform in the shortest time...",
        renderValue: (erow, ymd)=>(<TimeValue milliseconds={erow.t}/>)
    },
    {
        prop:"speedPR",
        title:"Fastest speed",
        desc:"If the goal was to reach max speed...",
        renderValue: (erow, ymd)=>(<SpeedValue value={erow.speed} displayUnit={erow.dunit}/>)
    },
    {
        prop:"maxForcePR",
        title:"Max Force",
        desc:"Maximal force generated by moving with weight over a period of time...",
        renderValue: (erow, ymd)=><>{erow.force.toFixed(1)}N</>
    },
    {
        prop:"WxD_PRs",
        title:"Weight for distance",
        desc:"Most weight moved at a particular distance. Here we track as a PR the most weight lifted in a particular distance.",
        renderValue: (erow, ymd)=>{
            return <>
                <WeightValue value={erow.w} inkg={erow.lb==0} /> x <DistanceValue value={erow.d} unit={erow.dunit} /> {erow.t>0 && <>in <TimeValue milliseconds={erow.t}/></>}
            </>
        }
    },
    {
        prop:"WxT_PRs",
        title:"Weight for time",
        desc:"Most weight endured for a particular timespan. Here the focus is a timespan and how much weight you do in it.",
        renderValue: (erow, ymd)=>{
            return <>
                    <WeightValue value={erow.w} inkg={erow.lb==0} /> x <TimeValue milliseconds={erow.t}/>
                    </>
        }
    },
    {
        prop:"DxTPR",
        title:"Best distance for time",
        desc:"If the goal was to reach a particular distance in a particular timespan...",
        renderValue: (erow, ymd)=>{
            return <><DistanceValue value={erow.d} unit={erow.dunit} /> in <TimeValue milliseconds={erow.t}/></>
        }
    }
];

const useStyles = makeStyles( theme => ({ 
    erow: {
        display:"flex",
        alignItems:"center",
        justifyContent:"flex-end",
        "& .wxr": {
            display:"flex",
            "& > *": {
                margin:"0px 5px"
            }
        },
        "& .effint": {
            display:"none"
        },
        "& .bar": {
            margin:"0px"
        }
    }
}) );


/**
 * @typedef { import("../data/generated---db-types-and-hooks").GetPRsOfQuery["getPRsOf"]  } WxrPRs
 */

/** 
 * @param {{ data:WxrPRs, user:import('../data/generated---db-types-and-hooks').User, onClickLog:(ymd:string)=>void }} param0 
 */
export const RecordsWxToD = ({ data, user, onClickLog }) => {
 
    const classes = useStyles();
    const [expanded, setExpanded] = useState([]);

    const toggle = (i)=>{

        const cpy = [...expanded];
        cpy[i] = !cpy[i];

        setExpanded(cpy)
    } 

    /**
     * @type {Array<Array<{ Node:React.ReactNode, ymd:string }>>}
     */
    const records = useMemo(()=>{

        return aspects.map( aspect=>{
 
            const records = [ ...data.wxdotPRS[aspect.prop] ];

            records.reverse(); //<-- because they come in chronological order, from oldest to most recent.

            return records.map( erowIndex=>{

                const erow = data.wxdotPRS.erows[erowIndex];
                const ymd = data.wxdotPRS.ymds[ data.wxdotPRS.erowi2ymdi[erowIndex] ];

                return {
                    Node: aspect.renderValue( erow, ymd ),
                    ymd, 
                    erow //original erow
                };
            }) 

        } ) ;
        
    }, [data]);
 
    if( !records.some(r=>r.length) )
    return <NothingHere title='No Weight x Distance or Time' description="There are no logs doing this exercise for either distance or time." />


    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
              <TableRow> 
                <TableCell  >Record of...</TableCell>
                <TableCell >Current best</TableCell>
                <TableCell align="center">Log</TableCell> 
              </TableRow>
            </TableHead>
            <TableBody>

                {
                    aspects.map( (aspect,i)=>(<Fragment key={aspect.prop}>

                        {
                            records[i].length>0 && <>
                            <TableRow className={ i%2? classes.oddRow : ""}>
                                <TableCell component="th" scope="row"  >
                                    <Typography variant="h4" title={aspect.desc} >{aspect.title}</Typography>
                                </TableCell>
                                <TableCell >
                                    <Typography variant="h4" title={aspect.desc} >{ records[i][0].Node }</Typography>
                                </TableCell>
                                <TableCell  align="center" >
                                    <IconButton onClick={() => toggle(i)}>
                                        {expanded[i] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>

                                        <Button variant='outlined' onClick={()=>onClickLog(records[i][0].ymd)} className='oneline'>{records[i][0].ymd}</Button>
                                    </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                    <Collapse in={expanded[i]} timeout="auto" unmountOnExit>
                                        <Box margin={1}>
                                            <Typography variant="h6">History</Typography>
                                            <Typography gutterBottom>{aspect.desc}</Typography>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>

                                                        <TableCell  align="right">Record</TableCell>
                                                        <TableCell  align="right">Original Set</TableCell>
                                                        <TableCell align="right">Log</TableCell>
                                                         
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                        {
                                                            records[i].map( record=> <TableRow key={record.ymd}>

                                                                <TableCell align="right">{record.Node}</TableCell>
                                                                <TableCell align="right"><OriginalErow set={record.erow} classes={classes}/></TableCell>
                                                                <TableCell component="th" scope="row" align="right">
                                                                    <a href="#" onClick={ev=>ev.preventDefault() || onClickLog(record.ymd) }>{record.ymd}</a>
                                                                </TableCell>
                                                                
                                                            </TableRow>)
                                                        }
                                                </TableBody>
                                                
                                            </Table>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                            </>
                        }
                        

                    </Fragment>) )
                }

            </TableBody>
        </Table>
    </TableContainer>
}



/** 
 * @param {{ set:import("../data/generated---db-types-and-hooks").Set }} param0 
 */
const OriginalErow = ({ set, classes }) => {
    return <ErowWxDoT  speed={set.speed} 
                force={set.force}
                time={set.t} 
                distance={set.d} 
                distanceUnit={set.dunit}
                weight={set} 
                classes={classes}  
                />
};