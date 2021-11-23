'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _cloneDeep = require('clone-deep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _utils = require('./utils.js');

var _i18n = require('./i18n.js');

var _i18n2 = _interopRequireDefault(_i18n);

var _acBtns = require('ac-btns');

var _acBtns2 = _interopRequireDefault(_acBtns);

var _nextUi = require('@tinper/next-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var sort = _nextUi.Table.sort,
    multiSelect = _nextUi.Table.multiSelect;

var ProgressBar = _nextUi.Progress.Bar;

var MultiSelectTable = multiSelect(_nextUi.Table, _nextUi.Checkbox);
var ComplexTable = sort(MultiSelectTable, _nextUi.Icon);
var propTypes = {
    canUnfold: _propTypes2["default"].bool, //是否可以展开收起
    id: _propTypes2["default"].string.isRequired,
    clsfix: _propTypes2["default"].string,
    disabled: _propTypes2["default"].bool,
    getListNow: _propTypes2["default"].bool, //是否在willmonument时获得文件列表
    url: _propTypes2["default"].object, //地址
    uploadProps: _propTypes2["default"].object, //附件上传参数
    powerBtns: _propTypes2["default"].array, //可用按钮集合
    callback: _propTypes2["default"].func, //回调 第一个参数：成功(success)/失败(error)； 第二个参数：list 获得文件列表；delete 删除； upload 上传。 第三个参数：成功信息/错误信息。 第四个参数：null/error对象
    uploadBut: _propTypes2["default"].node, //动态肩部按钮
    lineToolbar: _propTypes2["default"].node, //动态行按钮
    afterGetList: _propTypes2["default"].func, //获取列表后可执行的操作
    vitualDelete: _propTypes2["default"].func, //本地执行删除
    recordActiveRow: _propTypes2["default"].func, //记录当前活动行
    getSelectedDataFunc: _propTypes2["default"].func, //启用多选后
    beforeAct: _propTypes2["default"].func, //执行操作前触发的方法；
    type: _propTypes2["default"].string //使用者类型，mdf cn
};

var defaultProps = {
    id: '',
    clsfix: 'ac-upload-list',
    disabled: false,
    getListNow: false,
    url: { // {id} 替换为 props.id
        "list": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/{id}/files', //文件列表
        "upload": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/{id}/', //上传
        "delete": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/{id}', //下载 cooperation/rest/v1/file/5d639caaa957bd001936cec9  此处id为附件id
        "info": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/{id}/info/ ' //文件信息
    },
    uploadProps: {},
    powerBtns: ['upload', 'reupload', 'download', 'delete', 'confirm', 'cancel'],
    localeCookie: 'locale',
    callback: function callback() {},
    canUnfold: true,
    getSelectedDataFunc: function getSelectedDataFunc() {},
    uploadBut: null,
    lineToolbar: null,
    operationWidth: 200
};

var FileList = function (_Component) {
    _inherits(FileList, _Component);

    function FileList(props) {
        _classCallCheck(this, FileList);

        var _this = _possibleConstructorReturn(this, _Component.call(this, props));

        _initialiseProps.call(_this);

        if (_this.props.type == 'mdf' && window.cb && cb.utils && cb.utils.loadingControl) {
            _this.mdfLoading = cb.utils.loadingControl;
        }
        _this.state = {
            data: [],
            selectedList: [],
            show: false,
            pageNo: 1,
            pageSize: 999999,
            hoverData: {},
            id: props.id,
            open: typeof props.open == 'boolean' ? props.open : true,
            reload: Math.random()
        };
        _this.hoverData = {};
        //兼容低代码
        var local = ['zh_CN', 'zh_TW', 'en_US'].findIndex(function (item) {
            return item == props.localeCookie;
        }) > -1 ? props.localeCookie : 'zh_CN';
        _this.localObj = _this.props.type == 'mdf' ? _i18n2["default"][local] : _i18n2["default"][(0, _utils.getCookie)(props.localeCookie)] || _i18n2["default"]['zh_CN'];
        _this.columns = [{
            title: _this.localObj.fileName,
            dataIndex: "fileName",
            key: "fileName",
            className: "rowClassName",
            width: 300,
            render: function render(text, record) {
                return (0, _utils.getFileNames)(text, record.fileExtension);
            }
        }, {
            title: _this.localObj.fileExtension,
            dataIndex: "fileExtension",
            key: "fileExtension",
            width: 100
        }, {
            title: _this.localObj.fileSize,
            dataIndex: "fileSizeText",
            key: "fileSizeText",
            width: 100
        }, {
            title: _this.localObj.createrUser,
            dataIndex: "userName",
            key: "userName",
            width: 200,
            render: function render(text, record, index) {
                if (record.uploadStatus == 'uploading') {
                    return _react2["default"].createElement(ProgressBar, { className: 'uploading', size: 'sm', active: true, now: 20 });
                } else if (record.uploadStatus == 'error') {
                    return _react2["default"].createElement(ProgressBar, { size: 'sm', active: true, now: 90 });
                } else if (record.uploadStatus == 'done') {
                    return decodeURIComponent((0, _utils.getCookie)('yonyou_uname'));
                } else {
                    return text;
                }
            }
        }, {
            title: _this.localObj.createrTime,
            dataIndex: "ctime",
            key: "ctime",
            width: 200,
            render: function render(text, record, index) {
                if (record.uploadStatus == 'uploading') {
                    return _react2["default"].createElement(
                        'span',
                        { className: 'upload-status uploading' },
                        ' ',
                        _react2["default"].createElement(_nextUi.Icon, { type: 'uf-loadingstate' }),
                        ' ',
                        _this.localObj.uploading,
                        ' '
                    );
                } else if (record.uploadStatus == 'error') {
                    return _react2["default"].createElement(
                        'span',
                        { className: 'upload-status error', title: record.errorMsg || _this.localObj.uploadError },
                        ' ',
                        _react2["default"].createElement(_nextUi.Icon, { type: 'uf-exc-c' }),
                        record.errorMsg || _this.localObj.uploadError
                    );
                } else if (record.uploadStatus == 'done') {
                    return (0, _utils.dateFormate)(new Date(), 'yyyy-MM-dd hh:mm');
                } else {
                    return (0, _utils.dateFormate)(new Date(text), 'yyyy-MM-dd hh:mm');
                }
            }
        }, {
            title: _this.localObj.operation,
            dataIndex: "e",
            key: "e",
            width: props.operationWidth,
            render: function render(text, record, index) {
                if (!_this.props.disabled) {
                    if (record.uploadStatus == 'error') {
                        var uploadP = _extends({
                            name: 'files',
                            action: _this.props.url.upload.replace('{id}', _this.props.id),
                            onChange: _this.fileChange,
                            multiple: true,
                            beforeUpload: _this.reUpload,
                            withCredentials: true
                        }, _this.props.uploadProps);
                        return _react2["default"].createElement(
                            'div',
                            { className: 'opt-btns' },
                            _react2["default"].createElement(_acBtns2["default"], _defineProperty({ localeCookie: _this.props.localeCookie,
                                powerBtns: _this.props.powerBtns,
                                type: 'line',
                                btns: {
                                    reupload: {
                                        node: _react2["default"].createElement(
                                            _nextUi.Upload,
                                            uploadP,
                                            _react2["default"].createElement(_acBtns2["default"], { localeCookie: _this.props.localeCookie,
                                                powerBtns: _this.props.powerBtns,
                                                type: 'line',
                                                btns: { reupload: {} } })
                                        )
                                    },
                                    "delete": {
                                        onClick: function onClick() {
                                            _this.deleteError(record.uid);
                                        }
                                    }
                                }
                            }, 'powerBtns', _this.props.powerBtns))
                        );
                    } else if (record.uploadStatus == 'uploading') {
                        return _react2["default"].createElement('div', { className: 'opt-btns' });
                    } else {
                        return _react2["default"].createElement(
                            'div',
                            { className: 'opt-btns' },
                            _this.props.type == 'mdf' ? _react2["default"].createElement(
                                'div',
                                { className: 'file-list-linetoolbar-container' },
                                _react2["default"].cloneElement(_this.props.lineToolbar, { record: record })
                            ) : _react2["default"].createElement(_acBtns2["default"], { localeCookie: _this.props.localeCookie,
                                type: 'line',
                                btns: {
                                    download: {
                                        onClick: _this.download
                                    },
                                    "delete": {
                                        onClick: _this.deleteConfirm
                                    }
                                },
                                powerBtns: _this.props.powerBtns
                            })
                        );
                    }
                }
            }
        }];
        return _this;
    }

    FileList.prototype.componentDidMount = function componentDidMount() {
        var _props = this.props,
            getChild = _props.getChild,
            getListNow = _props.getListNow;

        getChild && getChild(this);
        getListNow && this.getList();
    };

    FileList.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.id != this.state.id) {
            this.setState({
                id: nextProps.id
            });
            this.getList({}, nextProps.id);
        }
        if (nextProps.getListNow && !this.props.getListNow && nextProps.id && nextProps.id != this.state.id) {
            this.getList({}, nextProps.id);
            this.setState({
                id: nextProps.id
            });
        }
        if (nextProps.reload && nextProps.reload !== this.state.reload) {
            this.getList({}, nextProps.id);
            this.setState({
                reload: nextProps.reload
            });
        }
    };

    /*操作前处理方法*/

    /**获得文件列表 */


    FileList.prototype.formatData = function formatData() {
        var newData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var changeFileInfo = arguments[1];

        if (!changeFileInfo) {
            return [].concat(_toConsumableArray(newData));
        }
        var id = changeFileInfo.response.data && changeFileInfo.response.data.length && changeFileInfo.response.data[0] && changeFileInfo.response.data[0].id;
        var uid = changeFileInfo.uid;
        var data = this.state.data;
        var obj = {};
        if (data && data.length) {
            newData.forEach(function (item) {
                obj[item.id] = item;
            });
            var result = [];
            data.forEach(function (item) {
                if (item.uid === uid) {
                    result.push(obj[id]);
                } else {
                    result.push(item);
                }
            });
            return result;
        }
        return [].concat(_toConsumableArray(newData));
    };
    /**划过 */

    /**删除上传失败的文件 */


    /**删除 */


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


    FileList.prototype.render = function render() {
        var _props2 = this.props,
            clsfix = _props2.clsfix,
            id = _props2.id,
            disabled = _props2.disabled,
            uploadProps = _props2.uploadProps,
            canUnfold = _props2.canUnfold,
            uploadBut = _props2.uploadBut,
            toolbar = _props2.toolbar,
            type = _props2.type,
            title = _props2.title,
            uplaodBtnDisabled = _props2.uplaodBtnDisabled;
        var _state = this.state,
            data = _state.data,
            open = _state.open;

        var uploadP = _extends({
            withCredentials: true,
            name: 'files',
            action: this.props.url.upload.replace('{id}', this.props.id),
            onChange: this.fileChange,
            multiple: true,
            beforeUpload: this.beforeUpload
        }, uploadProps);
        return _react2["default"].createElement(
            'div',
            { className: clsfix },
            _react2["default"].createElement(
                'div',
                { className: open ? clsfix + '-header' : clsfix + '-header close' },
                canUnfold ? _react2["default"].createElement(
                    'div',
                    { className: clsfix + '-text', onClick: this.changeOpenStatus },
                    _react2["default"].createElement(_nextUi.Icon, { type: open ? 'uf-triangle-down' : 'uf-triangle-right' }),
                    _react2["default"].createElement(
                        'span',
                        null,
                        title ? title : this.localObj.file
                    )
                ) : '',
                _react2["default"].createElement(
                    'div',
                    { className: clsfix + '-btns' },
                    disabled ? '' : _react2["default"].createElement(_acBtns2["default"], { localeCookie: this.props.localeCookie,
                        powerBtns: this.props.powerBtns,
                        btns: {
                            upload: {
                                node: _react2["default"].createElement(
                                    'div',
                                    null,
                                    toolbar,
                                    uplaodBtnDisabled && type == 'mdf' ? uploadBut : _react2["default"].createElement(
                                        _nextUi.Upload,
                                        uploadP,
                                        type == 'mdf' ? uploadBut : _react2["default"].createElement(_acBtns2["default"], { localeCookie: this.props.localeCookie, powerBtns: this.props.powerBtns, btns: { upload: {} } })
                                    )
                                )
                            }
                        }
                    })
                )
            ),
            _react2["default"].createElement(
                'div',
                { className: open ? clsfix + '-file-area' : clsfix + '-file-area hide' },
                type == 'mdf' ? _react2["default"].createElement(ComplexTable, {
                    columns: this.columns,
                    data: data,
                    rowKey: function rowKey(record, index) {
                        return index;
                    },
                    scroll: { y: 400 },
                    getSelectedDataFunc: this.getSelectedDataFunc,
                    onRowHover: this.onRowHover,
                    multiSelect: { type: "checkbox" }

                }) : _react2["default"].createElement(_nextUi.Table, {
                    columns: this.columns,
                    data: data,
                    rowKey: function rowKey(record, index) {
                        return index;
                    },
                    scroll: { y: 400 },
                    getSelectedDataFunc: this.getSelectedDataFunc,
                    onRowHover: this.onRowHover

                }),
                _react2["default"].createElement(
                    _nextUi.Modal,
                    {
                        size: 'sm',
                        className: 'pop_dialog',
                        show: this.state.show,
                        onCancel: this.cancelFn },
                    _react2["default"].createElement(
                        _nextUi.Modal.Header,
                        { closeButton: true },
                        _react2["default"].createElement(
                            _nextUi.Modal.Title,
                            null,
                            this.localObj["delete"]
                        )
                    ),
                    _react2["default"].createElement(
                        _nextUi.Modal.Body,
                        { className: 'pop_body' },
                        _react2["default"].createElement(
                            'div',
                            null,
                            _react2["default"].createElement(
                                'span',
                                { 'class': 'keyword' },
                                _react2["default"].createElement('i', { 'class': 'uf uf-exc-c-2 ' }),
                                this.localObj["delete"]
                            ),
                            _react2["default"].createElement(
                                'span',
                                { className: 'pop_dialog-ctn' },
                                this.localObj.delSure
                            )
                        )
                    ),
                    _react2["default"].createElement(
                        _nextUi.Modal.Footer,
                        { className: 'pop_footer' },
                        _react2["default"].createElement(_acBtns2["default"], { localeCookie: this.props.localeCookie,
                            powerBtns: this.props.powerBtns,
                            btns: {
                                confirm: {
                                    onClick: this["delete"]
                                },
                                cancel: {
                                    onClick: this.cancelFn
                                }
                            }
                        })
                    )
                )
            )
        );
    };

    return FileList;
}(_react.Component);

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this._handelBeforeAct = function (type) {
        var data = _this2.state.data;
        var beforeAct = _this2.props.beforeAct;

        var flag = true;
        if (beforeAct) {
            if (!beforeAct(type, data)) {
                flag = false;
            }
        }
        return flag;
    };

    this.getList = function () {
        var pageObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var propsId = arguments[1];
        var changeFileInfo = arguments[2];

        var id = propsId || _this2.props.id;
        var afterGetList = _this2.props.afterGetList;

        if (!_this2._handelBeforeAct('list')) return;
        if (id) {
            _this2.mdfLoading && _this2.mdfLoading.start();
            var url = _this2.props.url.list.replace('{id}', id);
            var params = _extends({
                pageSize: _this2.state.pageSize,
                fileName: '',
                pageNo: _this2.state.pageNo //从1开始
            }, pageObj);
            (0, _axios2["default"])(url, {
                method: "get",
                params: params,
                withCredentials: true
            }).then(function (res) {
                if (res.status == 200) {
                    if (res.data.data) {
                        var list = res.data.data;
                        if (afterGetList) {
                            list = afterGetList(list);
                        }
                        var newList = _this2.formatData(list || [], changeFileInfo);
                        _this2.setState({
                            data: newList,
                            pageSize: params.pageSize,
                            pageNo: params.pageNo
                        });
                    }
                    _this2.props.callback('success', 'list', res);
                    _this2.mdfLoading && _this2.mdfLoading.end();
                } else {
                    _this2.props.callback('error', 'list', null, res);
                    _this2.mdfLoading && _this2.mdfLoading.end();
                }
            })["catch"](function (error) {
                _this2.mdfLoading && _this2.mdfLoading.end();

                _this2.props.callback('error', 'list', null, error);
                console.error(error);
            });
        }
    };

    this.getSelectedDataFunc = function (selectedList, record, index) {
        var ids = [];
        selectedList.forEach(function (item, index) {
            ids.push(item.id);
        });

        var data = (0, _cloneDeep2["default"])(_this2.state.data);
        data.forEach(function (item, index) {
            if (ids.indexOf(item.id) == -1) {
                item._checked = false;
            } else {
                item._checked = true;
            }
        });
        _this2.setState({
            data: data,
            selectedList: selectedList
        }, function () {
            _this2.props.getSelectedDataFunc && _this2.props.getSelectedDataFunc(selectedList, record, index);
        });
    };

    this.onRowHover = function (index, record) {
        var recordActiveRow = _this2.props.recordActiveRow;

        if (recordActiveRow) recordActiveRow(record);
        _this2.hoverData = record;
        _this2.state.hoverData = record;
        _this2.setState({
            hoverData: record
        });
    };

    this.deleteError = function (uid) {
        var data = (0, _cloneDeep2["default"])(_this2.state.data);
        data.forEach(function (item, index) {
            if (item.uid == uid) data.splice(index, 1);
        });
        _this2.setState({
            data: data
        });
    };

    this.reUpload = function (fileInfo, fileList) {
        var data = (0, _cloneDeep2["default"])(_this2.state.data);
        var uid = _this2.state.hoverData.uid;
        data.forEach(function (item, index) {
            if (item.uid == uid) data.splice(index, 1);
        });
        _this2.setState({
            data: data
        }, function () {
            _this2.beforeUpload(fileInfo, fileList);
        });
    };

    this.deleteConfirm = function () {
        _this2.setState({
            show: true
        });
    };

    this.cancelFn = function () {
        _this2.setState({
            show: false
        });
    };

    this["delete"] = function () {
        var vitualDelete = _this2.props.vitualDelete;

        if (!_this2._handelBeforeAct('delete')) return;
        if (vitualDelete && !vitualDelete(_this2.state.hoverData, _this2)) return; //本地删除
        if (_this2.mdfLoading) {
            _this2.mdfLoading.start();
        }
        var rowId = _this2.state.hoverData.id;
        if (!rowId) {
            var data = _this2.state.data;
            var uid = _this2.state.hoverData.uid;
            var selectedRow = data.find(function (item) {
                return item.uid == uid;
            });
            if (selectedRow) {
                rowId = selectedRow.id;
            }
        }
        if (!rowId) {
            _this2.props.callback('error', 'delete', null, '缺少行id');
            _this2.mdfLoading && _this2.mdfLoading.end();
            return;
        }
        var url = _this2.props.url["delete"].replace('{id}', _this2.state.hoverData.id);
        (0, _axios2["default"])(url, {
            method: "delete",
            withCredentials: true
        }).then(function (res) {
            if (_this2.mdfLoading) {
                _this2.mdfLoading.end();
            }
            if (res.status == 200) {
                _this2.props.callback('success', 'delete', res);
                console.log(_this2.localObj['delSuccess']);
                var _data = _this2.state.data;
                var list = _data.filter(function (item) {
                    return item.id !== rowId;
                });
                _this2.setState({
                    data: list,
                    show: false
                }, function () {
                    // this.getList()
                });
            } else {
                _this2.props.callback('error', 'delete', null, res);
            }
        })["catch"](function (error) {
            if (_this2.mdfLoading) {
                _this2.mdfLoading.end();
            }
            _this2.setState({
                show: false
            });
            _this2.props.callback('error', 'delete', null, error);
        });
    };

    this.download = function () {
        if (!_this2._handelBeforeAct('download')) return;
        var url = _this2.props.url.info.replace('{id}', _this2.state.hoverData.id);
        (0, _axios2["default"])(url, {
            method: "get",
            withCredentials: true
        }).then(function (res) {
            if (res.status == 200) {
                window.open(res.data.filePath);
                _this2.props.callback('success', 'download', res);
                console.log(_this2.localObj['downloadSuccess']);
            } else {
                _this2.props.callback('error', 'download', null, res);
            }
        })["catch"](function (error) {
            _this2.props.callback('error', 'download', null, error);
            console.error(error);
        });
    };

    this.fileChange = function (info) {
        var data = (0, _cloneDeep2["default"])(_this2.state.data);
        if (info.file.status !== 'uploading') {}
        if (info.file.status === 'done') {
            // let id = info.file.response.data[0].id;
            // data.forEach(item=>{
            //     if(item.uid==info.file.uid){
            //         item.uploadStatus='done';
            //         item.id=id
            //     }
            // });
            // this.setState({
            //     data
            // })
            _this2.props.callback('success', 'upload', info.file.response);
            console.log(_this2.localObj['uploadSuccess']);
            _this2.getList({}, '', info.file);
        }
        if (info.file.status === 'removed') {
            var response = info.file.response;
            var local = (0, _utils.getCookie)(_this2.props.localeCookie) || 'zh_CN';
            var msg = response && response.displayMessage ? response.displayMessage[local] : '上传出错';
            console.error(info.file.name + ' ' + _this2.localObj['uploadError']);
            _this2.props.callback('error', 'upload', null, info.file.response);
            data.forEach(function (item) {
                if (item.uid == info.file.uid) {
                    item.uploadStatus = 'error';
                    item.errorMsg = msg;
                }
            });
            _this2.setState({
                data: data
            });
        }
    };

    this.beforeUpload = function (file, fileList) {
        var data = (0, _cloneDeep2["default"])(_this2.state.data);
        fileList.forEach(function (fileInfo, index) {
            var nameAry = fileInfo.name.split('.');
            var obj = {
                fileExtension: '.' + nameAry[nameAry.length - 1],
                fileName: nameAry.splice(0, nameAry.length - 1).join('.'),
                fileSizeText: (0, _utils.getSize)(fileInfo.size),
                uid: fileInfo.uid,
                userName: decodeURIComponent((0, _utils.getCookie)('yonyou_uname')),
                uploadStatus: 'uploading'
            };
            data.unshift(obj);
        });
        _this2.setState({
            data: data
        });
    };

    this.changeOpenStatus = function () {
        _this2.setState({
            open: !_this2.state.open
        });
    };
};

;

FileList.propTypes = propTypes;
FileList.defaultProps = defaultProps;
exports["default"] = FileList;
module.exports = exports['default'];