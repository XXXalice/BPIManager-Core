import React from "react";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { scoreData, songData } from "../../../types/data";
import { _prefixFromNum } from "../../../components/songs/filter";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import { FormattedMessage } from "react-intl";
import Paper from "@material-ui/core/Paper";
import bpiCalcuator from "../../../components/bpi";
import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Label} from "recharts";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import StarIcon from '@material-ui/icons/Star';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { withRouter, RouteComponentProps } from "react-router-dom";
import {songsDB} from "../../../components/indexedDB";

interface P{
  isOpen:boolean,
  song:songData|null,
  score:scoreData|null,
  handleOpen:(flag:boolean)=>Promise<void>
}

interface S{
  isError:boolean,
  newScore:number,
  newBPI:number,
  showCharts:boolean,
  chartData:any[],
  currentTab:number,
  anchorEl:null | HTMLElement,
  favorited:boolean,
}

class DetailedSongInformation extends React.Component<P & RouteComponentProps,S> {

  private calc?:bpiCalcuator = undefined;

  constructor(props:P & RouteComponentProps){
    super(props);
    let showCharts = false,data:any[] = [],lastExScore = 0;
    if(props.score && props.song && props.song.notes && props.song.avg && props.song.wr && props.score.exScore){
      showCharts = true;
      this.calc = new bpiCalcuator();
      this.calc.setData(props.song.notes * 2, props.song.avg, props.song.wr);
      const bpiBasis = [0,10,20,30,40,50,60,70,80,90,100];
      const mybest = props.score.exScore;
      for(let i = 0;i < bpiBasis.length; ++i){
        const dataInserter = (exScore:number,label:string):number=>{
          return data.push({
            "name" : label,
            "EX SCORE" : exScore
          });
        }
        const exScoreFromBPI:number = Math.floor(this.calc.calcFromBPI(bpiBasis[i]));
        if(lastExScore < mybest && mybest < exScoreFromBPI){
          dataInserter(mybest,"YOU");
          lastExScore = mybest;
          continue;
        }
        lastExScore = exScoreFromBPI;
        dataInserter(exScoreFromBPI,String(bpiBasis[i]));
      }
      this.state = {
        isError:false,
        newScore: NaN,
        newBPI:NaN,
        showCharts : showCharts,
        chartData:data.reverse(),
        favorited:props.song.isFavorited,
        currentTab:0,
        anchorEl:null,
      }
    }
  }
  handleScoreInput = (e: React.ChangeEvent<HTMLInputElement>):void=>{
    return this.setState({newScore:Number(e.target.value)})
  }

  handleScoreChange = (e:React.FocusEvent<HTMLInputElement>):void=>{
    console.log(e.target.value);
  }

  handleTabChange = (e:React.ChangeEvent<{}>, newValue:number)=> this.setState({currentTab:newValue});

  toggleMenu = (e?: React.MouseEvent<HTMLButtonElement>)=> this.setState({anchorEl: e ? e.currentTarget : null });

  jumpWeb = (type:number):void =>{
    if(!this.props.song){return;}
    switch(type){
      case 0:
        window.open("http://textage.cc/score/" + this.props.song.textage);
      break;
      case 1:
        window.open("https://www.youtube.com/results?search_query=" + this.props.song.title + "+IIDX");
      break;
      case 2:
        window.open("https://twitter.com/intent/tweet?&text=");
      break;
    }
    return this.toggleMenu();
  }

  toggleFavorited = async():Promise<void>=>{
    try{
      const {favorited} = this.state;
      const {song} = this.props;
      const db = new songsDB();
      if(!song){
        throw new Error();
      }
      await db.toggleFavorite(song.title,song.difficulty,!favorited)
    }catch(e){
      console.log(e);
    }
    return;
  }

  render(){
    const {isOpen,handleOpen,song,score} = this.props;
    const {newScore,showCharts,chartData,currentTab,anchorEl,favorited} = this.state;
    if(!song || !score){
      return (null);
    }
    const max = song.notes ? song.notes * 2 : 0;
    const detectStarIconColor = favorited ? "" : "#c3c3c3";
    return (
      <Dialog id="detailedScreen" fullScreen open={isOpen} onClose={handleOpen} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={()=>handleOpen(true)} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis">
              {song.title + _prefixFromNum(song.difficulty)}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <Paper>
          <Grid container spacing={3}>
            <Grid item xs={12} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
              <Typography component="h6" variant="h6" color="textSecondary">
                BPI
              </Typography>
              <Typography component="h3" variant="h3" color="textPrimary">
                {score && score.currentBPI}
              </Typography>
            </Grid>
          </Grid>
          <Divider/>
          <Grid container>
            <Grid item xs={8}>
              <form noValidate autoComplete="off" style={{margin:"10px 6px 0"}}>
                <TextField
                  type="number"
                  style={{width:"100%"}}
                  label={<FormattedMessage id="Details.typeNewScore"/>}
                  value={!Number.isNaN(newScore) ? newScore : score ? score.exScore : 0}
                  onChange={this.handleScoreInput}
                  onBlur={this.handleScoreChange}
                />
              </form>
            </Grid>
            <Grid item xs={1} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
              <div style={{margin:"10px 6px 0"}}>
                <StarIcon style={{fontSize:"35px",color:detectStarIconColor,position:"relative",top:"3px"}} onClick={this.toggleFavorited}/>
              </div>
            </Grid>
            <Grid item xs={1} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
              <IconButton style={{margin:"10px 6px 0"}}
                aria-haspopup="true"
                onClick={this.toggleMenu}>
                  <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={()=>this.toggleMenu()}
                >
                  <MenuItem onClick={()=>this.jumpWeb(0)}>TexTage</MenuItem>
                  <MenuItem onClick={()=>this.jumpWeb(1)}>YouTube</MenuItem>
                  <MenuItem onClick={()=>this.jumpWeb(2)}><FormattedMessage id="Common.Tweet"/></MenuItem>
                </Menu>
            </Grid>
          </Grid>
        </Paper>
        <Tabs
          value={currentTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleTabChange}>
          <Tab label={<FormattedMessage id="Details.Graph"/>} />
          <Tab label={<FormattedMessage id="Details.Details"/>} />
        </Tabs>
        <TabPanel value={currentTab} index={0}>
          {showCharts &&
            <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
              <ResponsiveContainer width="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0,max]} ticks={[Math.ceil(max * (6/9)),Math.ceil(max * (7/9)),Math.ceil(max * (8/9)),max]} width={40}>
                  </YAxis>
                  <Tooltip />
                  <Bar dataKey="EX SCORE">
                    {
                      chartData.map((item) => {
                        const color = item.name === "YOU" ? "#e75d00" : "#8884d8";
                        return <Cell key={item.name} fill={color} />;
                      })
                    }
                  </Bar>
                  <ReferenceLine y={max * (8/9)} label={<Label position="insideTopRight">AAA</Label>} stroke="#004018" isFront={true} />
                  <ReferenceLine y={max * (7/9)} label={<Label position="insideTopRight">AA</Label>} stroke="#004018" isFront />
                  <ReferenceLine y={max * (2/3)} label={<Label position="insideTopRight">A</Label>} stroke="#004018" isFront />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          a
        </TabPanel>
      </Dialog>
    );
  }
}

class TabPanel extends React.Component<{value:number,index:number},{}>{

  render(){
    if(this.props.value !== this.props.index){
      return (null);
    }
    return this.props.children
  }
}

export default withRouter(DetailedSongInformation);
