'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _beeUpload = require('bee-upload');

var _beeUpload2 = _interopRequireDefault(_beeUpload);

var _beeProgressBar = require('bee-progress-bar');

var _beeProgressBar2 = _interopRequireDefault(_beeProgressBar);

var _beeIcon = require('bee-icon');

var _beeIcon2 = _interopRequireDefault(_beeIcon);

var _acGrids = require('ac-grids');

var _acGrids2 = _interopRequireDefault(_acGrids);

var _acBtns = require('ac-btns');

var _acBtns2 = _interopRequireDefault(_acBtns);

var _cloneDeep = require('clone-deep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _utils = require('./utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var propTypes = {
    id: _propTypes2["default"].string.isRequired,
    clsfix: _propTypes2["default"].string,
    disabled: _propTypes2["default"].bool,
    getListNow: _propTypes2["default"].bool, //是否在willmonument时获得文件列表
    url: _propTypes2["default"].object //地址
};

var defaultProps = {
    id: '',
    clsfix: 'ac-upload-list',
    disabled: false,
    getListNow: true,
    url: { // {id} 替换为 props.id
        "list": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/{id}/files', //文件列表
        "upload": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/{id}/', //上传
        "delete": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/{id}', //下载 cooperation/rest/v1/file/5d639caaa957bd001936cec9  此处id为附件id
        "info": 'https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/{id}/info/ ' //文件信息
    }
};

var FileList = function (_Component) {
    _inherits(FileList, _Component);

    function FileList(props) {
        _classCallCheck(this, FileList);

        var _this = _possibleConstructorReturn(this, _Component.call(this, props));

        _this.getList = function () {
            var pageObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var propsId = arguments[1];

            var id = propsId || _this.props.id;
            if (id) {
                var url = _this.props.url.list.replace('{id}', _this.props.id);
                var params = _extends({
                    pageSize: _this.state.pageSize,
                    fileName: '',
                    pageNo: _this.state.pageNo //从1开始
                }, pageObj);
                (0, _axios2["default"])(url, {
                    method: "get",
                    params: params,
                    withCredentials: true
                }).then(function (res) {
                    if (res.status == 200) {
                        if (res.data.data) {
                            _this.setState({
                                data: res.data.data.reverse(),
                                pageSize: params.pageSize,
                                pageNo: params.pageNo
                            });
                        }
                    }
                })["catch"](function (error) {
                    console.error(error);
                    console.error(error.message || 'Get File Error');
                });
            }
        };

        _this.getSelectedDataFunc = function (selectedList, record, index) {
            var ids = [];
            selectedList.forEach(function (item, index) {
                ids.push(item.id);
            });

            var data = (0, _cloneDeep2["default"])(_this.state.data);
            data.forEach(function (item, index) {
                if (ids.indexOf(item.id) == -1) {
                    item._checked = false;
                } else {
                    item._checked = true;
                }
            });
            _this.setState({
                data: data,
                selectedList: selectedList
            });
        };

        _this.onRowHover = function (index, record) {
            _this.state.hoverData = record;
            _this.setState({
                hoverData: record
            });
        };

        _this.deleteError = function (uid) {
            var data = (0, _cloneDeep2["default"])(_this.state.data);
            data.forEach(function (item, index) {
                if (item.uid == uid) data.splice(index, 1);
            });
            _this.setState({
                data: data
            });
        };

        _this.reUpload = function (fileInfo, fileList) {
            var data = (0, _cloneDeep2["default"])(_this.state.data);
            var uid = _this.state.hoverData.uid;
            data.forEach(function (item, index) {
                if (item.uid == uid) data.splice(index, 1);
            });
            _this.setState({
                data: data
            }, function () {
                _this.beforeUpload(fileInfo, fileList);
            });
        };

        _this.hoverContent = function () {
            var hoverData = _this.state.hoverData;
            if (hoverData.uploadStatus == 'error') {
                var uploadProps = {
                    name: 'files',
                    action: _this.props.url.upload.replace('{id}', _this.props.id),
                    onChange: _this.fileChange,
                    multiple: true,
                    beforeUpload: _this.reUpload,
                    withCredentials: true
                };
                return _react2["default"].createElement(
                    'div',
                    { className: 'opt-btns' },
                    _react2["default"].createElement(_acBtns2["default"], {
                        btns: {
                            reupload: {
                                node: _react2["default"].createElement(
                                    _beeUpload2["default"],
                                    uploadProps,
                                    _react2["default"].createElement(_acBtns2["default"], { type: 'line', btns: { reupload: {} } })
                                )
                            },
                            "delete": {
                                onClick: function onClick() {
                                    _this.deleteError(hoverData.uid);
                                }
                            }
                        }
                    })
                );
            } else if (hoverData.uploadStatus == 'uploading') {
                return _react2["default"].createElement('div', { className: 'opt-btns' });
            } else {
                return _react2["default"].createElement(
                    'div',
                    { className: 'opt-btns' },
                    _react2["default"].createElement(_acBtns2["default"], {
                        type: 'line',
                        btns: {
                            download: {
                                onClick: _this.download
                            },
                            "delete": {
                                onClick: _this.deleteConfirm
                            }
                        }
                    })
                );
            }
        };

        _this.deleteConfirm = function () {
            _this.setState({
                show: true
            });
        };

        _this.cancelFn = function () {
            _this.setState({
                show: false
            });
        };

        _this["delete"] = function () {
            var url = _this.props.url["delete"].replace('{id}', _this.props.id);
            (0, _axios2["default"])(url, {
                method: "delete",
                withCredentials: true
            }).then(function (res) {
                if (res.status == 200) {
                    console.log('删除成功');
                    _this.getList();
                    _this.setState({
                        show: false
                    });
                }
            })["catch"](function (error) {
                _this.setState({
                    show: false
                });
                console.error(error);
            });
        };

        _this.download = function () {
            var url = _this.props.url.info.replace('{id}', _this.props.id);
            (0, _axios2["default"])(url, {
                method: "get",
                withCredentials: true
            }).then(function (res) {
                if (res.status == 200) {
                    window.open(res.data.filePath);
                }
            })["catch"](function (error) {
                console.error(error);
            });
        };

        _this.fileChange = function (info) {
            var data = (0, _cloneDeep2["default"])(_this.state.data);

            if (info.file.status !== 'uploading') {}
            if (info.file.status === 'done') {
                var id = info.file.response.data[0].id;
                data.forEach(function (item) {
                    if (item.uid == info.file.uid) {
                        item.uploadStatus = 'done';
                        item.id = id;
                    }
                });
                _this.setState({
                    data: data
                });
                console.log('上传成功');
            }
            if (info.file.status === 'error') {
                console.error(info.file.name + ' file upload failed.');
                data.forEach(function (item) {
                    if (item.uid == info.file.uid) {
                        item.uploadStatus = 'error';
                    }
                });
                _this.setState({
                    data: data
                });
            }
        };

        _this.beforeUpload = function (file, fileList) {
            var data = (0, _cloneDeep2["default"])(_this.state.data);
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
            _this.setState({
                data: data
            });
        };

        _this.changeOpenStatus = function () {
            _this.setState({
                open: !_this.state.open
            });
        };

        _this.state = {
            data: [],
            selectedList: [],
            show: false,
            pageNo: 1,
            pageSize: 999999,
            hoverData: {},
            id: props.id,
            open: true
        };
        _this.columns = [{
            title: "附件名称",
            dataIndex: "fileName",
            key: "fileName",
            className: "rowClassName",
            width: 300,
            render: function render(text, record) {
                return (0, _utils.getFileNames)(text, record.fileExtension);
            }
        }, {
            title: "文件类型",
            dataIndex: "fileExtension",
            key: "fileExtension",
            width: 100
        }, {
            title: "文件大小",
            dataIndex: "fileSizeText",
            key: "fileSizeText",
            width: 100
        }, {
            title: "上传人",
            dataIndex: "userName",
            key: "userName",
            width: 200,
            render: function render(text, record, index) {
                if (record.uploadStatus == 'uploading') {
                    return _react2["default"].createElement(_beeProgressBar2["default"], { className: 'uploading', size: 'sm', active: true, now: 20 });
                } else if (record.uploadStatus == 'error') {
                    return _react2["default"].createElement(_beeProgressBar2["default"], { size: 'sm', active: true, now: 90 });
                } else if (record.uploadStatus == 'done') {
                    return decodeURIComponent((0, _utils.getCookie)('yonyou_uname'));
                } else {
                    return text;
                }
            }
        }, {
            title: "上传时间",
            dataIndex: "ctime",
            key: "ctime",
            width: 200,
            render: function render(text, record, index) {
                if (record.uploadStatus == 'uploading') {
                    return _react2["default"].createElement(
                        'span',
                        { className: 'upload-status uploading' },
                        ' ',
                        _react2["default"].createElement(_beeIcon2["default"], { type: 'uf-loadingstate' }),
                        ' \u6B63\u5728\u4E0A\u4F20 '
                    );
                } else if (record.uploadStatus == 'error') {
                    return _react2["default"].createElement(
                        'span',
                        { className: 'upload-status error' },
                        ' ',
                        _react2["default"].createElement(_beeIcon2["default"], { type: 'uf-exc-c' }),
                        '\u6587\u4EF6\u4E0A\u4F20\u9519\u8BEF'
                    );
                } else if (record.uploadStatus == 'done') {
                    return (0, _utils.dateFormate)(new Date(), 'yyyy-MM-dd hh:mm');
                } else {
                    return (0, _utils.dateFormate)(new Date(text), 'yyyy-MM-dd hh:mm');
                }
            }
        }, {
            title: "操作",
            dataIndex: "e",
            key: "e",
            width: 200,
            render: function render(text, record, index) {
                if (record.uploadStatus == 'error') {
                    var uploadProps = {
                        name: 'files',
                        action: _this.props.url.upload.replace('{id}', _this.props.id),
                        onChange: _this.fileChange,
                        multiple: true,
                        beforeUpload: _this.reUpload,
                        withCredentials: true
                    };
                    return _react2["default"].createElement(
                        'div',
                        { className: 'opt-btns' },
                        _react2["default"].createElement(_acBtns2["default"], {
                            type: 'line',
                            btns: {
                                reupload: {
                                    node: _react2["default"].createElement(
                                        _beeUpload2["default"],
                                        uploadProps,
                                        _react2["default"].createElement(_acBtns2["default"], { type: 'line', btns: { reupload: {} } })
                                    )
                                },
                                "delete": {
                                    onClick: function onClick() {
                                        _this.deleteError(record.uid);
                                    }
                                }
                            }
                        })
                    );
                } else if (record.uploadStatus == 'uploading') {
                    return _react2["default"].createElement('div', { className: 'opt-btns' });
                } else {
                    return _react2["default"].createElement(
                        'div',
                        { className: 'opt-btns' },
                        _react2["default"].createElement(_acBtns2["default"], {
                            type: 'line',
                            btns: {
                                download: {
                                    onClick: _this.download
                                },
                                "delete": {
                                    onClick: _this["delete"]
                                }
                            }
                        })
                    );
                }
            }
        }];
        return _this;
    }

    FileList.prototype.componentDidMount = function componentDidMount() {
        this.props.getListNow && this.getList();
    };

    FileList.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        if (nextProps.id != this.state.id) {
            this.setState({
                id: nextProps.id
            });
            this.getList({}, nextProps.id);
        }
    };

    /**获得文件列表 */

    /**划过 */

    /**删除上传失败的文件 */


    /**下载删除按钮 */


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
        var _props = this.props,
            clsfix = _props.clsfix,
            id = _props.id,
            disabled = _props.disabled;
        var _state = this.state,
            data = _state.data,
            open = _state.open;

        var uploadProps = {
            withCredentials: true,
            name: 'files',
            action: this.props.url.upload.replace('{id}', this.props.id),
            onChange: this.fileChange,
            multiple: true,
            beforeUpload: this.beforeUpload
        };
        return _react2["default"].createElement(
            'div',
            { className: clsfix },
            _react2["default"].createElement(
                'div',
                { className: open ? clsfix + '-header' : clsfix + '-header close' },
                _react2["default"].createElement(
                    'div',
                    { className: clsfix + '-text', onClick: this.changeOpenStatus },
                    _react2["default"].createElement(_beeIcon2["default"], { type: open ? 'uf-triangle-down' : 'uf-triangle-right' }),
                    _react2["default"].createElement(
                        'span',
                        null,
                        '\u9644\u4EF6'
                    )
                ),
                _react2["default"].createElement(
                    'div',
                    { className: clsfix + '-btns' },
                    disabled ? '' : _react2["default"].createElement(_acBtns2["default"], {
                        btns: {
                            upload: {
                                node: _react2["default"].createElement(
                                    _beeUpload2["default"],
                                    uploadProps,
                                    _react2["default"].createElement(_acBtns2["default"], { btns: { upload: {} } })
                                )
                            }
                        }
                    })
                )
            ),
            _react2["default"].createElement(
                'div',
                { className: open ? clsfix + '-file-area' : clsfix + '-file-area hide' },
                _react2["default"].createElement(_acGrids2["default"], {
                    columns: this.columns,
                    data: data,
                    rowKey: function rowKey(record, index) {
                        return index;
                    }

                    // paginationObj={{
                    //     activePage:this.state.pageNo,
                    //     onSelect: this.pageIndexChange,
                    //     onDataNumSelect: this.pageSizeChange,
                    //     maxButton: 5,
                    // }}
                    , scroll: { y: 400 },
                    getSelectedDataFunc: this.getSelectedDataFunc
                    // hoverContent={this.hoverContent}
                    , onRowHover: this.onRowHover,
                    multiSelect: false
                })
            )
        );
    };

    return FileList;
}(_react.Component);

;

FileList.propTypes = propTypes;
FileList.defaultProps = defaultProps;
exports["default"] = FileList;
module.exports = exports['default'];