"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
//定义接口地址
var URL = function URL(id) {
    return {
        "LIST": "https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/" + id + "/files", //文件列表
        "UPLOAD": "https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/caep/" + id + "/", //上传
        "DELETE": "https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/" + id, //下载 cooperation/rest/v1/file/5d639caaa957bd001936cec9  此处id为附件id
        "INFO": "https://ezone-u8c-daily.yyuap.com/cooperation/rest/v1/file/" + id + "/info/ " //文件信息
    };
};

exports["default"] = URL;
module.exports = exports["default"];