import * as React from 'react';
import Container from '@material-ui/core/Container';
import fbActions from '@/components/firebase/actions';
import Loader from '@/view/components/common/loader';
import { scoresDB } from '@/components/indexedDB';
import { scoreDataWithNotes, scoreData } from '@/types/data';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Avatar from '@material-ui/core/Avatar';
import { _prefix } from '@/components/songs/filter';
import Pagination from '@material-ui/lab/Pagination';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import { avatarBgColor, avatarFontColor, commonFunc } from '@/components/common';
import ModalNotes from './modal';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { FormattedMessage } from 'react-intl';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import { timeCompare } from '@/components/common/timeFormatter';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

interface S{
  isLoading:boolean,
  isModalOpen:boolean,
  allScores:scoreDataWithNotes[],
  show:scoreDataWithNotes[],
  data:any,
  filterByName:string,
  sort:number,
  page:number,
  hide:boolean,
}
const modes = [
  "BPIが高い順",
  "最近更新した順",
]

class WriteNotes extends React.Component<{},S> {
  private fbA:fbActions = new fbActions();

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      isModalOpen:false,
      allScores:[],
      show:[],
      filterByName:"",
      data:null,
      sort:0,
      page:1,
      hide:!!localStorage.getItem("hide20201004")
    }
  }

  async componentDidMount(){
    this.changeSort();
  }

  async changeSort(){
    this.setState({isLoading:true});
    const scores = await new scoresDB().getAll();
    let withNotes:scoreDataWithNotes[] = [];
    let obj:{[key:string]:any} = {};
    let wroteNotes = await this.fbA.loadMyNotes() || null;
    if(wroteNotes){
      const n = wroteNotes.docs;
      obj = n.reduce((groups:{[key:string]:boolean},item:any)=>{
        const t = item.data();
        groups[t.songName + t.songDiff] = true;
        return groups;
      },{});
    }
    scores.map((item:scoreData)=>{
      withNotes.push(Object.assign(item,{wrote:!!obj[item.title + item.difficulty]}));
      return 0;
    });
    this.setState({
      allScores:withNotes,
      show:withNotes,
      isLoading:false,
    })
  }

  songFilter = (state:S)=>{
    const {allScores} = this.state;

    return allScores.filter((data)=>{
      return data.title.toLowerCase().indexOf(state["filterByName"].toLowerCase()) > -1
    });
  }


  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag,data:null})

  onClick = (data:any)=>{
    this.setState({
      isModalOpen:true,
      data:{
        songName:data.title,
        songDiff:data.difficulty,
        isSingle:data.isSingle === 1
      }
    })
  }

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|null):void=>{
    let newState = this.clone();
    newState.filterByName = e ? e.target.value : "";
    console.log(this.songFilter(newState));
    return this.setState({show:this.songFilter(newState),filterByName:newState.filterByName,page:1});
  }

  handleSortChange = (e:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void=>{
    const val = e.target.value;
    let newState = this.clone();
    if (typeof val !== "number") { return; }
    newState.sort = val;
    return this.setState({show:this.songFilter(newState),sort:val,page:1});
  }


  clone = ()=>{
    return new commonFunc().set(this.state).clone();
  }

  sort = (a:scoreDataWithNotes,b:scoreDataWithNotes):number=>{
    const {sort} = this.state;
    if(sort === 0) return b.currentBPI - a.currentBPI;
    if(sort === 1) return timeCompare(b.updatedAt,a.updatedAt);
    return -1;
  }

  changePage = (_e:Object,p:number)=> this.setState({page:p});

  render(){
    const {isLoading,page,show,isModalOpen,data,filterByName,sort,hide} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container fixed>
        {!hide && !localStorage.getItem("hide20201004") && (
        <Alert variant="outlined" severity="info" style={{margin:"15px 0"}}>
          <AlertTitle>この画面について</AlertTitle>
          <p>一度でもノートを投稿したことがある楽曲にはチェックマークが、投稿したことがない楽曲にはプラスマークが表示されます。<br/>
          楽曲名をタップして、ノート一覧を見たり、新しくノートを投稿することができます。
          </p>
          <ButtonGroup color="secondary" style={{margin:"8px 0"}} variant="outlined">
            <Button startIcon={<VisibilityOffIcon />} onClick={()=>{
              localStorage.setItem("hide20200829","true");
              this.setState({hide:true});
            }}>再度表示しない</Button>
          </ButtonGroup>
        </Alert>
        )}
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel>並び替えを変更</InputLabel>
              <Select value={sort} onChange={this.handleSortChange}>
                {[0,1].map(item=>(
                  <MenuItem key={item} value={item}>{modes[item]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl component="fieldset" style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Songs.filterByName"/></InputLabel>
              <Input
                style={{width:"100%"}}
                placeholder={"(ex.)255"}
                value={filterByName}
                onChange={this.handleInputChange}
                endAdornment={
                  filterByName &&
                  <InputAdornment position="end">
                    <IconButton onClick={()=>this.handleInputChange(null)}>
                      <BackspaceIcon/>
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
        </Grid>
        <Pagination count={Math.ceil(show.length / 10)} page={page} color="secondary" onChange={this.changePage} />
        <List>
          {show.sort((a,b)=>this.sort(a,b)).slice((page - 1) * 10, page * 10 ).map((item:scoreDataWithNotes)=>{
            return (
              <ListItem button onClick={()=>this.onClick(item)}>
                <ListItemAvatar>
                  <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                    {!item.wrote && <AddIcon/>}
                    {item.wrote && <DoneIcon/>}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.title + _prefix(item.difficulty)} secondary={`☆${item.difficultyLevel} 現在BPI:${item.currentBPI} EX:${item.exScore}`} />
              </ListItem>)
          })}
      </List>
      <Pagination count={Math.ceil(show.length / 10)} page={page} color="secondary" onChange={this.changePage} />
      {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </Container>
    );
  }
}

export default WriteNotes;
