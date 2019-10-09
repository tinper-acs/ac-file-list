import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Upload from 'bee-upload';
import ProgressBar from 'bee-progress-bar';
import Icon from 'bee-icon'
import AcGrid from 'ac-grids'
import Btns from 'ac-btns';
import cloneDeep from 'clone-deep';
import request from 'axios';
import { getSize, getFileNames,dateFormate,getCookie } from './utils.js'



const propTypes = {
    id:PropTypes.string.isRequired,
    clsfix:PropTypes.string,
    disabled:PropTypes.bool,
    getListNow:PropTypes.bool,//是否在willmonument时获得文件列表
    url:PropTypes.object,//地址
};

const defaultProps = {
    id:'',
    clsfix:'ac-upload-list',
    disabled:false,
    getListNow:true,
    url:{// {id} 替换为 props.id
        "list":  `https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/{id}/files`,//文件列表
        "upload": `https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/{id}/`,//上传
        "delete": `https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/{id}`,//下载 cooperation/rest/v1/file/5d639caaa957bd001936cec9  此处id为附件id
        "info":`https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/{id}/info/ `,//文件信息
    }
};

class FileList extends Component {
    constructor(props){
        super(props);
        this.state = {
            data:[],
            selectedList:[],
            show:false,
            pageNo:1,
            pageSize:999999,
            hoverData:{},
            id:props.id,
            open:true
        }
        this.columns = [{
            title: "附件名称",
            dataIndex: "fileName",
            key: "fileName",
            className: "rowClassName",
            width:300,
            render :(text,record)=>{
                return getFileNames(text,record.fileExtension);
            }
        },
        {
            title: "文件类型",
            dataIndex: "fileExtension",
            key: "fileExtension",
            width: 100
        },
        {
            title: "文件大小",
            dataIndex: "fileSizeText",
            key: "fileSizeText",
            width: 100
        },
        {
            title: "上传人",
            dataIndex: "userName",
            key: "userName",
            width: 200,
            render:(text,record,index)=>{
                if(record.uploadStatus=='uploading'){
                    return <ProgressBar className="uploading" size="sm" active now = {20} />
                }else if(record.uploadStatus=='error'){
                    return <ProgressBar size="sm" active now = {90} />
                }else if(record.uploadStatus=='done'){
                    return decodeURIComponent(getCookie('yonyou_uname'))
                }else{
                    return text;
                }
            }
        },
        {
            title: "上传时间",
            dataIndex: "ctime",
            key: "ctime",
            width: 200,
            render:(text,record,index)=>{
                if(record.uploadStatus=='uploading'){
                    return <span className='upload-status uploading'> <Icon type='uf-loadingstate'/> 正在上传 </span>
                }else if(record.uploadStatus=='error'){
                    return <span className='upload-status error'> <Icon type='uf-exc-c'/>文件上传错误</span>
                }else if(record.uploadStatus=='done'){
                    return dateFormate(new Date(),'yyyy-MM-dd hh:mm')
                }else{
                    return dateFormate(new Date(text),'yyyy-MM-dd hh:mm')
                }
            }
        },
        {
            title: "操作",
            dataIndex: "e",
            key: "e",
            width: 200,
            render:(text,record,index)=>{
                if(record.uploadStatus=='error'){
                    const uploadProps ={
                        name: 'files',
                        action:this.props.url.upload.replace('{id}',this.props.id),
                        onChange:this.fileChange,
                        multiple:true,
                        beforeUpload:this.reUpload,
                        withCredentials:true
                    }
                    return <div className="opt-btns">
                        <Btns
                            type='line'
                            btns={{
                                reupload: {
                                    node:<Upload {...uploadProps}>
                                            <Btns type='line' btns={{ reupload:{} }}/>
                                        </Upload>
                                },
                                delete: {
                                    onClick: ()=>{this.deleteError(record.uid)}
                                },
                            }}
                        />
                    </div>
                }else if(record.uploadStatus=='uploading'){
                    return <div className="opt-btns"></div>
                }else{
                    return <div className="opt-btns">
                        <Btns
                            type='line'
                            btns={{
                                download: {
                                    onClick: this.download
                                },
                                delete: {
                                    onClick: this.delete
                                },
                            }}
                        />
                    </div>
                }
            }
        }];
    }
    componentDidMount(){
        this.props.getListNow&&this.getList()
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.id!=this.state.id){
            this.setState({
                id:nextProps.id
            })
            this.getList({},nextProps.id)
        }
    }

    /**获得文件列表 */
    getList=(pageObj={},propsId)=>{
        let id = propsId||this.props.id;
        if(id){
            let url = this.props.url.list.replace('{id}',this.props.id)
            let params=Object.assign({
                pageSize:this.state.pageSize,
                fileName:'',
                pageNo:this.state.pageNo//从1开始
            },pageObj)
            request(url, {
                method: "get",
                params,
                withCredentials:true
            }).then((res)=>{
                if(res.status==200){
                    if(res.data.data){
                        this.setState({
                            data:res.data.data.reverse(),
                            pageSize:params.pageSize,
                            pageNo:params.pageNo
                        })
                    }
                }
            }).catch(error=>{
                console.error(error)
                console.error(error.message||'Get File Error')
            })
        }
        
    }

    getSelectedDataFunc = (selectedList,record,index) => {
        let ids = []
        selectedList.forEach((item,index) => {
            ids.push(item.id)
        });

        let data = cloneDeep(this.state.data);
        data.forEach((item,index)=>{
            if(ids.indexOf(item.id)==-1){
                item._checked=false
            }else{
                item._checked=true
            }
        })
        this.setState({
            data,
            selectedList
        })    
    };
    /**划过 */
    onRowHover = (index,record) => {
        this.state.hoverData = record;
        this.setState({
            hoverData:record
        })
    }
    /**删除上传失败的文件 */
    deleteError = (uid) => {
        let data = cloneDeep(this.state.data);
        data.forEach((item,index)=>{
            if(item.uid==uid)data.splice(index,1);
        });
        this.setState({
            data
        })
    }
    reUpload=(fileInfo,fileList)=>{
        let data = cloneDeep(this.state.data);
        let uid = this.state.hoverData.uid;
        data.forEach((item,index)=>{
            if(item.uid==uid)data.splice(index,1);
        });
        this.setState({
            data
        },()=>{
            this.beforeUpload(fileInfo,fileList);
        })
    }

    /**下载删除按钮 */
    hoverContent=()=>{
        let hoverData = this.state.hoverData;
        if(hoverData.uploadStatus=='error'){
            const uploadProps ={
                name: 'files',
                action: this.props.url.upload.replace('{id}',this.props.id),
                onChange:this.fileChange,
                multiple:true,
                beforeUpload:this.reUpload,
                withCredentials:true
            }
            return <div className="opt-btns">
                <Btns
                    btns={{
                        reupload: {
                            node:<Upload {...uploadProps}>
                                    <Btns type='line' btns={{ reupload:{} }}/>
                                </Upload>
                        },
                        delete: {
                            onClick: ()=>{this.deleteError(hoverData.uid)}
                        },
                    }}
                />
            </div>
        }else if(hoverData.uploadStatus=='uploading'){
            return <div className="opt-btns"></div>
        }else{
            return <div className="opt-btns">
                <Btns
                    type='line'
                    btns={{
                        download: {
                            onClick: this.download
                        },
                        delete: {
                            onClick: this.deleteConfirm
                        },
                    }}
                />
            </div>
        }
        
    }

    deleteConfirm=()=>{
        this.setState({
            show:true
        })
    }
    cancelFn=()=>{
        this.setState({
            show:false
        })
    }
    
    /**删除 */
    delete=()=>{
        let url = this.props.url.delete.replace('{id}',this.props.id);
        request(url, {
            method: "delete",
            withCredentials:true
        }).then((res)=>{
            if(res.status==200){
                console.log('删除成功');
                this.getList()
                this.setState({
                    show:false
                })
            }
        }).catch(error=>{
            this.setState({
                show:false
            })
            console.error(error);
        })
    }
    download=()=>{
        let url = this.props.url.info.replace('{id}',this.props.id)
        request(url, {
            method: "get",
            withCredentials:true
        }).then((res)=>{
            if(res.status==200){
                window.open(res.data.filePath)
            }
        }).catch(error=>{
            console.error(error)
        })
    }

    // pageIndexChange=(pageNo)=>{
    //     this.getList({
    //         pageNo
    //     })
    // }
    // pageSizeChange=(pageSize)=>{
    //     this.getList({
    //         pageSize
    //     })
    // }


    fileChange=(info)=> {
        let data = cloneDeep(this.state.data);
        
        if (info.file.status !== 'uploading') {

        }
        if (info.file.status === 'done') {
            let id = info.file.response.data[0].id;
            data.forEach(item=>{
                if(item.uid==info.file.uid){
                    item.uploadStatus='done';
                    item.id=id
                }
            });
            this.setState({
                data
            })
            console.log('上传成功')
        }  
        if (info.file.status === 'error') {
            console.error(`${info.file.name} file upload failed.`);
            data.forEach(item=>{
                if(item.uid==info.file.uid){
                    item.uploadStatus='error';
                }
            });
            this.setState({
                data
            })
        }
    }
    beforeUpload=(file,fileList)=>{
        let data = cloneDeep(this.state.data);
        fileList.forEach((fileInfo,index)=>{
            let nameAry = fileInfo.name.split('.');
            let obj = {
                fileExtension:'.'+nameAry[nameAry.length-1],
                fileName:nameAry.splice(0,nameAry.length-1).join('.'),
                fileSizeText:getSize(fileInfo.size),
                uid:fileInfo.uid,
                userName:decodeURIComponent(getCookie('yonyou_uname')),
                uploadStatus:'uploading'
            }
            data.unshift(obj);
        })
        this.setState({
            data
        })
    }
    changeOpenStatus = () => {
        this.setState({
            open: !this.state.open
        })
    }

    render(){
        let { clsfix,id,disabled } = this.props;
        let { data,open } = this.state;
        const uploadProps ={
            withCredentials:true,
            name: 'files',
            action: this.props.url.upload.replace('{id}',this.props.id),
            onChange:this.fileChange,
            multiple:true,
            beforeUpload:this.beforeUpload
        }
        return(
            <div className={clsfix}>
                <div  className={open?`${clsfix}-header`:`${clsfix}-header close`}>
                    <div className={`${clsfix}-text`} onClick={this.changeOpenStatus}>
                        <Icon type={open?'uf-triangle-down':'uf-triangle-right'}></Icon>
                        <span>附件</span>
                    </div>
                    <div className={`${clsfix}-btns`}>
                        {
                            disabled?'':<Btns
                            btns={{
                                upload:{
                                    node:<Upload {...uploadProps}>
                                            <Btns btns={{ upload:{} }}/>
                                        </Upload>
                                },
                            }}
                        />
                        }
                        
                    </div>
                </div>
                <div className={open?`${clsfix}-file-area`:`${clsfix}-file-area hide`}>
                    <AcGrid  
                        columns={this.columns} 
                        data={data} 
                        rowKey={(record,index)=>index}
    
                        // paginationObj={{
                        //     activePage:this.state.pageNo,
                        //     onSelect: this.pageIndexChange,
                        //     onDataNumSelect: this.pageSizeChange,
                        //     maxButton: 5,
                        // }}
                        scroll = {{y:400}}
                        getSelectedDataFunc={this.getSelectedDataFunc}
                        // hoverContent={this.hoverContent}
                        onRowHover={this.onRowHover}
                        multiSelect={false}
                    />
                     
                    {/* <Alert
                        show={this.state.show}
                        confirmFn={this.delete}
                        cancelFn={this.cancelFn}
                    /> */}
                </div>
            </div>
        )
    }
};

FileList.propTypes = propTypes;
FileList.defaultProps = defaultProps;
export default FileList;