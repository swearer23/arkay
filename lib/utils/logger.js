import chalk from "chalk";

/*
 * @Author: 王志军(wangzhijun01)
 * @Date: 2022-03-15 17:11:16
 * @LastEditTime: 2022-03-15 17:11:16
 * @LastEditors: 王志军(wangzhijun01)
 * @Description:
 */
const logger = {
  info: (msg) => {
    console.log(chalk.green.bold('[arkay info]\t'), msg);
  },
  warn: (msg) => {
    console.log(chalk.yellow.bold('[arkay warn]\t'), msg);
  },
  error: (msg) => {
    console.log(chalk.red.bold('[arkay error]\t'), msg);
  },
  combine: function () {
    let str = "";
    for (let i = 0; i < arguments.length; i++) {
      str += analysisInfo(arguments[i]);
    }
    console.log(str);
  },
};

const analysisInfo = (str) => {
  if (str.substr(0, 6) == "ERROR[") {
    return chalk.red(str.substr(7, str.length - 8));
  } else {
    if (str.substr(0, 5) == "INFO[") {
      return chalk.green(str.substr(6, str.length - 7));
    } else {
      return chalk.yellow(str.substr(6, str.length - 7));
    }
  }
};

export default logger